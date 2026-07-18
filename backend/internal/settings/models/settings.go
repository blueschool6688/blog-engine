package models

import "backend/internal/shared/models"

type Setting struct {
	models.BaseModel
	Key   string `gorm:"type:varchar(100);not null;uniqueIndex" json:"key"`
	Value string `gorm:"type:text" json:"value"`
}

func (Setting) TableName() string { return "settings" }
