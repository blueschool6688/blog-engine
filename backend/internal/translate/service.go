package translate

import (
	"context"
	"regexp"
	"strings"
	"sync"
	"time"
	"unicode/utf8"

	"backend/pkg/logger"

	"golang.org/x/sync/errgroup"
)

// sentenceSplitRe là regex tách câu: dấu kết thúc câu (.!?…) theo sau bởi khoảng trắng/xuống dòng.
// Hỗ trợ cả tiếng Việt và tiếng Anh vì dùng cùng dấu câu Latin.
var sentenceSplitRe = regexp.MustCompile(`([.!?…]+[\s\n]+|[.!?…]+$)`)

// Service chứa business logic của tính năng dịch thuật.
type Service struct {
	client    TranslatorClient // interface — dễ mock trong unit test
	cache     TranslateCache
	log       *logger.Logger
	chunkSize int      // từ env TRANSLATE_CHUNK_SIZE, default DefaultChunkSize (2000)
	jobStore  JobStore // nil nếu không có async job queue
}

// NewService tạo một Service mới.
// chunkSize = 0 sẽ dùng DefaultChunkSize.
// jobStore = nil thì tính năng async không khả dụng.
func NewService(client TranslatorClient, cache TranslateCache, log *logger.Logger, chunkSize int, jobStore JobStore) *Service {
	if chunkSize <= 0 {
		chunkSize = DefaultChunkSize
	}
	return &Service{
		client:    client,
		cache:     cache,
		log:       log,
		chunkSize: chunkSize,
		jobStore:  jobStore,
	}
}

// log wrapper sử dụng nil-safe (không panic nếu s.log == nil)
func (s *Service) logInfo(format string, v ...interface{}) {
	if s.log != nil {
		s.log.Info(format, v...)
	}
}
func (s *Service) logError(format string, v ...interface{}) {
	if s.log != nil {
		s.log.Error(format, v...)
	}
}

// HasJobStore trả về true nếu async job store được cấu hình.
func (s *Service) HasJobStore() bool {
	return s.jobStore != nil
}

// CreateAsyncJob tạo một async job và trả về job_id ngay lập tức.
func (s *Service) CreateAsyncJob(ctx context.Context, req TranslateRequest) (string, error) {
	return s.jobStore.CreateJob(ctx, req)
}

// GetAsyncJob lấy trạng thái và kết quả của một async job.
func (s *Service) GetAsyncJob(ctx context.Context, jobID string) (*AsyncJobResult, error) {
	return s.jobStore.GetJob(ctx, jobID)
}

// ProcessNextJob lấy job pending tiếp theo từ queue và xử lý.
// Dùng bởi worker process. Trả về (true, nil) nếu đã xử lý 1 job.
func (s *Service) ProcessNextJob(ctx context.Context) (bool, error) {
	job, err := s.jobStore.ClaimNextJob(ctx)
	if err != nil {
		return false, err
	}
	if job == nil {
		return false, nil // Không có job nào
	}

	s.log.Info("[translate-worker] Claimed job job_id=%s content_len=%d\n", job.JobID, len(job.Content))

	// Dịch với timeout TotalRequestTimeout (90s)
	jobCtx, cancel := context.WithTimeout(ctx, TotalRequestTimeout)
	defer cancel()

	result := s.Translate(jobCtx, TranslateRequest{
		Content:    job.Content,
		TargetLang: job.TargetLang,
		SourceLang: job.SourceLang,
	})

	jobResult := AsyncJobResult{
		JobID:          job.JobID,
		TranslatedText: result.TranslatedText,
		Partial:        result.Partial,
	}

	if result.Error != "" {
		jobResult.Status = JobFailed
		jobResult.Error = result.Error
		s.log.Error("[translate-worker] Job FAILED job_id=%s err=%s\n", job.JobID, result.Error)
	} else {
		jobResult.Status = JobDone
		s.log.Info("[translate-worker] Job DONE job_id=%s partial=%v\n", job.JobID, result.Partial)
	}

	if err := s.jobStore.UpdateJobResult(ctx, job.JobID, jobResult); err != nil {
		return true, err
	}
	return true, nil
}

