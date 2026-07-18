package models

import "time"

type PostView struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	PostID    uint      `gorm:"index" json:"post_id"`
	ViewedAt  time.Time `json:"viewed_at"`
	IPAddress string    `gorm:"type:varchar(45)" json:"ip_address"`
	UserAgent string    `gorm:"type:text" json:"user_agent"`
	Referrer  string    `gorm:"type:text" json:"referrer"`
}

func (PostView) TableName() string {
	return "post_views"
}
