package models

import "backend/internal/shared/models"

type Category struct {
	models.BaseModel
	Name          string      `gorm:"type:varchar(255);not null;uniqueIndex" json:"name"`
	NameEn        string      `gorm:"type:varchar(255)" json:"name_en"`
	Slug          string      `gorm:"type:varchar(255);not null;uniqueIndex" json:"slug"`
	SlugEn        string      `gorm:"type:varchar(255)" json:"slug_en"`
	Description   string      `gorm:"type:text" json:"description,omitempty"`
	DescriptionEn string      `gorm:"type:text" json:"description_en,omitempty"`
	ParentID      *uint       `json:"parent_id,omitempty"`
	Parent        *Category   `gorm:"foreignKey:ParentID" json:"parent,omitempty"`
	Children      []Category  `gorm:"foreignKey:ParentID" json:"children,omitempty"`
}

func (Category) TableName() string { return "categories" }
