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
