package translate

import "time"

// ─── Cấu hình timeout theo tầng ───────────────────────────────────────────────
const (
	// HTTPClientTimeout: timeout tổng thể của http.Client (connection + toàn bộ response)
	HTTPClientTimeout = 60 * time.Second
	// ChunkTimeout: context timeout riêng cho mỗi lần dịch 1 chunk
	ChunkTimeout = 15 * time.Second
	// TotalRequestTimeout: timeout tối đa cho toàn bộ request đồng bộ (tất cả chunks)
	TotalRequestTimeout = 90 * time.Second
	// MaxChunkRetries: số lần retry tối đa cho mỗi chunk bị lỗi
	MaxChunkRetries = 2
)

// ─── Cấu hình chunking ────────────────────────────────────────────────────────
const (
	// DefaultChunkSize: số ký tự tối đa mỗi chunk (cấu hình qua TRANSLATE_CHUNK_SIZE)
	DefaultChunkSize = 2000
	// SyncLengthLimit: ngưỡng ký tự để quyết định sync vs async
	// len(content) <= SyncLengthLimit → sync, > SyncLengthLimit → async job
	SyncLengthLimit = 3000
)

// ─── Cấu hình cache & retry ───────────────────────────────────────────────────
const (
	// DefaultTTL: thời gian cache kết quả dịch (30 ngày)
	DefaultTTL = 30 * 24 * time.Hour
	// AsyncJobTTL: thời gian lưu kết quả async job trong DB
	AsyncJobTTL = 24 * time.Hour
	// MaxRetries: số lần retry toàn bộ request khi gọi NVIDIA API thất bại
	MaxRetries = 3
	// MaxConcurrency: số goroutine song song tối đa khi xử lý chunks
	MaxConcurrency = 5
)

// ─── Request/Response structs ─────────────────────────────────────────────────

// TranslateRequest là đầu vào cho POST /api/translate
type TranslateRequest struct {
	Content    string `json:"content"`
	TargetLang string `json:"target_lang"`
	SourceLang string `json:"source_lang,omitempty"`
}

// TranslateResponse là đầu ra từ POST /api/translate
type TranslateResponse struct {
	TranslatedText string `json:"translated_text"`
	SourceLang     string `json:"source_lang"`
	FromCache      bool   `json:"from_cache"`
	// Partial = true nếu ≥1 chunk dịch thất bại và đã fallback về nội dung gốc ở chunk đó
	Partial bool   `json:"partial,omitempty"`
	Error   string `json:"error,omitempty"`
	// JobID và Status được điền khi backend chuyển sang chế độ async
	JobID  string `json:"job_id,omitempty"`
	Status string `json:"status,omitempty"`
}

// BatchTranslateRequest là đầu vào cho POST /api/translate/batch
type BatchTranslateRequest struct {
	Items []TranslateRequest `json:"items"`
}

// BatchTranslateResponse là đầu ra từ POST /api/translate/batch
type BatchTranslateResponse struct {
	Results []TranslateResponse `json:"results"`
}

// ─── Async Job types ──────────────────────────────────────────────────────────

// JobStatus liệt kê các trạng thái của async job
type JobStatus string

const (
	JobPending    JobStatus = "pending"
	JobProcessing JobStatus = "processing"
	JobDone       JobStatus = "done"
	JobFailed     JobStatus = "failed"
)

// AsyncJobResponse là response trả ngay khi tạo async job (HTTP 202)
type AsyncJobResponse struct {
	JobID  string    `json:"job_id"`
	Status JobStatus `json:"status"`
}

// AsyncJobResult là kết quả đầy đủ của một async job (dùng cho polling)
type AsyncJobResult struct {
	JobID          string    `json:"job_id"`
	Status         JobStatus `json:"status"`
	TranslatedText string    `json:"translated_text,omitempty"`
	Partial        bool      `json:"partial,omitempty"`
	Error          string    `json:"error,omitempty"`
}
