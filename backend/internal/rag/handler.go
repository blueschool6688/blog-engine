package rag

import (
	"backend/internal/nvidia"
	"backend/internal/shared/response"
	"backend/pkg/config"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type Handler struct {
	db     *gorm.DB
	client *nvidia.Client
	cfg    *config.Config
}

func NewHandler(db *gorm.DB, client *nvidia.Client, cfg *config.Config) *Handler {
	return &Handler{
		db:     db,
		client: client,
		cfg:    cfg,
	}
}

type ChatRequest struct {
	Question string `json:"question"`
}

type SourceInfo struct {
	ID    uint   `json:"id"`
	Title string `json:"title"`
	Slug  string `json:"slug"`
}

type ChatResponse struct {
	Answer  string       `json:"answer"`
	Sources []SourceInfo `json:"sources"`
}

func (h *Handler) Chat(c *fiber.Ctx) error {
	var req ChatRequest
	if err := c.BodyParser(&req); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid request body", err.Error())
	}

	if req.Question == "" {
		return response.Error(c, fiber.StatusBadRequest, "Question is required", nil)
	}

	fingerprint := buildFingerprint(c)

	// Save user message
	userMsg := ChatMessage{
		Fingerprint: fingerprint,
		Role:        "user",
		Content:     req.Question,
	}
	_ = h.db.Create(&userMsg).Error


	// Try vector search first (if Nvidia Embed works and pgvector is supported)
	var results []struct {
		PostID     uint
		ChunkIndex int
		Content    string
		Distance   float32
	}
	var searchSuccess bool

	emb, err := h.client.Embed(c.UserContext(), req.Question)
	if err == nil {
		embStr := formatVector(emb)
		topK := h.cfg.RagTopK
		if topK == 0 {
			topK = 5
		}
		// Try pgvector query (using silent logger to prevent expected errors when pgvector is missing)
		err = h.db.Session(&gorm.Session{Logger: h.db.Logger.LogMode(logger.Silent)}).Raw(`
			SELECT post_id, chunk_index, content, embedding <=> ?::vector AS distance
			FROM blog_chunks
			ORDER BY distance ASC
			LIMIT ?
		`, embStr, topK).Scan(&results).Error
		if err == nil {
			searchSuccess = true
		}
	}

	// Fallback to text keyword search if vector search failed (either API error or DB lacking pgvector)
	if !searchSuccess {
		words := strings.Fields(req.Question)
		var queryParts []string
		var queryArgs []interface{}
		for _, w := range words {
			if len(w) > 2 { // filter out short words
				queryParts = append(queryParts, "content ILIKE ?")
				queryArgs = append(queryArgs, "%"+w+"%")
			}
		}

		topK := h.cfg.RagTopK
		if topK == 0 {
			topK = 5
		}

		var textQueryErr error
		if len(queryParts) > 0 {
			textQueryErr = h.db.Table("blog_chunks").
				Select("post_id, chunk_index, content, 0.0 as distance").
				Where(strings.Join(queryParts, " OR "), queryArgs...).
				Limit(topK).
				Scan(&results).Error
		} else {
			textQueryErr = h.db.Table("blog_chunks").
				Select("post_id, chunk_index, content, 0.0 as distance").
				Order("created_at DESC").
				Limit(topK).
				Scan(&results).Error
		}

		if textQueryErr != nil {
			return response.Error(c, fiber.StatusInternalServerError, "Database error during text fallback search", textQueryErr.Error())
		}
	}

	var contexts []string
	sourcesMap := make(map[uint]bool)
	var sources []uint

	for _, res := range results {
		// Only check distance threshold if we actually performed vector search
		if searchSuccess && res.Distance > 0.6 {
			continue
		}
		contexts = append(contexts, res.Content)
		if !sourcesMap[res.PostID] {
			sourcesMap[res.PostID] = true
			sources = append(sources, res.PostID)
		}
	}

	var sysPrompt string
	var contextStr string
	currentTime := time.Now().Local().Format("15:04:05, Thứ Hai, ngày 02/01/2006")

	if len(contexts) == 0 {
		sysPrompt = fmt.Sprintf(`Bạn là trợ lý AI thân thiện hỗ trợ người đọc blog. (Thời gian hệ thống hiện tại: %s).
Trả lời câu hỏi giao tiếp xã giao hoặc thông tin chung của người dùng một cách tự nhiên, ngắn gọn và lịch sự (ví dụ: chào hỏi, hỏi giờ giấc, hỏi thăm). 
Nếu họ hỏi kiến thức chuyên sâu nằm ngoài nội dung blog, hãy trả lời lịch sự và hướng dẫn họ hỏi các câu hỏi liên quan đến nội dung, các bài viết công nghệ trên blog.`, currentTime)
	} else {
		contextStr = strings.Join(contexts, "\n\n---\n\n")
		sysPrompt = fmt.Sprintf(`Bạn là trợ lý AI hữu ích hỗ trợ đọc blog. (Thời gian hệ thống hiện tại: %s).
Dựa vào thông tin ngữ cảnh dưới đây để trả lời câu hỏi của người dùng một cách chính xác.
Nếu thông tin ngữ cảnh không đủ để trả lời, hãy nói rõ rằng thông tin này không có trong tài liệu của blog, và bạn có thể trả lời ngắn gọn dựa trên hiểu biết chung của bạn nhưng ghi chú rõ đây là thông tin ngoài tài liệu blog để tham khảo.

Ngữ cảnh:
%s`, currentTime, contextStr)
	}

	answer, err := h.client.ChatComplete(c.UserContext(), sysPrompt, req.Question)
	if err != nil {
		if len(contexts) > 0 {
			answer = "Tôi nhận thấy có lỗi kết nối với AI Hub, nhưng dưới đây là các tài liệu liên quan tôi tìm thấy trên blog: \n\n" + contextStr
		} else {
			answer = "Hiện tại tôi không thể kết nối tới AI Hub và không tìm thấy tài liệu liên quan nào trên blog để hiển thị."
		}
	}

	var sourceInfos []SourceInfo
	if len(sources) > 0 {
		h.db.Table("posts").
			Select("id, title, slug").
			Where("id IN ?", sources).
			Scan(&sourceInfos)
	}

	// Save bot response
	botMsg := ChatMessage{
		Fingerprint: fingerprint,
		Role:        "bot",
		Content:     answer,
	}
	_ = h.db.Create(&botMsg).Error

	return response.Success(c, fiber.StatusOK, ChatResponse{
		Answer:  answer,
		Sources: sourceInfos,
	}, "Success")
}

