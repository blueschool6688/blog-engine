package discord

import (
	"bytes"
	"context"
	"crypto/ed25519"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"backend/internal/aigenerate"
	userModels "backend/internal/auth/models"
	postCommands "backend/internal/post/commands"
	tagModels "backend/internal/tag/models"
	"backend/pkg/logger"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type Handler struct {
	aiGenerateSvc  *aigenerate.Service
	postCmdService *postCommands.CommandService
	db             *gorm.DB
	publicKey      string
	botSecret      string
	authorID       uint
	appURL         string
	log            *logger.Logger
}

func NewHandler(
	aiGenerateSvc *aigenerate.Service,
	postCmdService *postCommands.CommandService,
	db *gorm.DB,
	publicKey string,
	botSecret string,
	authorID uint,
	appURL string,
	log *logger.Logger,
) *Handler {
	return &Handler{
		aiGenerateSvc:  aiGenerateSvc,
		postCmdService: postCmdService,
		db:             db,
		publicKey:      publicKey,
		botSecret:      botSecret,
		authorID:       authorID,
		appURL:         appURL,
		log:            log,
	}
}

// Handle receives and validates Discord webhooks.
func (h *Handler) Handle(c *fiber.Ctx) error {
	signature := c.Get("X-Signature-Ed25519")
	timestamp := c.Get("X-Signature-Timestamp")
	bodyBytes := c.Body()

	// 1. Verify Signature (Required by Discord)
	if h.publicKey != "" && !verifyDiscordSignature(h.publicKey, timestamp, string(bodyBytes), signature) {
		h.log.Error("[discord-webhook] Invalid signature received\n")
		return c.Status(fiber.StatusUnauthorized).SendString("invalid request signature")
	}

	var interaction Interaction
	if err := json.Unmarshal(bodyBytes, &interaction); err != nil {
		h.log.Error("[discord-webhook] Failed to unmarshal: %v\n", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid payload",
		})
	}

	// 2. Respond to PING
	if interaction.Type == InteractionTypePing {
		h.log.Info("[discord-webhook] Responding PONG to ping\n")
		return c.JSON(InteractionResponse{Type: InteractionResponsePong})
	}

	// 3. Respond to Slash Command
	if interaction.Type == InteractionTypeApplicationCommand {
		if interaction.Data.Name == "create-post" {
			var topic string
			for _, opt := range interaction.Data.Options {
				if opt.Name == "topic" {
					if valStr, ok := opt.Value.(string); ok {
						topic = valStr
					}
				}
			}

			if topic == "" {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": "missing topic option",
				})
			}

			h.log.Info("[discord-webhook] Command received for topic '%s'. Acknowledging deferred response.\n", topic)

			go h.generateAndCreatePost(interaction.ApplicationID, interaction.Token, topic)

			return c.JSON(InteractionResponse{Type: InteractionResponseDeferredChannelMessage})
		}
	}

	return c.SendStatus(fiber.StatusNotFound)
}

func (h *Handler) generateAndCreatePost(appID, token, topic string) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Minute)
	defer cancel()

	generated, err := h.aiGenerateSvc.GeneratePost(ctx, topic)
	if err != nil {
		h.log.Error("[discord-webhook] AI Generate failed: %v\n", err)
		h.sendFollowup(appID, token, fmt.Sprintf("❌ Lỗi khi dùng AI tạo bài viết: %v", err))
		return
	}
	var tagIDs []uint
	for _, tagName := range generated.SuggestedTags {
		var tag tagModels.Tag
		tagName = strings.TrimSpace(tagName)
		if tagName == "" {
			continue
		}
		err := h.db.Where("LOWER(name) = LOWER(?)", tagName).First(&tag).Error
		if err == gorm.ErrRecordNotFound {
			slug := strings.ToLower(strings.ReplaceAll(tagName, " ", "-"))
			tag = tagModels.Tag{
				Name: tagName,
				Slug: slug,
			}
			if err := h.db.Create(&tag).Error; err == nil {
				tagIDs = append(tagIDs, tag.ID)
			}
		} else if err == nil {
			tagIDs = append(tagIDs, tag.ID)
		}
	}

	// Resolve default author if not found
	var authorID uint = h.authorID
	if authorID == 0 {
		var defaultUser userModels.User
		if err := h.db.Where("role = ?", "admin").First(&defaultUser).Error; err == nil {
			authorID = defaultUser.ID
		}
	}

	// Create post via CommandService
	cmd := postCommands.CreatePostCommand{
		Title:     generated.TitleVI,
		TitleEn:   generated.TitleEN,
		Content:   generated.ContentVI,
		ContentEn: generated.ContentEN,
		Excerpt:   generated.ExcerptVI,
		ExcerptEn: generated.ExcerptEN,
		MetaTitle: generated.MetaTitleVI,
		MetaDesc:  generated.MetaDescVI,
		Status:    "draft",
		AuthorID:  &authorID,
		TagIDs:    tagIDs,
	}

	post, err := h.postCmdService.CreatePost(ctx, cmd)
	if err != nil {
		h.log.Error("[discord-webhook] CreatePost failed: %v\n", err)
		h.sendFollowup(appID, token, fmt.Sprintf("❌ Lỗi khi lưu bài viết vào database: %v", err))
		return
	}

	h.log.Info("[discord-webhook] Post created successfully ID=%d\n", post.ID)

	// Format final link
	editURL := fmt.Sprintf("%s/system/posts/%d", h.appURL, post.ID)
	successMsg := fmt.Sprintf("✅ **AI đã tạo xong bài viết nháp!**\n\n**Tiêu đề:** %s\n**Tiêu đề (EN):** %s\n🔗 **Link chỉnh sửa:** %s",
		post.Title, post.TitleEn, editURL)

	h.sendFollowup(appID, token, successMsg)
}

func (h *Handler) sendFollowup(appID, token, content string) {
	url := fmt.Sprintf("https://discord.com/api/v10/webhooks/%s/%s/messages/@original", appID, token)

	payload := FollowupMessage{
		Content: content,
	}

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		h.log.Error("[discord-webhook] Followup marshal: %v\n", err)
		return
	}

	req, err := http.NewRequest(http.MethodPatch, url, bytes.NewReader(bodyBytes))
	if err != nil {
		h.log.Error("[discord-webhook] Followup req: %v\n", err)
		return
	}
	req.Header.Set("Content-Type", "application/json")

	// If bot token is available (though PATCH followup doesn't strictly require authorization header for @original, it's safe to include if present)
	if h.botSecret != "" {
		req.Header.Set("Authorization", "Bot "+h.botSecret)
	}

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		h.log.Error("[discord-webhook] Followup post failed: %v\n", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		h.log.Error("[discord-webhook] Followup response failed with HTTP %d\n", resp.StatusCode)
	} else {
		h.log.Info("[discord-webhook] Followup successfully sent to Discord\n")
	}
}

// verifyDiscordSignature validates requests from Discord using Ed25519.
func verifyDiscordSignature(publicKeyHex, timestamp, body, signatureHex string) bool {
	pubKeyBytes, err := hex.DecodeString(publicKeyHex)
	if err != nil || len(pubKeyBytes) != ed25519.PublicKeySize {
		return false
	}

	sigBytes, err := hex.DecodeString(signatureHex)
	if err != nil || len(sigBytes) != ed25519.SignatureSize {
		return false
	}

	msg := []byte(timestamp + body)
	return ed25519.Verify(pubKeyBytes, msg, sigBytes)
}
