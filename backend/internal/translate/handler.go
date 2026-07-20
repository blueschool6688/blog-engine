package translate

import (
	"context"
	"fmt"
	"sync"

	"backend/internal/shared/response"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/sync/errgroup"
)


// Handler xử lý HTTP request cho tính năng dịch thuật.
type Handler struct {
	svc *Service
}

// NewHandler tạo một Handler mới.
func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

// Translate xử lý POST /api/translate
//
// Tự động chọn chế độ xử lý:
//   - len(content) <= SyncLengthLimit (3000 chars) → đồng bộ, trả kết quả ngay
//   - len(content) > SyncLengthLimit → async, trả job_id ngay (HTTP 202)
func (h *Handler) Translate(c *fiber.Ctx) error {
	var req TranslateRequest
	if err := c.BodyParser(&req); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid request body", err.Error())
	}

	if err := validateTranslateRequest(req); err != nil {
		return response.Error(c, fiber.StatusBadRequest, err.Error(), nil)
	}

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	// Auto-route: nội dung dài → async (nếu job store được cấu hình)
	if len(req.Content) > SyncLengthLimit && h.svc.HasJobStore() {
		jobID, err := h.svc.CreateAsyncJob(ctx, req)
		if err != nil {
			return response.Error(c, fiber.StatusInternalServerError, "Failed to create translation job", err.Error())
		}
		return response.Success(c, fiber.StatusAccepted, AsyncJobResponse{
			JobID:  jobID,
			Status: JobPending,
		}, "Translation job queued")
	}

	// Sync: dịch trực tiếp với total timeout 90s
	syncCtx, cancel := context.WithTimeout(ctx, TotalRequestTimeout)
	defer cancel()

	result := h.svc.Translate(syncCtx, req)

	if result.Error != "" {
		return response.Error(c, fiber.StatusBadGateway, "Translation service unavailable", result.Error)
	}

	return response.Success(c, fiber.StatusOK, result, "Translation successful")
}

// TranslateAsync xử lý POST /api/translate/async
// Luôn tạo async job bất kể độ dài content (không auto-route).
func (h *Handler) TranslateAsync(c *fiber.Ctx) error {
	var req TranslateRequest
	if err := c.BodyParser(&req); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid request body", err.Error())
	}

	if err := validateTranslateRequest(req); err != nil {
		return response.Error(c, fiber.StatusBadRequest, err.Error(), nil)
	}

	if !h.svc.HasJobStore() {
		return response.Error(c, fiber.StatusServiceUnavailable, "Async translation not available", nil)
	}

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	jobID, err := h.svc.CreateAsyncJob(ctx, req)
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to create translation job", err.Error())
	}

	return response.Success(c, fiber.StatusAccepted, AsyncJobResponse{
		JobID:  jobID,
		Status: JobPending,
	}, "Translation job queued")
}

// GetAsyncJob xử lý GET /api/translate/async/:job_id
// Trả về trạng thái và kết quả của async job (dùng cho frontend polling).
func (h *Handler) GetAsyncJob(c *fiber.Ctx) error {
	jobID := c.Params("job_id")
	if jobID == "" {
		return response.Error(c, fiber.StatusBadRequest, "job_id is required", nil)
	}

	if !h.svc.HasJobStore() {
		return response.Error(c, fiber.StatusServiceUnavailable, "Async translation not available", nil)
	}

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	result, err := h.svc.GetAsyncJob(ctx, jobID)
	if err != nil {
		return response.Error(c, fiber.StatusNotFound, "Job not found", err.Error())
	}

	return response.Success(c, fiber.StatusOK, result, "Job status retrieved")
}

// BatchTranslate xử lý POST /api/translate/batch
// Nhận tối đa 20 items, xử lý song song (giới hạn MaxConcurrency goroutine).
func (h *Handler) BatchTranslate(c *fiber.Ctx) error {
	var req BatchTranslateRequest
	if err := c.BodyParser(&req); err != nil {
		return response.Error(c, fiber.StatusBadRequest, "Invalid request body", err.Error())
	}

	if len(req.Items) == 0 {
		return response.Error(c, fiber.StatusBadRequest, "items must not be empty", nil)
	}
	if len(req.Items) > 20 {
		return response.Error(c, fiber.StatusBadRequest, "maximum 20 items per batch request", nil)
	}

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	results := make([]TranslateResponse, len(req.Items))
	sem := make(chan struct{}, MaxConcurrency)
	var mu sync.Mutex

	g, gctx := errgroup.WithContext(ctx)
	for i, item := range req.Items {
		i, item := i, item
		g.Go(func() error {
			sem <- struct{}{}
			defer func() { <-sem }()

			result := h.svc.Translate(gctx, item)
			mu.Lock()
			results[i] = result
			mu.Unlock()
			return nil
		})
	}

	if err := g.Wait(); err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Batch translation failed", err.Error())
	}

	return response.Success(c, fiber.StatusOK, BatchTranslateResponse{Results: results}, "Batch translation successful")
}

// validateTranslateRequest kiểm tra tính hợp lệ của request.
func validateTranslateRequest(req TranslateRequest) error {
	if req.Content == "" {
		return fmt.Errorf("content is required")
	}
	if req.TargetLang != "vi" && req.TargetLang != "en" {
		return fmt.Errorf("target_lang must be 'vi' or 'en'")
	}
	// Giới hạn cứng: 50,000 ký tự (10 × DefaultChunkSize × 5)
	if len(req.Content) > 50000 {
		return fmt.Errorf("content exceeds maximum allowed length (50,000 chars)")
	}
	return nil
}
