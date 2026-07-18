package models

import (
	"backend/internal/shared/models"
)

type User struct {
	models.BaseModel
	Name      string `gorm:"type:varchar(255);not null" json:"name"`
	Nickname  string `gorm:"type:varchar(100);not null" json:"nickname"`
	Email     string `gorm:"type:varchar(255);not null;uniqueIndex" json:"email"`
	Password  string `gorm:"column:password;type:text;not null" json:"-"`
	AvatarURL string `gorm:"type:text" json:"avatar_url,omitempty"`
	Bio       string `gorm:"type:text" json:"bio,omitempty"`
	Role      string `gorm:"type:varchar(50);not null;default:'admin'" json:"role"`
	IsActive  bool   `gorm:"type:boolean;not null;default:true" json:"is_active"`
}

func (User) TableName() string {
	return "users"
}
