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
