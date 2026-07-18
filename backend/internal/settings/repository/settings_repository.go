package repository

import (
	"context"
	"fmt"

	"backend/internal/settings/models"
	"backend/internal/shared/repositories"

	"gorm.io/gorm"
)

type SettingsRepository struct {
	*repositories.GormRepository[models.Setting]
}

func NewSettingsRepository(db *gorm.DB) *SettingsRepository {
	return &SettingsRepository{
		GormRepository: repositories.NewGormRepository[models.Setting](db),
	}
}

// FindByKey finds a setting by key
func (r *SettingsRepository) FindByKey(ctx context.Context, key string) (*models.Setting, error) {
	setting, err := r.FindOne(ctx, map[string]interface{}{"key": key})
	if err != nil {
		return nil, fmt.Errorf("find setting by key: %w", err)
	}
	return setting, nil
}
