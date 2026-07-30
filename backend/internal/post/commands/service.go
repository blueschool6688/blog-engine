package commands

import (
	"context"
	"errors"
	"fmt"
	"regexp"
	"strings"
	"time"

	"encoding/json"
	categoryModels "backend/internal/category/models"
	"backend/internal/post/models"
	"backend/internal/post/repository"
	tagModels "backend/internal/tag/models"
	"backend/pkg/cache"
	"backend/pkg/cloudflare"

	"gorm.io/gorm"
)

type CreatePostCommand struct {
	Title        string     `json:"title" validate:"required"`
	TitleEn      string     `json:"title_en"`
	Slug         string     `json:"slug"`
	SlugEn       string     `json:"slug_en"`
	Content      string     `json:"content"`
	ContentEn    string     `json:"content_en"`
	CoverMediaID *uint      `json:"cover_media_id"`
	Status       string     `json:"status"` // draft, published
	AuthorID     *uint      `json:"author_id"`
	CategoryIDs  []uint     `json:"category_ids"`
	TagIDs       []uint     `json:"tag_ids"`
	MetaTitle    string     `json:"meta_title"`
	MetaDesc     string     `json:"meta_desc"`
	Excerpt      string     `json:"excerpt"`
	ExcerptEn    string     `json:"excerpt_en"`
	IsFeatured   bool       `json:"is_featured"`
	IsDocument   bool       `json:"is_document"`
	PDFMediaID   *uint      `json:"pdf_media_id"`
	PublishedAt  *time.Time `json:"published_at"`
}

type UpdatePostCommand struct {
	Title        string     `json:"title" validate:"required"`
	TitleEn      string     `json:"title_en"`
	Slug         string     `json:"slug"`
	SlugEn       string     `json:"slug_en"`
	Content      string     `json:"content"`
	ContentEn    string     `json:"content_en"`

	CoverMediaID *uint      `json:"cover_media_id"`
	Status       string     `json:"status"` // draft, published
	CategoryIDs  []uint     `json:"category_ids"`
	TagIDs       []uint     `json:"tag_ids"`
	MetaTitle    string     `json:"meta_title"`
	MetaDesc     string     `json:"meta_desc"`
	Excerpt      string     `json:"excerpt"`
	ExcerptEn    string     `json:"excerpt_en"`
	IsFeatured   bool       `json:"is_featured"`
	IsDocument   bool       `json:"is_document"`
	PDFMediaID   *uint      `json:"pdf_media_id"`
	PublishedAt  *time.Time `json:"published_at"`
}

type BulkPostCommand struct {
	IDs    []uint `json:"ids" validate:"required,min=1"`
	Action string `json:"action" validate:"required,oneof=publish draft delete"`
}

type CommandService struct {
	repo        *repository.PostRepository
	postCache   *cache.PostCache
	cfZoneID    string
	cfAPIToken  string
	appURL      string
}

func NewCommandService(repo *repository.PostRepository, postCache *cache.PostCache, cfZoneID, cfAPIToken, appURL string) *CommandService {
	return &CommandService{
		repo:        repo,
		postCache:   postCache,
		cfZoneID:    cfZoneID,
		cfAPIToken:  cfAPIToken,
		appURL:      appURL,
	}
}

func (s *CommandService) CreatePost(ctx context.Context, cmd CreatePostCommand) (*models.Post, error) {
	if cmd.Title == "" {
		return nil, errors.New("title is required")
	}

	slug := cmd.Slug
	if slug == "" {
		slug = generateSlug(cmd.Title)
	} else {
		slug = generateSlug(slug)
	}

	post := &models.Post{
		Title:        cmd.Title,
		TitleEn:      cmd.TitleEn,
		Slug:         slug,
		SlugEn:       cmd.SlugEn,
		Content:      cmd.Content,
		ContentEn:    cmd.ContentEn,
		CoverMediaID: cmd.CoverMediaID,
		Status:       cmd.Status,
		AuthorID:     cmd.AuthorID,
		MetaTitle:    cmd.MetaTitle,
		MetaDesc:     cmd.MetaDesc,
		Excerpt:      cmd.Excerpt,
		ExcerptEn:    cmd.ExcerptEn,
		IsFeatured:   cmd.IsFeatured,
		IsDocument:   cmd.IsDocument,
		PDFMediaID:   cmd.PDFMediaID,
		PublishedAt:  cmd.PublishedAt,
	}
	if post.Status == "" {
		post.Status = "draft"
	}
	if post.Status == "published" && post.PublishedAt == nil {
		now := time.Now()
		post.PublishedAt = &now
	}

	// Resolve categories
	var categories []categoryModels.Category
	if len(cmd.CategoryIDs) > 0 {
		if err := s.repo.DB.WithContext(ctx).Where("id IN ?", cmd.CategoryIDs).Find(&categories).Error; err != nil {
			return nil, fmt.Errorf("resolve categories: %w", err)
		}
	}
	post.Categories = categories

	// Resolve tags
	var tags []tagModels.Tag
	if len(cmd.TagIDs) > 0 {
		if err := s.repo.DB.WithContext(ctx).Where("id IN ?", cmd.TagIDs).Find(&tags).Error; err != nil {
			return nil, fmt.Errorf("resolve tags: %w", err)
		}
	}
	post.Tags = tags

	if err := s.repo.Insert(ctx, post); err != nil {
		return nil, fmt.Errorf("create post: %w", err)
	}

	if post.Status == "published" {
		_ = s.repo.InsertRagJob(ctx, post.ID)
	}

	s.invalidateListCache(ctx)

	return post, nil
}

