package models

import (
	"backend/internal/shared/models"
)

type Media struct {
	models.BaseModel
	FileName     string `gorm:"type:varchar(255);not null" json:"file_name"`
	URL          string `gorm:"type:text;not null" json:"url"`
	ThumbnailURL string `gorm:"type:text" json:"thumbnail_url,omitempty"`
	Status       string `gorm:"type:varchar(50);not null;default:'processing'" json:"status"`
	Type         string `gorm:"type:varchar(20);not null;default:'image'" json:"type"` // image, video
	Duration     int    `json:"duration,omitempty"` // in seconds
	Resolution   string `gorm:"type:varchar(50)" json:"resolution,omitempty"` // "1920x1080"
	FileSize     int64  `json:"file_size"`
	MimeType     string `gorm:"type:varchar(100)" json:"mime_type"`
}

func (Media) TableName() string {
	return "media"
}
