package models

import (
	"time"
)

type DocumentParseHistory struct {
	ID             uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	FileName       string    `gorm:"type:varchar(255);not null" json:"file_name"`
	FileSize       int64     `json:"file_size"`
	Status         string    `gorm:"type:varchar(50);not null" json:"status"` // "success", "failed"
	ErrorMessage   *string   `gorm:"type:text" json:"error_message,omitempty"`
	MarkdownResult *string   `gorm:"type:text" json:"markdown_result,omitempty"`
	DurationMs     int64     `json:"duration_ms"`
	CreatedAt      time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
}

func (DocumentParseHistory) TableName() string {
	return "document_parse_history"
}
