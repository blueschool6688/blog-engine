package repository

import (
	"context"
	"fmt"

	"backend/internal/post/models"
	"backend/internal/shared/repositories"

	"gorm.io/gorm"
)

type PostRepository struct {
	*repositories.GormRepository[models.Post]
}

func NewPostRepository(db *gorm.DB) *PostRepository {
	return &PostRepository{
		GormRepository: repositories.NewGormRepository[models.Post](db),
	}
}

func (r *PostRepository) FindByIDWithMedia(ctx context.Context, id uint) (*models.Post, error) {
	var post models.Post
	if err := r.DB.WithContext(ctx).
		Preload("CoverMedia").
		Preload("Author").
		Preload("Categories").
		Preload("Tags").
		Preload("Gallery", func(db *gorm.DB) *gorm.DB {
			return db.Order("post_media.sort_order ASC")
		}).
		Preload("Gallery.Media").
		Preload("PDFMedia").
		First(&post, id).Error; err != nil {
		return nil, fmt.Errorf("find post by id with media: %w", err)
	}
	return &post, nil
}

func (r *PostRepository) FindWithPaginationWithMedia(ctx context.Context, offset, limit int, query map[string]interface{}) ([]*models.Post, error) {
	var posts []*models.Post
	db := r.DB.WithContext(ctx).
		Preload("CoverMedia").
		Preload("Author").
		Preload("Categories").
		Preload("Tags").
		Preload("Gallery", func(db *gorm.DB) *gorm.DB {
			return db.Order("post_media.sort_order ASC")
		}).
		Preload("Gallery.Media").
		Preload("PDFMedia").
		Offset(offset).Limit(limit).Order("id desc")
	for k, v := range query {
		db = db.Where(k, v)
	}
	if err := db.Find(&posts).Error; err != nil {
		return nil, fmt.Errorf("find posts with media and pagination: %w", err)
	}
	return posts, nil
}

func (r *PostRepository) Restore(ctx context.Context, id uint) error {
	return r.DB.WithContext(ctx).Unscoped().Model(&models.Post{}).Where("id = ?", id).Update("deleted_at", nil).Error
}

func (r *PostRepository) PermanentDelete(ctx context.Context, id uint) error {
	return r.DB.WithContext(ctx).Unscoped().Delete(&models.Post{}, id).Error
}

func (r *PostRepository) InsertRagJob(ctx context.Context, postID uint) error {
	return r.DB.WithContext(ctx).Exec(`
		INSERT INTO rag_jobs (post_id, status) VALUES (?, 'pending')
	`, postID).Error
}