func (s *CommandService) UpdatePost(ctx context.Context, id uint, cmd UpdatePostCommand) (*models.Post, error) {
	post, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("find post for update: %w", err)
	}

	oldSlug := post.Slug

	slug := cmd.Slug
	if slug == "" {
		slug = generateSlug(cmd.Title)
	} else {
		slug = generateSlug(slug)
	}

	post.Title = cmd.Title
	post.TitleEn = cmd.TitleEn
	post.Slug = slug
	post.SlugEn = cmd.SlugEn
	post.Content = cmd.Content
	post.ContentEn = cmd.ContentEn
	post.CoverMediaID = cmd.CoverMediaID
	post.Status = cmd.Status
	post.MetaTitle = cmd.MetaTitle
	post.MetaDesc = cmd.MetaDesc
	post.Excerpt = cmd.Excerpt
	post.ExcerptEn = cmd.ExcerptEn
	post.IsFeatured = cmd.IsFeatured
	post.IsDocument = cmd.IsDocument
	post.PDFMediaID = cmd.PDFMediaID
	post.PublishedAt = cmd.PublishedAt
	if post.Status == "published" && post.PublishedAt == nil {
		now := time.Now()
		post.PublishedAt = &now
	}

	// Update associations
	var categories []categoryModels.Category
	if len(cmd.CategoryIDs) > 0 {
		if err := s.repo.DB.WithContext(ctx).Where("id IN ?", cmd.CategoryIDs).Find(&categories).Error; err != nil {
			return nil, fmt.Errorf("resolve categories for update: %w", err)
		}
	}
	if err := s.repo.DB.WithContext(ctx).Model(post).Association("Categories").Replace(&categories); err != nil {
		return nil, fmt.Errorf("replace categories: %w", err)
	}
	post.Categories = categories

	var tags []tagModels.Tag
	if len(cmd.TagIDs) > 0 {
		if err := s.repo.DB.WithContext(ctx).Where("id IN ?", cmd.TagIDs).Find(&tags).Error; err != nil {
			return nil, fmt.Errorf("resolve tags for update: %w", err)
		}
	}
	if err := s.repo.DB.WithContext(ctx).Model(post).Association("Tags").Replace(&tags); err != nil {
		return nil, fmt.Errorf("replace tags: %w", err)
	}
	post.Tags = tags

	if err := s.repo.Update(ctx, post); err != nil {
		return nil, fmt.Errorf("update post: %w", err)
	}

	if post.Status == "published" {
		_ = s.repo.InsertRagJob(ctx, post.ID)
	}

	s.invalidateListCache(ctx)

	// Clean up old slug cache if slug changed
	if oldSlug != post.Slug {
		_ = s.postCache.DeletePostHTML(ctx, oldSlug)
		detailUrls := []string{
			fmt.Sprintf("%s/posts/%s", strings.TrimSuffix(s.appURL, "/"), oldSlug),
		}
		cloudflare.PurgeCacheAsync(s.cfZoneID, s.cfAPIToken, detailUrls)
	}

	// Dynamic warming: Set/warm the cache immediately if published, else delete
	if post.Status == "published" {
		var fullPost models.Post
		err := s.repo.DB.WithContext(ctx).
			Preload("CoverMedia").
			Preload("Author").
			Preload("Categories").
			Preload("Tags").
			Preload("Gallery", func(db *gorm.DB) *gorm.DB {
				return db.Order("post_media.sort_order ASC")
			}).
			Preload("Gallery.Media").
			Preload("PDFMedia").
			Where("id = ?", post.ID).
			First(&fullPost).Error
		
		if err == nil {
			marshaled, err := json.Marshal(fullPost)
			if err == nil {
				_ = s.postCache.SetPostHTML(ctx, fullPost.Slug, string(marshaled), 3600)
			}
		}
	} else {
		_ = s.postCache.DeletePostHTML(ctx, post.Slug)
	}

	// Purge Cloudflare Edge cache for the new/updated post
	detailUrls := []string{
		fmt.Sprintf("%s/posts/%s", strings.TrimSuffix(s.appURL, "/"), post.Slug),
	}
	cloudflare.PurgeCacheAsync(s.cfZoneID, s.cfAPIToken, detailUrls)

	return post, nil
}

