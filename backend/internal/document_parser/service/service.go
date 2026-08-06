package service

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	parserModels "backend/internal/document_parser/models"
	"backend/internal/media/models"
	mediaRepoPkg "backend/internal/media/repository"
	"backend/pkg/config"
	storagePkg "backend/pkg/storage"

	"gorm.io/gorm"
)

type DocumentParserService struct {
	cfg        *config.Config
	storage    storagePkg.Storage
	mediaRepo  *mediaRepoPkg.MediaRepository
	db         *gorm.DB
	httpClient *http.Client
}

func NewDocumentParserService(cfg *config.Config, storage storagePkg.Storage, mediaRepo *mediaRepoPkg.MediaRepository, db *gorm.DB) *DocumentParserService {
	return &DocumentParserService{
		cfg:       cfg,
		storage:   storage,
		mediaRepo: mediaRepo,
		db:        db,
		httpClient: &http.Client{
			Timeout: 180 * time.Second, // Generous timeout for OCR/layout extraction on CPU
		},
	}
}

type MinerUImage struct {
	Name    string `json:"name"`
	Content string `json:"content"` // base64 encoded
}

type MinerUResponse struct {
	Markdown string        `json:"markdown"`
	Images   []MinerUImage `json:"images"`
}

func (s *DocumentParserService) ParseDocument(ctx context.Context, filename string, fileReader io.Reader, fileSize int64) (markdown string, err error) {
	startTime := time.Now()
	status := "success"
	var errMsg *string
	var markdownResult *string

	defer func() {
		duration := time.Since(startTime).Milliseconds()
		if err != nil {
			status = "failed"
			msg := err.Error()
			errMsg = &msg
		} else {
			markdownResult = &markdown
		}

		history := &parserModels.DocumentParseHistory{
			FileName:       filename,
			FileSize:       fileSize,
			Status:         status,
			ErrorMessage:   errMsg,
			MarkdownResult: markdownResult,
			DurationMs:     duration,
		}
		if dbErr := s.db.Create(history).Error; dbErr != nil {
			fmt.Printf("❌ [DocumentParser] Failed to save parse history to DB: %v\n", dbErr)
		} else {
			fmt.Printf("✅ [DocumentParser] Successfully saved parse history to DB, ID: %d\n", history.ID)
		}
	}()

	// 1. Create multipart request body
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	part, err := writer.CreateFormFile("file", filename)
	if err != nil {
		return "", fmt.Errorf("failed to create form file: %w", err)
	}

	if _, err := io.Copy(part, fileReader); err != nil {
		return "", fmt.Errorf("failed to copy file contents to multipart form: %w", err)
	}

	if err := writer.Close(); err != nil {
		return "", fmt.Errorf("failed to close multipart writer: %w", err)
	}

	serviceURL := s.cfg.MinerUServiceURL
	if serviceURL == "" {
		serviceURL = "http://localhost:8082"
	}

	// 2. Call FastAPI Parser Service
	req, err := http.NewRequestWithContext(ctx, "POST", serviceURL+"/parse", body)
	if err != nil {
		return "", fmt.Errorf("failed to build request: %w", err)
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed calling MinerU FastAPI microservice: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("MinerU service returned error code %d: %s", resp.StatusCode, string(respBody))
	}

	var parsedResp MinerUResponse
	if err := json.NewDecoder(resp.Body).Decode(&parsedResp); err != nil {
		return "", fmt.Errorf("failed decoding MinerU JSON response: %w", err)
	}

	markdown = parsedResp.Markdown

	// 3. Process extracted images
	for _, img := range parsedResp.Images {
		imgBytes, err := base64.StdEncoding.DecodeString(img.Content)
		if err != nil {
			// Skip corrupt image and continue
			continue
		}

		// Detect mime-type based on file extension
		ext := strings.ToLower(filepath.Ext(img.Name))
		mimeType := "image/png"
		if ext == ".jpg" || ext == ".jpeg" {
			mimeType = "image/jpeg"
		} else if ext == ".gif" {
			mimeType = "image/gif"
		}

		// Build storage key and upload
		storageKey := storagePkg.BuildKey("images", img.Name)
		err = s.storage.UploadFile(ctx, storageKey, bytes.NewReader(imgBytes), mimeType)
		if err != nil {
			// Skip and log if upload fails
			continue
		}

		publicURL := s.storage.GetPublicURL(storageKey)

		// Create DB record in PostgreSQL media table
		media := &models.Media{
			FileName:        img.Name,
			URL:             publicURL,
			StorageProvider: s.storage.DriverName(),
			StorageKey:      storageKey,
			Status:          "completed",
			Type:            "image",
			FileSize:        int64(len(imgBytes)),
			MimeType:        mimeType,
		}

		if err := s.mediaRepo.Insert(ctx, media); err != nil {
			// Clean up file if database insertion failed
			_ = s.storage.DeleteObject(ctx, storageKey)
			continue
		}

		// 4. Update image links inside Markdown content
		escapedName := regexp.QuoteMeta(img.Name)

		// Replace standard markdown image syntax: ![](images/filename.png) or ![](filename.png)
		reMD := regexp.MustCompile(`!\[(.*?)\]\((?:images/)?` + escapedName + `\)`)
		markdown = reMD.ReplaceAllString(markdown, "![$1]("+publicURL+")")

		// Replace HTML img tag references: src="images/filename.png" or src="filename.png"
		reHTML := regexp.MustCompile(`src=["'](?:images/)?` + escapedName + `["']`)
		markdown = reHTML.ReplaceAllString(markdown, `src="`+publicURL+`"`)
	}

	return markdown, nil
}
