package models

import "time"

type Reaction struct {
	ID          uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	PostID      uint      `gorm:"not null" json:"post_id"`
	Emoji       string    `gorm:"type:varchar(20);not null" json:"emoji"`
	Fingerprint string    `gorm:"type:varchar(255);not null" json:"-"`
	CreatedAt   time.Time `json:"created_at"`
}

func (Reaction) TableName() string {
	return "reactions"
}

type ReactionCount struct {
	Emoji   string `json:"emoji"`
	Count   int64  `json:"count"`
	Reacted bool   `json:"reacted"`
}
