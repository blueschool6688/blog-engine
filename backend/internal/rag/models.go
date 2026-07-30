package rag

import (
	"time"
)

type BlogChunk struct {
	ID         uint      `gorm:"primaryKey"`
	PostID     uint      `gorm:"column:post_id;not null"`
	ChunkIndex int       `gorm:"column:chunk_index;not null"`
	Content    string    `gorm:"column:content;not null"`
	// We'll leave embedding out of GORM struct for simplicity or just keep it as string/byte array
	// If pgvector is used, you could use a string for the array syntax, e.g. '[0.1, 0.2, ...]'
	// But it's easier to just use raw SQL for insertion.
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

func (BlogChunk) TableName() string {
	return "blog_chunks"
}

type RagJob struct {
	ID        uint      `gorm:"primaryKey"`
	PostID    uint      `gorm:"column:post_id;not null"`
	Status    string    `gorm:"column:status;default:'pending'"`
	ErrorMsg  string    `gorm:"column:error_msg"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (RagJob) TableName() string {
	return "rag_jobs"
}

type ChatMessage struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Fingerprint string    `gorm:"column:fingerprint;type:varchar(255);not null" json:"fingerprint"`
	Role        string    `gorm:"column:role;type:varchar(50);not null" json:"role"`
	Content     string    `gorm:"column:content;not null" json:"content"`
	CreatedAt   time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
}

func (ChatMessage) TableName() string {
	return "chat_messages"
}
