package models

import "backend/internal/shared/models"

type Feedback struct {
	models.BaseModel
	Name    string `gorm:"type:varchar(255);not null" json:"name"`
	Email   string `gorm:"type:varchar(255);not null" json:"email"`
	Subject string `gorm:"type:varchar(255)" json:"subject,omitempty"`
	Content string `gorm:"type:text;not null" json:"content"`
	Rating  int    `gorm:"type:integer;default:5" json:"rating"`
	Status  string `gorm:"type:varchar(50);default:'pending'" json:"status"` // pending, reviewed, archived
}

func (Feedback) TableName() string {
	return "feedbacks"
}
