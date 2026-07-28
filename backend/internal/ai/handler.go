package ai

import (
	"context"
	"time"

	"backend/internal/aigenerate"
	"backend/internal/shared/response"

	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	aiGenerateSvc *aigenerate.Service
}

func NewHandler(aiGenerateSvc *aigenerate.Service) *Handler {
	return &Handler{
		aiGenerateSvc: aiGenerateSvc,
	}
}

type generatePostRequest struct {
	Topic string `json:"topic"`
}

type summarizeRequest struct {
	Content  string `json:"content"`
	Language string `json:"language"` // "vi", "en", "both"
	MaxWords int    `json:"max_words"`
}

type extractKeywordsRequest struct {
	Content  string `json:"content"`
	Language string `json:"language"`
}

type scoreSEORequest struct {
	Title    string `json:"title"`
	MetaDesc string `json:"meta_desc"`
	Content  string `json:"content"`
}

type generateAltTextRequest struct {
	ImageURL string `json:"image_url"`
	Context  string `json:"context"`
}

type analyzeSentimentRequest struct {
	Content string `json:"content"`
	Author  string `json:"author"`
}

// GeneratePost handles POST /api/ai/generate-post
func (h *Handler) GeneratePost(c *fiber.Ctx) error {
	var req generatePostRequest
	if err := c.BodyParser(&req); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid request body", err.Error())
	}

	if req.Topic == "" {
		return response.Error(c, fiber.StatusBadRequest, "Topic is required", nil)
	}

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	// 3-minute timeout for content generation
	ctx, cancel := context.WithTimeout(ctx, 3*time.Minute)
	defer cancel()

	post, err := h.aiGenerateSvc.GeneratePost(ctx, req.Topic)
	if err != nil {
		return response.Error(c, fiber.StatusBadGateway, "AI Post Generation failed", err.Error())
	}

	return response.Success(c, fiber.StatusOK, post, "Post generated successfully")
}

func (h *Handler) Summarize(c *fiber.Ctx) error {
	var req summarizeRequest
	if err := c.BodyParser(&req); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid request body", err.Error())
	}

	if req.Content == "" {
		return response.Error(c, fiber.StatusBadRequest, "Content is required", nil)
	}

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	ctx, cancel := context.WithTimeout(ctx, 1*time.Minute)
	defer cancel()

	summary, err := h.aiGenerateSvc.GenerateSummary(ctx, req.Content, req.Language, req.MaxWords)
	if err != nil {
		return response.Error(c, fiber.StatusBadGateway, "AI Summarization failed", err.Error())
	}

	return response.Success(c, fiber.StatusOK, summary, "Content summarized successfully")
}

// ExtractKeywords handles POST /api/ai/keywords
func (h *Handler) ExtractKeywords(c *fiber.Ctx) error {
	var req extractKeywordsRequest
	if err := c.BodyParser(&req); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid request body", err.Error())
	}
	if req.Content == "" {
		return response.Error(c, fiber.StatusBadRequest, "Content is required", nil)
	}

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}
	ctx, cancel := context.WithTimeout(ctx, 1*time.Minute)
	defer cancel()

	keywords, err := h.aiGenerateSvc.ExtractKeywords(ctx, req.Content, req.Language)
	if err != nil {
		return response.Error(c, fiber.StatusBadGateway, "AI ExtractKeywords failed", err.Error())
	}

	return response.Success(c, fiber.StatusOK, fiber.Map{"keywords": keywords}, "Keywords extracted successfully")
}

// ScoreSEO handles POST /api/ai/seo-score
func (h *Handler) ScoreSEO(c *fiber.Ctx) error {
	var req scoreSEORequest
	if err := c.BodyParser(&req); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid request body", err.Error())
	}

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}
	ctx, cancel := context.WithTimeout(ctx, 1*time.Minute)
	defer cancel()

	result, err := h.aiGenerateSvc.ScoreSEO(ctx, req.Title, req.MetaDesc, req.Content)
	if err != nil {
		return response.Error(c, fiber.StatusBadGateway, "AI ScoreSEO failed", err.Error())
	}

	return response.Success(c, fiber.StatusOK, result, "SEO scored successfully")
}

// GenerateAltText handles POST /api/ai/alt-text
func (h *Handler) GenerateAltText(c *fiber.Ctx) error {
	var req generateAltTextRequest
	if err := c.BodyParser(&req); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid request body", err.Error())
	}
	if req.ImageURL == "" {
		return response.Error(c, fiber.StatusBadRequest, "Image URL is required", nil)
	}

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}
	ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	altText, err := h.aiGenerateSvc.GenerateAltText(ctx, req.ImageURL, req.Context)
	if err != nil {
		return response.Error(c, fiber.StatusBadGateway, "AI GenerateAltText failed", err.Error())
	}

	return response.Success(c, fiber.StatusOK, fiber.Map{"alt_text": altText}, "Alt text generated successfully")
}

// AnalyzeSentiment handles POST /api/ai/sentiment
func (h *Handler) AnalyzeSentiment(c *fiber.Ctx) error {
	var req analyzeSentimentRequest
	if err := c.BodyParser(&req); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid request body", err.Error())
	}
	if req.Content == "" {
		return response.Error(c, fiber.StatusBadRequest, "Content is required", nil)
	}

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}
	ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	result, err := h.aiGenerateSvc.AnalyzeSentiment(ctx, req.Author, req.Content)
	if err != nil {
		return response.Error(c, fiber.StatusBadGateway, "AI AnalyzeSentiment failed", err.Error())
	}

	return response.Success(c, fiber.StatusOK, result, "Sentiment analyzed successfully")
}

