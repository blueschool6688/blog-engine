package commands_test

import (
	"context"
	"testing"
	"time"

	authModels "backend/internal/auth/models"
	categoryModels "backend/internal/category/models"
	mediaModels "backend/internal/media/models"
	"backend/internal/post/commands"
	"backend/internal/post/models"
	"backend/internal/post/repository"
	tagModels "backend/internal/tag/models"
	"backend/pkg/cache"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

func setupPostDB(t *testing.T) (*gorm.DB, func()) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect database: %v", err)
	}

	err = db.AutoMigrate(
		&authModels.User{},
		&mediaModels.Media{},
		&models.Post{},
		&models.PostMedia{},
		&categoryModels.Category{},
		&tagModels.Tag{},
	)
	if err != nil {
		t.Fatalf("failed to migrate database: %v", err)
	}

	cleanup := func() {
		sqlDB, err := db.DB()
		if err == nil {
			_ = sqlDB.Close()
		}
	}

	return db, cleanup
}

func TestCommandService_CreatePost(t *testing.T) {
	db, cleanup := setupPostDB(t)
	defer cleanup()

	repo := repository.NewPostRepository(db)
	cacheStore := cache.NewMemcachedStore("127.0.0.1:11211")
	svc := commands.NewCommandService(repo, cacheStore)

	ctx := context.Background()

	// Seed author
	author := &authModels.User{
		Name:     "John Doe",
		Email:    "john@example.com",
		Password: "hashed",
		Role:     "author",
	}
	if err := db.Create(author).Error; err != nil {
		t.Fatalf("failed to seed author: %v", err)
	}

	// Seed category
	cat := &categoryModels.Category{
		Name: "Tech",
		Slug: "tech",
	}
	if err := db.Create(cat).Error; err != nil {
		t.Fatalf("failed to seed category: %v", err)
	}

	// Seed tag
	tag := &tagModels.Tag{
		Name: "Go",
		Slug: "go",
	}
	if err := db.Create(tag).Error; err != nil {
		t.Fatalf("failed to seed tag: %v", err)
	}

	now := time.Now()
	cmd := commands.CreatePostCommand{
		Title:       "Testing Post Commands",
		Slug:        "testing-post-commands",
		Content:     "This is a test post content.",
		Status:      "published",
		AuthorID:    &author.ID,
		CategoryIDs: []uint{cat.ID},
		TagIDs:      []uint{tag.ID},
		PublishedAt: &now,
	}

	post, err := svc.CreatePost(ctx, cmd)
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}

	if post.ID == 0 {
		t.Error("expected generated post ID to be non-zero")
	}

	if post.Title != cmd.Title {
		t.Errorf("expected title %q, got %q", cmd.Title, post.Title)
	}

	// Verify database associations
	var dbPost models.Post
	err = db.Preload("Categories").Preload("Tags").First(&dbPost, post.ID).Error
	if err != nil {
		t.Fatalf("failed to fetch post from DB: %v", err)
	}

	if len(dbPost.Categories) != 1 || dbPost.Categories[0].Name != "Tech" {
		t.Error("expected Category association not resolved correctly")
	}

	if len(dbPost.Tags) != 1 || dbPost.Tags[0].Name != "Go" {
		t.Error("expected Tag association not resolved correctly")
	}
}
