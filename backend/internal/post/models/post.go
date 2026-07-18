package models

import (
	"time"

	authModels "backend/internal/auth/models"
	categoryModels "backend/internal/category/models"
	mediaModels "backend/internal/media/models"
	"backend/internal/shared/models"
	tagModels "backend/internal/tag/models"
)

type Post struct {
	models.BaseModel
	Title        string                    `gorm:"type:varchar(255);not null" json:"title"`
	Slug         string                    `gorm:"type:varchar(255);not null;uniqueIndex" json:"slug"`
	Content      string                    `gorm:"type:text" json:"content"`
	CoverMediaID *uint                     `json:"cover_media_id"`
	CoverMedia   *mediaModels.Media        `gorm:"foreignKey:CoverMediaID" json:"cover_media,omitempty"`
	Status       string                    `gorm:"type:varchar(50);not null;default:'draft'" json:"status"` // draft, published
	AuthorID     *uint                     `json:"author_id"`
	Author       *authModels.User          `gorm:"foreignKey:AuthorID" json:"author,omitempty"`
	Categories   []categoryModels.Category `gorm:"many2many:post_categories;" json:"categories,omitempty"`
	Tags         []tagModels.Tag           `gorm:"many2many:post_tags;" json:"tags,omitempty"`
	Gallery      []PostMedia               `gorm:"foreignKey:PostID" json:"gallery,omitempty"`
	MetaTitle    string                    `gorm:"type:varchar(255)" json:"meta_title"`
	MetaDesc     string                    `gorm:"type:text" json:"meta_desc"`
	Excerpt      string                    `gorm:"type:text" json:"excerpt"`
	IsFeatured   bool                      `gorm:"type:boolean;default:false" json:"is_featured"`
	PublishedAt  *time.Time                `gorm:"type:timestamp" json:"published_at"`
	ViewCount    int64                     `gorm:"type:bigint;default:0" json:"view_count"`
	SearchVector string                    `gorm:"column:search_vector;type:tsvector;->;default:null" json:"-"`
}

func (Post) TableName() string {
	return "posts"
}