func (s *CommandService) DeletePost(ctx context.Context, id uint, force bool) error {
	var post models.Post
	var slug string
	if err := s.repo.DB.WithContext(ctx).Select("slug").Where("id = ?", id).First(&post).Error; err == nil {
		slug = post.Slug
	}

	if force {
		if err := s.repo.PermanentDelete(ctx, id); err != nil {
			return fmt.Errorf("permanent delete post: %w", err)
		}
	} else {
		if err := s.repo.Delete(ctx, id); err != nil {
			return fmt.Errorf("delete post: %w", err)
		}
	}

	s.invalidateListCache(ctx)
	if slug != "" {
		_ = s.postCache.DeletePostHTML(ctx, slug)
		detailUrls := []string{
			fmt.Sprintf("%s/posts/%s", strings.TrimSuffix(s.appURL, "/"), slug),
		}
		cloudflare.PurgeCacheAsync(s.cfZoneID, s.cfAPIToken, detailUrls)
	}

	return nil
}

func (s *CommandService) RestorePost(ctx context.Context, id uint) error {
	if err := s.repo.Restore(ctx, id); err != nil {
		return fmt.Errorf("restore post: %w", err)
	}
	s.invalidateListCache(ctx)
	s.invalidateDetailCache(ctx, id)
	return nil
}

func (s *CommandService) invalidateListCache(ctx context.Context) {
	_ = s.postCache.InvalidatePostLists(ctx)

	// Purge Cloudflare cache for list pages
	listUrls := []string{
		strings.TrimSuffix(s.appURL, "/") + "/",
		strings.TrimSuffix(s.appURL, "/") + "/posts",
	}
	cloudflare.PurgeCacheAsync(s.cfZoneID, s.cfAPIToken, listUrls)
}

func (s *CommandService) invalidateDetailCache(ctx context.Context, id uint) {
	var post models.Post
	if err := s.repo.DB.WithContext(ctx).Select("slug").Where("id = ?", id).First(&post).Error; err == nil {
		_ = s.postCache.DeletePostHTML(ctx, post.Slug)

		// Purge Cloudflare cache for detail pages
		detailUrls := []string{
			fmt.Sprintf("%s/posts/%s", strings.TrimSuffix(s.appURL, "/"), post.Slug),
		}
		cloudflare.PurgeCacheAsync(s.cfZoneID, s.cfAPIToken, detailUrls)
	}
}

func generateSlug(title string) string {
	slug := strings.ToLower(title)
	
	// Convert Vietnamese accented characters to ASCII equivalents
	vietnameseMap := map[string]string{
		"à": "a", "á": "a", "ạ": "a", "ả": "a", "ã": "a", "â": "a", "ầ": "a", "ấ": "a", "ậ": "a", "ẩ": "a", "ẫ": "a", "ă": "a", "ằ": "a", "ắ": "a", "ặ": "a", "ẳ": "a", "ẵ": "a",
		"è": "e", "é": "e", "ẹ": "e", "ẻ": "e", "ẽ": "e", "ê": "e", "ề": "e", "ế": "e", "ệ": "e", "ể": "e", "ễ": "e",
		"ì": "i", "í": "i", "ị": "i", "ỉ": "i", "ĩ": "i",
		"ò": "o", "ó": "o", "ọ": "o", "ỏ": "o", "õ": "o", "ô": "o", "ồ": "o", "ố": "o", "ộ": "o", "ổ": "o", "ỗ": "o", "ơ": "o", "ờ": "o", "ớ": "o", "ợ": "o", "ở": "o", "ỡ": "o",
		"ù": "u", "ú": "u", "ụ": "u", "ủ": "u", "ũ": "u", "ư": "u", "ừ": "u", "ứ": "u", "ự": "u", "ử": "u", "ữ": "u",
		"ỳ": "y", "ý": "y", "ỵ": "y", "ỷ": "y", "ỹ": "y",
		"đ": "d",
	}
	for vn, en := range vietnameseMap {
		slug = strings.ReplaceAll(slug, vn, en)
	}

	slug = strings.ReplaceAll(slug, " ", "-")
	reg := regexp.MustCompile("[^a-z0-9-]+")
	slug = reg.ReplaceAllString(slug, "")
	regDash := regexp.MustCompile("-+")
	slug = regDash.ReplaceAllString(slug, "-")
	return strings.Trim(slug, "-")
}

