package models

import "backend/internal/shared/models"

type Tag struct {
	models.BaseModel
	Name string `gorm:"type:varchar(100);not null;uniqueIndex" json:"name"`
	Slug string `gorm:"type:varchar(100);not null;uniqueIndex" json:"slug"`
}

func (Tag) TableName() string { return "tags" }
