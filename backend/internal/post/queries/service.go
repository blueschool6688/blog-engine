package queries

import (
	"context"
	"fmt"

	"backend/internal/post/models"
	"backend/internal/post/repository"
	"backend/pkg/cache"

	"gorm.io/gorm"
)

type QueryService struct {
	repo       *repository.PostRepository
	cacheStore *cache.MemcachedStore
}

func NewQueryService(repo *repository.PostRepository, cacheStore *cache.MemcachedStore) *QueryService {
	return &QueryService{
		repo:       repo,
		cacheStore: cacheStore,
	}
}

type ListPostsResponse struct {
	Items []*models.Post `json:"items"`
	Total int64          `json:"total"`
}

func (s *QueryService) GetPostByID(ctx context.Context, id uint) (*models.Post, error) {
	dbPost, err := s.repo.FindByIDWithMedia(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("query post by id: %w", err)
	}

	return dbPost, nil
}

func (s *QueryService) ListPosts(ctx context.Context, offset, limit int, status string, search string, categoryID uint, tagID uint, isFeatured bool, withDeleted bool) (*ListPostsResponse, error) {
	tx := s.repo.DB.WithContext(ctx).Model(&models.Post{})

	if withDeleted {
		tx = tx.Unscoped()
	}

	if status != "" {
		tx = tx.Where("posts.status = ?", status)
	}
	if isFeatured {
		tx = tx.Where("posts.is_featured = ?", true)
	}
	if categoryID > 0 {
		tx = tx.Joins("JOIN post_categories ON post_categories.post_id = posts.id").
			Where("post_categories.category_id = ?", categoryID)
	}
	if tagID > 0 {
		tx = tx.Joins("JOIN post_tags ON post_tags.post_id = posts.id").
			Where("post_tags.tag_id = ?", tagID)
	}
	if search != "" {
		tx = tx.Where("posts.search_vector @@ plainto_tsquery('english', ?) OR posts.title ILIKE ? OR posts.content ILIKE ?", search, "%"+search+"%", "%"+search+"%")
	}

	var total int64
	if err := tx.Session(&gorm.Session{}).Count(&total).Error; err != nil {
		return nil, fmt.Errorf("query count posts: %w", err)
	}

	var posts []*models.Post
	err := tx.Session(&gorm.Session{}).
		Preload("CoverMedia").
		Preload("Author").
		Preload("Categories").
		Preload("Tags").
		Preload("Gallery", func(db *gorm.DB) *gorm.DB {
			return db.Order("post_media.sort_order ASC")
		}).
		Preload("Gallery.Media").
		Preload("PDFMedia").
		Offset(offset).Limit(limit).Order("posts.id desc").
		Find(&posts).Error
	if err != nil {
		return nil, fmt.Errorf("query list posts: %w", err)
	}

	res := &ListPostsResponse{
		Items: posts,
		Total: total,
	}

	return res, nil
}

func (s *QueryService) GetGallery(ctx context.Context, postID uint) ([]models.PostMedia, error) {
	var gallery []models.PostMedia
	err := s.repo.DB.WithContext(ctx).
		Preload("Media").
		Where("post_id = ?", postID).
		Order("sort_order ASC").
		Find(&gallery).Error
	if err != nil {
		return nil, fmt.Errorf("get gallery: %w", err)
	}
	return gallery, nil
}
