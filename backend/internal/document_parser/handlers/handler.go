package handlers

import (
	"strings"

	"backend/internal/document_parser/service"
	"backend/internal/shared/response"
	"github.com/gofiber/fiber/v2"
)

type DocumentParserHandler struct {
	svc *service.DocumentParserService
}

func NewDocumentParserHandler(svc *service.DocumentParserService) *DocumentParserHandler {
	return &DocumentParserHandler{svc: svc}
}

func (h *DocumentParserHandler) Parse(c *fiber.Ctx) error {
	file, err := c.FormFile("file")
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, "No file uploaded", err.Error())
	}

	// Validate filename extension
	filename := strings.ToLower(file.Filename)
	if !strings.HasSuffix(filename, ".pdf") && !strings.HasSuffix(filename, ".docx") {
		return response.Error(c, fiber.StatusBadRequest, "Unsupported file format", "Only PDF and DOCX documents are accepted.")
	}

	// Limit document size to 50MB
	const maxFileSize = 50 * 1024 * 1024 // 50MB
	if file.Size > maxFileSize {
		return response.Error(c, fiber.StatusBadRequest, "File too large", "File size exceeds the 50MB limit.")
	}

	src, err := file.Open()
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to open uploaded file", err.Error())
	}
	defer src.Close()

	ctx := c.UserContext()
	markdown, err := h.svc.ParseDocument(ctx, file.Filename, src, file.Size)
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Parsing operation failed", err.Error())
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"markdown": markdown,
		},
	})
}
