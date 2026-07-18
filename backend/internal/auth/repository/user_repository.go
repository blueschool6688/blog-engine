package repository

import (
	"context"
	"fmt"

	"backend/internal/auth/models"
	"backend/internal/shared/repositories"

	"gorm.io/gorm"
)

type UserRepository struct {
	*repositories.GormRepository[models.User]
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{
		GormRepository: repositories.NewGormRepository[models.User](db),
	}
}

// FindByEmail looks up a single user by their email address.
func (r *UserRepository) FindByEmail(ctx context.Context, email string) (*models.User, error) {
	user, err := r.FindOne(ctx, map[string]interface{}{"email": email})
	if err != nil {
		return nil, fmt.Errorf("find user by email: %w", err)
	}
	return user, nil
}

// FindAll returns a paginated list of users, optionally filtered by role.
func (r *UserRepository) FindAll(ctx context.Context, offset, limit int, role string) ([]models.User, int64, error) {
	q := r.DB.WithContext(ctx).Model(&models.User{}).Where("deleted_at IS NULL")
	if role != "" {
		q = q.Where("role = ?", role)
	}
	var total int64
	if err := q.Session(&gorm.Session{}).Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("count users: %w", err)
	}
	var users []models.User
	if err := q.Order("id DESC").Offset(offset).Limit(limit).Find(&users).Error; err != nil {
		return nil, 0, fmt.Errorf("find all users: %w", err)
	}
	return users, total, nil
}
