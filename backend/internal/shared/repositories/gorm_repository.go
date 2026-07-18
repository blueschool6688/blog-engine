package repositories

import (
	"context"
	"fmt"

	"gorm.io/gorm"
)

type Repository[T any] interface {
	Insert(ctx context.Context, entity *T) error
	Update(ctx context.Context, entity *T) error
	Delete(ctx context.Context, id uint) error
	FindByID(ctx context.Context, id uint) (*T, error)
	FindOne(ctx context.Context, query map[string]interface{}) (*T, error)
	FindAll(ctx context.Context) ([]*T, error)
	FindWithPagination(ctx context.Context, offset, limit int, query map[string]interface{}) ([]*T, error)
	Count(ctx context.Context, query map[string]interface{}) (int64, error)
}

type GormRepository[T any] struct {
	DB *gorm.DB
}

func NewGormRepository[T any](db *gorm.DB) *GormRepository[T] {
	return &GormRepository[T]{DB: db}
}

func (r *GormRepository[T]) Insert(ctx context.Context, entity *T) error {
	if err := r.DB.WithContext(ctx).Create(entity).Error; err != nil {
		return fmt.Errorf("insert: %w", err)
	}
	return nil
}

func (r *GormRepository[T]) Update(ctx context.Context, entity *T) error {
	if err := r.DB.WithContext(ctx).Save(entity).Error; err != nil {
		return fmt.Errorf("update: %w", err)
	}
	return nil
}

func (r *GormRepository[T]) Delete(ctx context.Context, id uint) error {
	var entity T
	if err := r.DB.WithContext(ctx).Delete(&entity, id).Error; err != nil {
		return fmt.Errorf("delete: %w", err)
	}
	return nil
}

func (r *GormRepository[T]) FindByID(ctx context.Context, id uint) (*T, error) {
	var entity T
	if err := r.DB.WithContext(ctx).First(&entity, id).Error; err != nil {
		return nil, fmt.Errorf("find by id: %w", err)
	}
	return &entity, nil
}

func (r *GormRepository[T]) FindOne(ctx context.Context, query map[string]interface{}) (*T, error) {
	var entity T
	db := r.DB.WithContext(ctx)
	for k, v := range query {
		db = db.Where(k, v)
	}
	if err := db.First(&entity).Error; err != nil {
		return nil, fmt.Errorf("find one: %w", err)
	}
	return &entity, nil
}

func (r *GormRepository[T]) FindAll(ctx context.Context) ([]*T, error) {
	var entities []*T
	if err := r.DB.WithContext(ctx).Find(&entities).Error; err != nil {
		return nil, fmt.Errorf("find all: %w", err)
	}
	return entities, nil
}

func (r *GormRepository[T]) FindWithPagination(ctx context.Context, offset, limit int, query map[string]interface{}) ([]*T, error) {
	var entities []*T
	db := r.DB.WithContext(ctx).Offset(offset).Limit(limit).Order("id desc")
	for k, v := range query {
		db = db.Where(k, v)
	}
	if err := db.Find(&entities).Error; err != nil {
		return nil, fmt.Errorf("find with pagination: %w", err)
	}
	return entities, nil
}

func (r *GormRepository[T]) Count(ctx context.Context, query map[string]interface{}) (int64, error) {
	var entity T
	var count int64
	db := r.DB.WithContext(ctx).Model(&entity)
	for k, v := range query {
		db = db.Where(k, v)
	}
	if err := db.Count(&count).Error; err != nil {
		return 0, fmt.Errorf("count: %w", err)
	}
	return count, nil
}
