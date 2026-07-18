package repository

import (
	"context"
	"fmt"

	"backend/internal/comment/models"

	"gorm.io/gorm"
)

type CommentRepository struct {
	DB *gorm.DB
}

func NewCommentRepository(db *gorm.DB) *CommentRepository {
	return &CommentRepository{DB: db}
}

func (r *CommentRepository) Create(ctx context.Context, c *models.Comment) error {
	return r.DB.WithContext(ctx).Create(c).Error
}

func (r *CommentRepository) FindApprovedByPostID(ctx context.Context, postID uint) ([]models.Comment, error) {
	var comments []models.Comment
	// Fetch top-level approved comments
	err := r.DB.WithContext(ctx).
		Where("post_id = ? AND parent_id IS NULL AND status = ?", postID, "approved").
		Order("created_at ASC").
		Find(&comments).Error
	if err != nil {
		return nil, fmt.Errorf("find top level comments: %w", err)
	}

	// Fetch replies for each comment (approved replies)
	for i := range comments {
		var replies []models.Comment
		err = r.DB.WithContext(ctx).
			Where("parent_id = ? AND status = ?", comments[i].ID, "approved").
			Order("created_at ASC").
			Find(&replies).Error
		if err == nil {
			comments[i].Replies = replies
		}
	}
	return comments, nil
}

func (r *CommentRepository) FindAll(ctx context.Context, offset, limit int, status string) ([]models.Comment, int64, error) {
	q := r.DB.WithContext(ctx).Model(&models.Comment{})
	if status != "" {
		q = q.Where("status = ?", status)
	}

	var total int64
	if err := q.Session(&gorm.Session{}).Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("count comments: %w", err)
	}

	var comments []models.Comment
	err := q.Order("id DESC").Offset(offset).Limit(limit).Find(&comments).Error
	if err != nil {
		return nil, 0, fmt.Errorf("find all comments: %w", err)
	}
	return comments, total, nil
}

func (r *CommentRepository) UpdateStatus(ctx context.Context, id uint, status string) error {
	return r.DB.WithContext(ctx).Model(&models.Comment{}).Where("id = ?", id).
		UpdateColumn("status", status).Error
}

func (r *CommentRepository) Delete(ctx context.Context, id uint) error {
	// Delete comment and its sub-replies
	return r.DB.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("parent_id = ?", id).Delete(&models.Comment{}).Error; err != nil {
			return err
		}
		return tx.Where("id = ?", id).Delete(&models.Comment{}).Error
	})
}

func (r *CommentRepository) CountPending(ctx context.Context) (int64, error) {
	var count int64
	err := r.DB.WithContext(ctx).Model(&models.Comment{}).Where("status = ?", "pending").Count(&count).Error
	if err != nil {
		return 0, fmt.Errorf("count pending comments: %w", err)
	}
	return count, nil
}
