package queries_test

import (
	"context"
	"testing"
	"time"

	authModels "backend/internal/auth/models"
	categoryModels "backend/internal/category/models"
	mediaModels "backend/internal/media/models"
	"backend/internal/post/models"
	"backend/internal/post/queries"
	"backend/internal/post/repository"
	tagModels "backend/internal/tag/models"
	"backend/pkg/cache"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

func setupPostQueryDB(t *testing.T) (*gorm.DB, func()) {
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

func TestQueryService_GetPostByID_And_ListPosts(t *testing.T) {
	db, cleanup := setupPostQueryDB(t)
	defer cleanup()

	repo := repository.NewPostRepository(db)
	cacheStore := cache.NewMemcachedStore("127.0.0.1:11211")
	svc := queries.NewQueryService(repo, cacheStore)

	ctx := context.Background()

	// Seed static data
	author := &authModels.User{Name: "Writer", Email: "writer@example.com"}
	_ = db.Create(author).Error

	cat := &categoryModels.Category{Name: "Life", Slug: "life"}
	_ = db.Create(cat).Error

	tag := &tagModels.Tag{Name: "General", Slug: "general"}
	_ = db.Create(tag).Error

	now := time.Now()
	// Insert 2 posts
	p1 := &models.Post{
		Title:       "Post One",
		Slug:        "post-one",
		Content:     "Content for post one",
		Status:      "published",
		AuthorID:    &author.ID,
		Categories:  []categoryModels.Category{*cat},
		Tags:        []tagModels.Tag{*tag},
		PublishedAt: &now,
	}
	_ = db.Create(p1).Error

	p2 := &models.Post{
		Title:       "Post Two (Draft)",
		Slug:        "post-two",
		Content:     "Content for post two",
		Status:      "draft",
		AuthorID:    &author.ID,
		PublishedAt: nil,
	}
	_ = db.Create(p2).Error

	// Test GetPostByID
	fetchedPost, err := svc.GetPostByID(ctx, p1.ID)
	if err != nil {
		t.Fatalf("expected successful fetch by ID, got error: %v", err)
	}
	if fetchedPost.Title != "Post One" {
		t.Errorf("expected title 'Post One', got %q", fetchedPost.Title)
	}

	// Test ListPosts (filter published status)
	res, err := svc.ListPosts(ctx, 0, 10, "published", "", 0, 0, false)
	if err != nil {
		t.Fatalf("expected successful list, got error: %v", err)
	}

	if res.Total != 1 {
		t.Errorf("expected 1 published post, got %d", res.Total)
	}

	if len(res.Items) != 1 || res.Items[0].Title != "Post One" {
		t.Errorf("expected item 'Post One', got list size %d", len(res.Items))
	}

	// Test ListPosts (filter draft status)
	resDraft, err := svc.ListPosts(ctx, 0, 10, "draft", "", 0, 0, false)
	if err != nil {
		t.Fatalf("expected successful list, got error: %v", err)
	}

	if resDraft.Total != 1 {
		t.Errorf("expected 1 draft post, got %d", resDraft.Total)
	}
}
