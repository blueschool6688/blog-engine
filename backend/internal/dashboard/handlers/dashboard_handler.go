package handlers

import (
	"context"
	"os"
	"path/filepath"
	"time"

	categoryModels "backend/internal/category/models"
	mediaModels "backend/internal/media/models"
	postModels "backend/internal/post/models"
	"backend/internal/shared/response"
	tagModels "backend/internal/tag/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type DashboardHandler struct {
	db         *gorm.DB
	uploadsDir string
}

func NewDashboardHandler(db *gorm.DB, uploadsDir string) *DashboardHandler {
	return &DashboardHandler{
		db:         db,
		uploadsDir: uploadsDir,
	}
}

type MonthCount struct {
	Month string `json:"month"`
	Count int    `json:"count"`
}

type DayViewCount struct {
	Date  string `json:"date"`
	Count int    `json:"count"`
}

type DashboardStatsResponse struct {
	TotalPosts     int64             `json:"total_posts"`
	PublishedPosts int64             `json:"published_posts"`
	DraftPosts     int64             `json:"draft_posts"`
	MediaCount     int64             `json:"media_count"`
	CategoryCount  int64             `json:"category_count"`
	TagCount       int64             `json:"tag_count"`
	PostsByMonth   []MonthCount      `json:"posts_by_month"`
	ViewsByDay     []DayViewCount    `json:"views_by_day"`
	RecentPosts    []postModels.Post `json:"recent_posts"`
	StorageUsageMB float64           `json:"storage_usage_mb"`
}

func (h *DashboardHandler) GetStats(c *fiber.Ctx) error {
	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	var totalPosts, publishedPosts, draftPosts int64
	var mediaCount, categoryCount, tagCount int64

	// Counts
	if err := h.db.WithContext(ctx).Model(&postModels.Post{}).Count(&totalPosts).Error; err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to count posts", err.Error())
	}
	if err := h.db.WithContext(ctx).Model(&postModels.Post{}).Where("status = ?", "published").Count(&publishedPosts).Error; err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to count published posts", err.Error())
	}
	if err := h.db.WithContext(ctx).Model(&postModels.Post{}).Where("status = ?", "draft").Count(&draftPosts).Error; err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to count draft posts", err.Error())
	}
	if err := h.db.WithContext(ctx).Model(&mediaModels.Media{}).Count(&mediaCount).Error; err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to count media", err.Error())
	}
	if err := h.db.WithContext(ctx).Model(&categoryModels.Category{}).Count(&categoryCount).Error; err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to count categories", err.Error())
	}
	if err := h.db.WithContext(ctx).Model(&tagModels.Tag{}).Count(&tagCount).Error; err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to count tags", err.Error())
	}

	// Posts by month for the current year
	var posts []struct {
		CreatedAt time.Time
	}
	if err := h.db.WithContext(ctx).Model(&postModels.Post{}).Select("created_at").Find(&posts).Error; err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to fetch posts for monthly stats", err.Error())
	}

	currentYear := time.Now().Year()
	monthlyCounts := make(map[string]int)
	months := []string{"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"}
	for _, m := range months {
		monthlyCounts[m] = 0
	}
	for _, p := range posts {
		if p.CreatedAt.Year() == currentYear {
			mName := p.CreatedAt.Format("Jan")
			monthlyCounts[mName]++
		}
	}

	var postsByMonth []MonthCount
	for _, m := range months {
		postsByMonth = append(postsByMonth, MonthCount{
			Month: m,
			Count: monthlyCounts[m],
		})
	}

	// Recent 5 posts
	var recentPosts []postModels.Post
	if err := h.db.WithContext(ctx).Model(&postModels.Post{}).
		Order("created_at desc").
		Limit(5).
		Preload("Author").
		Preload("CoverMedia").
		Find(&recentPosts).Error; err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to fetch recent posts", err.Error())
	}

	// Storage usage calculation
	var storageUsage float64
	_ = filepath.Walk(h.uploadsDir, func(_ string, info os.FileInfo, err error) error {
		if err != nil {
			return nil
		}
		if !info.IsDir() {
			storageUsage += float64(info.Size())
		}
		return nil
	})
	// Convert to MB
	storageUsageMB := storageUsage / (1024 * 1024)

	// Daily page views for the last 30 days
	var dailyViews []DayViewCount
	if err := h.db.WithContext(ctx).Raw(`
		SELECT TO_CHAR(viewed_at, 'YYYY-MM-DD') AS date, COUNT(*) AS count
		FROM post_views
		WHERE viewed_at >= NOW() - INTERVAL '30 days'
		GROUP BY TO_CHAR(viewed_at, 'YYYY-MM-DD')
		ORDER BY date ASC
	`).Scan(&dailyViews).Error; err != nil {
		dailyViews = []DayViewCount{}
	}

	// Return response
	res := DashboardStatsResponse{
		TotalPosts:     totalPosts,
		PublishedPosts: publishedPosts,
		DraftPosts:     draftPosts,
		MediaCount:     mediaCount,
		CategoryCount:  categoryCount,
		TagCount:       tagCount,
		PostsByMonth:   postsByMonth,
		ViewsByDay:     dailyViews,
		RecentPosts:    recentPosts,
		StorageUsageMB: storageUsageMB,
	}

	return response.Success(c, fiber.StatusOK, res, "Dashboard statistics retrieved successfully")
}
