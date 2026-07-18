package models

import mediaModels "backend/internal/media/models"

type PostMedia struct {
	ID        uint               `gorm:"primaryKey" json:"id"`
	PostID    uint               `gorm:"index" json:"post_id"`
	MediaID   uint               `json:"media_id"`
	Media     mediaModels.Media  `gorm:"foreignKey:MediaID" json:"media,omitempty"`
	SortOrder int                `gorm:"default:0" json:"sort_order"`
	Caption   string             `gorm:"type:text" json:"caption,omitempty"`
	AltText   string             `gorm:"type:varchar(255)" json:"alt_text,omitempty"`
}

func (PostMedia) TableName() string { return "post_media" }
