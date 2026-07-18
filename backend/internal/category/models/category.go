package models

import "backend/internal/shared/models"

type Category struct {
	models.BaseModel
	Name        string `gorm:"type:varchar(255);not null;uniqueIndex" json:"name"`
	Slug        string `gorm:"type:varchar(255);not null;uniqueIndex" json:"slug"`
	Description string `gorm:"type:text" json:"description,omitempty"`
}

func (Category) TableName() string { return "categories" }
