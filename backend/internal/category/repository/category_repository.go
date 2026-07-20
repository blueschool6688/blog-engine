package repository

import (
	"context"
	"fmt"

	"backend/internal/category/models"
	"backend/internal/shared/repositories"

	"gorm.io/gorm"
)

type CategoryRepository struct {
	*repositories.GormRepository[models.Category]
}

func NewCategoryRepository(db *gorm.DB) *CategoryRepository {
	return &CategoryRepository{
		GormRepository: repositories.NewGormRepository[models.Category](db),
	}
}

func (r *CategoryRepository) FindBySlug(ctx context.Context, slug string) (*models.Category, error) {
	category, err := r.FindOne(ctx, map[string]interface{}{"slug": slug})
	if err != nil {
		return nil, fmt.Errorf("find category by slug: %w", err)
	}
	return category, nil
}

func (r *CategoryRepository) FindAll(ctx context.Context, withDeleted bool) ([]models.Category, error) {
	var entities []models.Category
	db := r.DB.WithContext(ctx).Preload("Parent")
	if withDeleted {
		db = db.Unscoped()
	}
	if err := db.Find(&entities).Error; err != nil {
		return nil, err
	}
	return entities, nil
}

func (r *CategoryRepository) FindByID(ctx context.Context, id uint) (*models.Category, error) {
	var entity models.Category
	if err := r.DB.WithContext(ctx).Preload("Parent").First(&entity, id).Error; err != nil {
		return nil, err
	}
	return &entity, nil
}

func (r *CategoryRepository) Restore(ctx context.Context, id uint) error {
	return r.DB.WithContext(ctx).Unscoped().Model(&models.Category{}).Where("id = ?", id).Update("deleted_at", nil).Error
}

func (r *CategoryRepository) PermanentDelete(ctx context.Context, id uint) error {
	return r.DB.WithContext(ctx).Unscoped().Delete(&models.Category{}, id).Error
}
