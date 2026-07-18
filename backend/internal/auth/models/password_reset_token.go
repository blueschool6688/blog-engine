package models

import "time"

type PasswordResetToken struct {
	ID        uint       `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID    uint       `gorm:"not null" json:"user_id"`
	TokenHash string     `gorm:"type:text;not null;uniqueIndex" json:"-"`
	ExpiresAt time.Time  `gorm:"not null" json:"expires_at"`
	UsedAt    *time.Time `json:"used_at"`
	CreatedAt time.Time  `json:"created_at"`
}

func (PasswordResetToken) TableName() string {
	return "password_reset_tokens"
}