// Translate dịch một đoạn nội dung đơn lẻ.
// Logic:
//  1. source_lang == target_lang → bỏ qua
//  2. Kiểm tra cache
//  3. ChunkContent → nếu nhiều chunks → translateChunked (song song, per-chunk timeout 15s)
//  4. Gọi API → lưu cache → trả về kết quả
//  5. Nếu API lỗi → fallback trả về nội dung gốc
func (s *Service) Translate(ctx context.Context, req TranslateRequest) TranslateResponse {
	start := time.Now()

	if strings.TrimSpace(req.Content) == "" {
		return TranslateResponse{TranslatedText: req.Content, SourceLang: req.SourceLang}
	}

	// Bỏ qua nếu source và target cùng ngôn ngữ
	if req.SourceLang != "" && req.SourceLang == req.TargetLang {
		return TranslateResponse{TranslatedText: req.Content, SourceLang: req.SourceLang}
	}

	key := makeCacheKey(req.Content, req.TargetLang)

	// Kiểm tra cache trước
	if cached, ok := s.cache.Get(ctx, key); ok {
		s.logInfo("[translate] CACHE HIT key=%.20s... elapsed=%s\n", key, time.Since(start))
		return TranslateResponse{
			TranslatedText: cached,
			SourceLang:     req.SourceLang,
			FromCache:      true,
		}
	}

	// Cache miss → chia chunk và dịch
	chunks := ChunkContent(req.Content, s.chunkSize)
	s.logInfo("[translate] CACHE MISS chunks=%d content_len=%d target=%s\n",
		len(chunks), len(req.Content), req.TargetLang)

	var (
		translated string
		isPartial  bool
		err        error
	)

	if len(chunks) == 1 {
		// Nội dung ngắn — gọi trực tiếp với per-chunk timeout
		chunkCtx, cancel := context.WithTimeout(ctx, ChunkTimeout)
		defer cancel()
		translated, err = s.translateChunkWithRetry(chunkCtx, chunks[0], req.TargetLang, req.SourceLang)
	} else {
		// Nội dung dài — dịch song song
		translated, isPartial, err = s.translateChunked(ctx, chunks, req.TargetLang, req.SourceLang)
	}

	elapsed := time.Since(start)

	if err != nil {
		s.logError("[translate] API ERROR chunks=%d elapsed=%s err=%v\n", len(chunks), elapsed, err)
		return TranslateResponse{
			TranslatedText: req.Content,
			SourceLang:     req.SourceLang,
			Error:          err.Error(),
		}
	}

	s.logInfo("[translate] API SUCCESS chunks=%d elapsed=%s partial=%v\n", len(chunks), elapsed, isPartial)

	// Lưu vào cache chỉ khi không partial (kết quả hoàn chỉnh)
	if !isPartial {
		s.cache.Set(ctx, key, translated, DefaultTTL)
	}

	return TranslateResponse{
		TranslatedText: translated,
		SourceLang:     req.SourceLang,
		FromCache:      false,
		Partial:        isPartial,
	}
}

// translateChunked dịch nhiều chunks song song với giới hạn MaxConcurrency goroutine.
// Mỗi chunk có context riêng ChunkTimeout (15s) và retry MaxChunkRetries (2) lần.
// Nếu 1 chunk vẫn lỗi sau retry → giữ nguyên chunk gốc, đánh dấu partial = true.
// Kết quả được ghép lại theo đúng thứ tự ban đầu (không theo thứ tự hoàn thành goroutine).
func (s *Service) translateChunked(ctx context.Context, chunks []string, targetLang, sourceLang string) (string, bool, error) {
	results := make([]string, len(chunks))
	partials := make([]bool, len(chunks))
	sem := make(chan struct{}, MaxConcurrency)
	var mu sync.Mutex

	g, gctx := errgroup.WithContext(ctx)

	for i, chunk := range chunks {
		i, chunk := i, chunk // capture loop variables
		g.Go(func() error {
			sem <- struct{}{}
			defer func() { <-sem }()

			// Tạo context riêng cho chunk này với timeout ChunkTimeout (15s)
			chunkCtx, cancel := context.WithTimeout(gctx, ChunkTimeout)
			defer cancel()

			translated, err := s.translateChunkWithRetry(chunkCtx, chunk, targetLang, sourceLang)
			mu.Lock()
			defer mu.Unlock()

			if err != nil {
				// Chunk lỗi → giữ nguyên chunk gốc, đánh dấu partial
				s.logError("[translate] CHUNK ERROR idx=%d err=%v (fallback to original)\n", i, err)
				results[i] = chunk
				partials[i] = true
			} else {
				results[i] = translated
			}
			return nil // Không fail toàn bộ batch khi 1 chunk lỗi
		})
	}

	if err := g.Wait(); err != nil {
		return "", false, err
	}

	// Kiểm tra xem có chunk nào partial không
	isPartial := false
	for _, p := range partials {
		if p {
			isPartial = true
			break
		}
	}

	return strings.Join(results, "\n\n"), isPartial, nil
}