func (s *CommandService) AttachMedia(ctx context.Context, postID uint, mediaID uint, caption string, altText string) (*models.PostMedia, error) {
	// First check if post exists
	var count int64
	if err := s.repo.DB.WithContext(ctx).Model(&models.Post{}).Where("id = ?", postID).Count(&count).Error; err != nil {
		return nil, fmt.Errorf("check post existence: %w", err)
	}
	if count == 0 {
		return nil, errors.New("post not found")
	}

	// Check if already attached
	var existing models.PostMedia
	err := s.repo.DB.WithContext(ctx).Where("post_id = ? AND media_id = ?", postID, mediaID).First(&existing).Error
	if err == nil {
		// Already attached, update caption/alt text
		existing.Caption = caption
		existing.AltText = altText
		if err := s.repo.DB.WithContext(ctx).Save(&existing).Error; err != nil {
			return nil, fmt.Errorf("update existing post media: %w", err)
		}
		s.invalidateDetailCache(ctx, postID)
		s.invalidateListCache(ctx)
		return &existing, nil
	}

	// Get max sort order
	var maxSortOrder int
	row := s.repo.DB.WithContext(ctx).Table("post_media").Where("post_id = ?", postID).Select("COALESCE(MAX(sort_order), -1)").Row()
	_ = row.Scan(&maxSortOrder)

	postMedia := &models.PostMedia{
		PostID:    postID,
		MediaID:   mediaID,
		SortOrder: maxSortOrder + 1,
		Caption:   caption,
		AltText:   altText,
	}

	if err := s.repo.DB.WithContext(ctx).Create(postMedia).Error; err != nil {
		return nil, fmt.Errorf("create post media: %w", err)
	}

	// Preload media info to return
	if err := s.repo.DB.WithContext(ctx).Preload("Media").First(postMedia, postMedia.ID).Error; err != nil {
		return nil, fmt.Errorf("preload attached media: %w", err)
	}

	s.invalidateDetailCache(ctx, postID)
	s.invalidateListCache(ctx)

	return postMedia, nil
}

func (s *CommandService) DetachMedia(ctx context.Context, postID uint, mediaID uint) error {
	result := s.repo.DB.WithContext(ctx).Where("post_id = ? AND media_id = ?", postID, mediaID).Delete(&models.PostMedia{})
	if result.Error != nil {
		return fmt.Errorf("delete post media: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return errors.New("post media association not found")
	}

	s.invalidateDetailCache(ctx, postID)
	s.invalidateListCache(ctx)

	return nil
}

type ReorderItem struct {
	MediaID   uint `json:"media_id"`
	SortOrder int  `json:"sort_order"`
}

func (s *CommandService) ReorderGallery(ctx context.Context, postID uint, items []ReorderItem) error {
	err := s.repo.DB.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		for _, item := range items {
			err := tx.Model(&models.PostMedia{}).
				Where("post_id = ? AND media_id = ?", postID, item.MediaID).
				Update("sort_order", item.SortOrder).Error
			if err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		return fmt.Errorf("reorder gallery transaction: %w", err)
	}

	s.invalidateDetailCache(ctx, postID)
	s.invalidateListCache(ctx)

	return nil
}

func (s *CommandService) BulkPost(ctx context.Context, cmd BulkPostCommand) (int64, error) {
	if len(cmd.IDs) == 0 {
		return 0, errors.New("no IDs provided")
	}

	var rowsAffected int64

	switch cmd.Action {
	case "publish":
		now := time.Now()
		result := s.repo.DB.WithContext(ctx).Model(&models.Post{}).
			Where("id IN ?", cmd.IDs).
			Updates(map[string]interface{}{"status": "published", "published_at": now})
		if result.Error != nil {
			return 0, fmt.Errorf("bulk publish: %w", result.Error)
		}
		rowsAffected = result.RowsAffected
		
		for _, id := range cmd.IDs {
			_ = s.repo.InsertRagJob(ctx, id)
		}
	case "draft":
		result := s.repo.DB.WithContext(ctx).Model(&models.Post{}).
			Where("id IN ?", cmd.IDs).
			UpdateColumn("status", "draft")
		if result.Error != nil {
			return 0, fmt.Errorf("bulk draft: %w", result.Error)
		}
		rowsAffected = result.RowsAffected
	case "delete":
		result := s.repo.DB.WithContext(ctx).Where("id IN ?", cmd.IDs).Delete(&models.Post{})
		if result.Error != nil {
			return 0, fmt.Errorf("bulk delete: %w", result.Error)
		}
		rowsAffected = result.RowsAffected
	default:
		return 0, errors.New("invalid action")
	}

	s.invalidateListCache(ctx)
	// Invalidate details for all changed posts
	for _, id := range cmd.IDs {
		s.invalidateDetailCache(ctx, id)
	}

	return rowsAffected, nil
}

