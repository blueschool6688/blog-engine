package repository

import (
	"backend/internal/media/models"
	"backend/internal/shared/repositories"

	"gorm.io/gorm"
)

type MediaRepository struct {
	*repositories.GormRepository[models.Media]
}

func NewMediaRepository(db *gorm.DB) *MediaRepository {
	return &MediaRepository{
		GormRepository: repositories.NewGormRepository[models.Media](db),
	}
}
