package service

import (
	"context"
	"encoding/json"
	"fmt"

	"backend/internal/audit/models"

	"gorm.io/gorm"
)

type AuditService struct {
	db *gorm.DB
}

func NewAuditService(db *gorm.DB) *AuditService {
	return &AuditService{db: db}
}

// Log records an audit action asynchronously in a separate goroutine.
func (s *AuditService) Log(userID *uint, action, entityType string, entityID *uint, changes interface{}, ip string) {
	go func() {
		var raw json.RawMessage
		if changes != nil {
			data, err := json.Marshal(changes)
			if err == nil {
				raw = data
			}
		}

		log := &models.AuditLog{
			UserID:     userID,
			Action:     action,
			EntityType: entityType,
			EntityID:   entityID,
			Changes:    raw,
			IPAddress:  ip,
		}

		// Use a fresh DB session for the background goroutine to avoid sharing context issues
		_ = s.db.Create(log).Error
	}()
}

// GetLogs returns a paginated list of audit logs, optionally filtered by user or entity.
func (s *AuditService) GetLogs(ctx context.Context, offset, limit int, userID *uint, entityType string) ([]models.AuditLog, int64, error) {
	q := s.db.WithContext(ctx).Model(&models.AuditLog{})

	if userID != nil {
		q = q.Where("user_id = ?", *userID)
	}
	if entityType != "" {
		q = q.Where("entity_type = ?", entityType)
	}

	var total int64
	if err := q.Session(&gorm.Session{}).Count(&total).Error; err != nil {
		return nil, 0, fmt.Errorf("count audit logs: %w", err)
	}

	var logs []models.AuditLog
	if err := q.Order("id DESC").Offset(offset).Limit(limit).Find(&logs).Error; err != nil {
		return nil, 0, fmt.Errorf("find audit logs: %w", err)
	}

	return logs, total, nil
}
