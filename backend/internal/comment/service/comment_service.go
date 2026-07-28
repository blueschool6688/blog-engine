package service

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"time"

	"backend/internal/aigenerate"
	"backend/internal/comment/models"
	"backend/internal/comment/repository"

	"gorm.io/gorm"
)

type CommentService struct {
	commentRepo  *repository.CommentRepository
	reactionRepo *repository.ReactionRepository
	db           *gorm.DB
	aiSvc        *aigenerate.Service
}

func NewCommentService(
	commentRepo *repository.CommentRepository,
	reactionRepo *repository.ReactionRepository,
	db *gorm.DB,
	aiSvc *aigenerate.Service,
) *CommentService {
	return &CommentService{
		commentRepo:  commentRepo,
		reactionRepo: reactionRepo,
		db:           db,
		aiSvc:        aiSvc,
	}
}

func BuildFingerprint(ip, userAgent string) string {
	raw := ip + "|" + userAgent
	hash := sha256.Sum256([]byte(raw))
	return hex.EncodeToString(hash[:])
}

func (s *CommentService) isCommentsEnabled(ctx context.Context) bool {
	var val struct{ Value string }
	err := s.db.WithContext(ctx).Table("settings").Where("key = ?", "comments_enabled").First(&val).Error
	if err != nil {
		return true // Default: enabled
	}
	return val.Value != "false"
}

func (s *CommentService) isAutoApprove(ctx context.Context) bool {
	var val struct{ Value string }
	err := s.db.WithContext(ctx).Table("settings").Where("key = ?", "comments_auto_approve").First(&val).Error
	if err != nil {
		return false // Default: manual approval (moderation)
	}
	return val.Value == "true"
}

func (s *CommentService) CreateComment(ctx context.Context, postID uint, name, email, content, ip string, parentID *uint) (*models.Comment, error) {
	if !s.isCommentsEnabled(ctx) {
		return nil, errors.New("comments are disabled")
	}
	if content == "" {
		return nil, errors.New("content is required")
	}

	// Verify post exists and is published
	var count int64
	err := s.db.WithContext(ctx).Table("posts").Where("id = ? AND status = ?", postID, "published").Count(&count).Error
	if err != nil || count == 0 {
		return nil, errors.New("post not found or not published")
	}

	status := "pending"
	if s.isAutoApprove(ctx) {
		status = "approved"
	}

	var spamScore *float64
	if s.aiSvc != nil {
		spamCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
		defer cancel()

		if spamRes, err := s.aiSvc.ScoreSpam(spamCtx, name, content); err == nil && spamRes != nil {
			spamScore = &spamRes.SpamScore
			if *spamScore >= 0.85 {
				status = "rejected"
			}
		}
	}

	comment := &models.Comment{
		PostID:      postID,
		ParentID:    parentID,
		AuthorName:  name,
		AuthorEmail: email,
		Content:     content,
		Status:      status,
		IPAddress:   ip,
		SpamScore:   spamScore,
	}

	if err := s.commentRepo.Create(ctx, comment); err != nil {
		return nil, fmt.Errorf("create comment: %w", err)
	}
	return comment, nil
}

func (s *CommentService) GetApprovedComments(ctx context.Context, postID uint) ([]models.Comment, error) {
	return s.commentRepo.FindApprovedByPostID(ctx, postID)
}

func (s *CommentService) ListAll(ctx context.Context, offset, limit int, status string) ([]models.Comment, int64, error) {
	return s.commentRepo.FindAll(ctx, offset, limit, status)
}

func (s *CommentService) ApproveComment(ctx context.Context, id uint) error {
	return s.commentRepo.UpdateStatus(ctx, id, "approved")
}

func (s *CommentService) RejectComment(ctx context.Context, id uint) error {
	return s.commentRepo.UpdateStatus(ctx, id, "rejected")
}

func (s *CommentService) DeleteComment(ctx context.Context, id uint) error {
	return s.commentRepo.Delete(ctx, id)
}

func (s *CommentService) React(ctx context.Context, postID uint, emoji, fingerprint string) ([]models.ReactionCount, error) {
	validEmojis := map[string]bool{"like": true, "love": true, "wow": true, "haha": true, "sad": true}
	if !validEmojis[emoji] {
		return nil, errors.New("invalid emoji type")
	}

	if err := s.reactionRepo.Toggle(ctx, postID, emoji, fingerprint); err != nil {
		return nil, fmt.Errorf("toggle reaction: %w", err)
	}

	return s.reactionRepo.GetCountsByPost(ctx, postID, fingerprint)
}

func (s *CommentService) GetReactions(ctx context.Context, postID uint, fingerprint string) ([]models.ReactionCount, error) {
	return s.reactionRepo.GetCountsByPost(ctx, postID, fingerprint)
}

func (s *CommentService) CountPending(ctx context.Context) (int64, error) {
	return s.commentRepo.CountPending(ctx)
}
