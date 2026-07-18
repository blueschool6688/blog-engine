package repository

import (
	"backend/internal/feedback/models"
	"backend/internal/shared/repositories"

	"gorm.io/gorm"
)

type FeedbackRepository struct {
	*repositories.GormRepository[models.Feedback]
}

func NewFeedbackRepository(db *gorm.DB) *FeedbackRepository {
	return &FeedbackRepository{
		GormRepository: repositories.NewGormRepository[models.Feedback](db),
	}
}