// ── RAG Chat History & Admin API Helpers ──────────────────────────────────────

func buildFingerprint(c *fiber.Ctx) string {
	ip := c.IP()
	ua := c.Get("User-Agent")
	hasher := sha256.New()
	hasher.Write([]byte(ip + ua))
	return hex.EncodeToString(hasher.Sum(nil))
}

func (h *Handler) GetHistory(c *fiber.Ctx) error {
	fingerprint := buildFingerprint(c)
	var messages []ChatMessage
	err := h.db.Where("fingerprint = ?", fingerprint).Order("id asc").Find(&messages).Error
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to retrieve chat history", err.Error())
	}
	return response.Success(c, fiber.StatusOK, messages, "Success")
}

type Conversation struct {
	Fingerprint  string    `json:"fingerprint"`
	MessageCount int       `json:"message_count"`
	LastActive   time.Time `json:"last_active"`
}

func (h *Handler) ListConversations(c *fiber.Ctx) error {
	var conversations []Conversation
	err := h.db.Raw(`
		SELECT fingerprint, COUNT(*) as message_count, MAX(created_at) as last_active
		FROM chat_messages
		GROUP BY fingerprint
		ORDER BY last_active DESC
	`).Scan(&conversations).Error
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to list conversations", err.Error())
	}
	return response.Success(c, fiber.StatusOK, conversations, "Success")
}

func (h *Handler) GetConversationMessages(c *fiber.Ctx) error {
	fingerprint := c.Params("fingerprint")
	var messages []ChatMessage
	err := h.db.Where("fingerprint = ?", fingerprint).Order("id asc").Find(&messages).Error
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to retrieve conversation logs", err.Error())
	}
	return response.Success(c, fiber.StatusOK, messages, "Success")
}
