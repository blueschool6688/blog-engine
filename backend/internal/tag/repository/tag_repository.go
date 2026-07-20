package repository

import (
	"context"
	"fmt"

	"backend/internal/shared/repositories"
	"backend/internal/tag/models"

	"gorm.io/gorm"
)

type TagRepository struct {
	*repositories.GormRepository[models.Tag]
}

func NewTagRepository(db *gorm.DB) *TagRepository {
	return &TagRepository{
		GormRepository: repositories.NewGormRepository[models.Tag](db),
	}
}

func (r *TagRepository) FindBySlug(ctx context.Context, slug string) (*models.Tag, error) {
	tag, err := r.FindOne(ctx, map[string]interface{}{"slug": slug})
	if err != nil {
		return nil, fmt.Errorf("find tag by slug: %w", err)
	}
	return tag, nil
}

func (r *TagRepository) FindAll(ctx context.Context, withDeleted bool) ([]models.Tag, error) {
	var entities []models.Tag
	db := r.DB.WithContext(ctx)
	if withDeleted {
		db = db.Unscoped()
	}
	if err := db.Find(&entities).Error; err != nil {
		return nil, err
	}
	return entities, nil
}

func (r *TagRepository) Restore(ctx context.Context, id uint) error {
	return r.DB.WithContext(ctx).Unscoped().Model(&models.Tag{}).Where("id = ?", id).Update("deleted_at", nil).Error
}

func (r *TagRepository) PermanentDelete(ctx context.Context, id uint) error {
	return r.DB.WithContext(ctx).Unscoped().Delete(&models.Tag{}, id).Error
}