// translateChunkWithRetry dịch một chunk với retry MaxChunkRetries (2) lần.
// Dùng cùng context (per-chunk context timeout 15s).
func (s *Service) translateChunkWithRetry(ctx context.Context, chunk, targetLang, sourceLang string) (string, error) {
	var lastErr error
	for attempt := 0; attempt <= MaxChunkRetries; attempt++ {
		// Check context trước mỗi lần thử
		select {
		case <-ctx.Done():
			return "", ctx.Err()
		default:
		}

		result, err := s.client.Translate(ctx, chunk, targetLang, sourceLang)
		if err == nil {
			return result, nil
		}
		lastErr = err
	}
	return "", lastErr
}

// ChunkContent chia nội dung thành các chunks ≤ maxChars ký tự.
// Thuật toán (ưu tiên theo thứ tự):
//  1. Split theo "\n\n" (ranh giới đoạn văn)
//  2. Nếu 1 đoạn > maxChars → chia tiếp theo ranh giới câu (.!?…)
//  3. Nếu 1 câu đơn lẻ > maxChars → cắt cứng theo UTF-8 boundary
//  4. Merge các đoạn nhỏ liên tiếp vào cùng chunk nếu tổng < maxChars
//
// Hàm này được export để dễ unit test độc lập.
func ChunkContent(content string, maxChars int) []string {
	if maxChars <= 0 {
		maxChars = DefaultChunkSize
	}

	// Nếu nội dung đủ ngắn → trả về nguyên vẹn
	if len(content) <= maxChars {
		return []string{content}
	}

	// Bước 1: tách theo đoạn văn
	paragraphs := strings.Split(content, "\n\n")

	// Bước 2 & 3: xử lý từng đoạn, tách thêm nếu cần
	var segments []string
	for _, para := range paragraphs {
		if len(para) <= maxChars {
			segments = append(segments, para)
		} else {
			// Đoạn quá dài → tách theo câu
			sents := splitBySentence(para, maxChars)
			segments = append(segments, sents...)
		}
	}

	// Bước 4: merge các segment nhỏ liên tiếp
	return mergeSmallSegments(segments, maxChars)
}

// splitBySentence chia một đoạn văn theo ranh giới câu.
// Nếu câu đơn lẻ vẫn > maxChars → cắt cứng theo UTF-8 boundary.
func splitBySentence(para string, maxChars int) []string {
	// Tìm tất cả vị trí kết thúc câu
	indices := sentenceSplitRe.FindAllStringIndex(para, -1)
	if len(indices) == 0 {
		// Không có dấu câu → cắt cứng
		return hardSplit(para, maxChars)
	}

	var sentences []string
	prev := 0
	for _, idx := range indices {
		end := idx[1]
		sentence := para[prev:end]
		if len(sentence) > 0 {
			sentences = append(sentences, strings.TrimSpace(sentence))
		}
		prev = end
	}
	// Phần còn lại sau dấu câu cuối
	if prev < len(para) {
		tail := strings.TrimSpace(para[prev:])
		if len(tail) > 0 {
			sentences = append(sentences, tail)
		}
	}

	// Kiểm tra từng câu, cắt cứng nếu vẫn quá dài
	var result []string
	for _, s := range sentences {
		if len(s) > maxChars {
			result = append(result, hardSplit(s, maxChars)...)
		} else if len(s) > 0 {
			result = append(result, s)
		}
	}
	return result
}

// hardSplit cắt cứng chuỗi theo maxChars, tôn trọng UTF-8 rune boundary.
func hardSplit(s string, maxChars int) []string {
	var chunks []string
	for len(s) > 0 {
		if len(s) <= maxChars {
			chunks = append(chunks, s)
			break
		}
		// Tìm rune boundary gần nhất ≤ maxChars
		cutAt := maxChars
		for cutAt > 0 && !utf8.RuneStart(s[cutAt]) {
			cutAt--
		}
		if cutAt == 0 {
			cutAt = maxChars // Safety: nếu không tìm được thì cắt cứng
		}
		chunks = append(chunks, s[:cutAt])
		s = s[cutAt:]
	}
	return chunks
}

// mergeSmallSegments gộp các segment nhỏ liên tiếp lại nếu tổng kích thước < maxChars.
// Dùng "\n\n" làm dấu phân cách khi merge.
func mergeSmallSegments(segments []string, maxChars int) []string {
	if len(segments) == 0 {
		return nil
	}

	var result []string
	current := segments[0]

	for _, seg := range segments[1:] {
		// +2 cho "\n\n"
		if len(current)+2+len(seg) <= maxChars {
			current += "\n\n" + seg
		} else {
			result = append(result, current)
			current = seg
		}
	}
	result = append(result, current)
	return result
}
