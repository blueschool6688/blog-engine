package models

import "time"

type Comment struct {
	ID          uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	PostID      uint      `gorm:"not null" json:"post_id"`
	ParentID    *uint     `json:"parent_id,omitempty"`
	AuthorName  string    `gorm:"type:varchar(255)" json:"author_name"`
	AuthorEmail string    `gorm:"type:varchar(255)" json:"-"`
	Content     string    `gorm:"type:text;not null" json:"content"`
	Status      string    `gorm:"type:varchar(50);not null;default:'pending'" json:"status"`
	IPAddress   string    `gorm:"type:varchar(45)" json:"-"`
	SpamScore   *float64  `gorm:"type:decimal(4,3)" json:"spam_score,omitempty"`
	Replies     []Comment `gorm:"foreignKey:ParentID" json:"replies,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (Comment) TableName() string {
	return "comments"
}
