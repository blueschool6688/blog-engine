package models

import (
	"encoding/json"
	"time"
)

type AuditLog struct {
	ID         uint            `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID     *uint           `json:"user_id"`
	Action     string          `gorm:"type:varchar(100);not null" json:"action"`
	EntityType string          `gorm:"type:varchar(100)" json:"entity_type"`
	EntityID   *uint           `json:"entity_id"`
	Changes    json.RawMessage `gorm:"type:jsonb" json:"changes"`
	IPAddress  string          `gorm:"type:varchar(45)" json:"ip_address"`
	CreatedAt  time.Time       `json:"created_at"`
}

func (AuditLog) TableName() string {
	return "audit_logs"
}
