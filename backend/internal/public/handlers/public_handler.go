package handlers

import (
	"context"
	"encoding/xml"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"

	auditService "backend/internal/audit/service"
	categoryRepo "backend/internal/category/repository"
	postModels "backend/internal/post/models"
	postRepo "backend/internal/post/repository"
	"backend/internal/shared/response"
	tagRepo "backend/internal/tag/repository"
	"backend/pkg/cache"
	"encoding/json"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type PublicHandler struct {
	postRepo     *postRepo.PostRepository
	categoryRepo *categoryRepo.CategoryRepository
	tagRepo      *tagRepo.TagRepository
	postCache    *cache.PostCache
	auditSvc     *auditService.AuditService
}

func NewPublicHandler(
	postRepo *postRepo.PostRepository,
	categoryRepo *categoryRepo.CategoryRepository,
	tagRepo *tagRepo.TagRepository,
	postCache *cache.PostCache,
	auditSvc *auditService.AuditService,
) *PublicHandler {
	return &PublicHandler{
		postRepo:     postRepo,
		categoryRepo: categoryRepo,
		tagRepo:      tagRepo,
		postCache:    postCache,
		auditSvc:     auditSvc,
	}
}

type PublicListPostsResponse struct {
	Items []*postModels.Post `json:"items"`
	Total int64              `json:"total"`
}

func (h *PublicHandler) ListPosts(c *fiber.Ctx) error {
	offsetStr := c.Query("offset", "0")
	limitStr := c.Query("limit", "10")
	search := c.Query("search", "")
	categoryIDStr := c.Query("category_id", "0")
	tagIDStr := c.Query("tag_id", "0")
	isFeaturedStr := c.Query("is_featured", "false")

	offset, err := strconv.Atoi(offsetStr)
	if err != nil || offset < 0 {
		offset = 0
	}
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 10
	}

	categoryID, _ := strconv.ParseUint(categoryIDStr, 10, 32)
	tagID, _ := strconv.ParseUint(tagIDStr, 10, 32)
	isFeatured, _ := strconv.ParseBool(isFeaturedStr)
	authorIDStr := c.Query("author_id", "0")
	authorID, _ := strconv.ParseUint(authorIDStr, 10, 32)
	nickName := c.Query("nickname", "")

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	// Set Cache-Control header: browser 5 mins, Cloudflare edge 1 hour
	c.Set("Cache-Control", "public, max-age=300, s-maxage=3600")

	// Determine if there are specific query filters applied
	hasFilters := search != "" || categoryID > 0 || tagID > 0 || isFeatured || authorID > 0 || nickName != ""

	var cachedData []byte
	var hit bool
	var queryHash string

	if hasFilters {
		queryString := fmt.Sprintf("offset:%d:limit:%d:search:%s:category:%d:tag:%d:featured:%t:author:%d:nickname:%s", offset, limit, search, categoryID, tagID, isFeatured, authorID, nickName)
		queryHash = cache.HashQuery(queryString)
		cachedData, hit, _ = h.postCache.GetSearchResult(ctx, queryHash)
	} else {
		page := (offset / limit) + 1
		cachedData, hit, _ = h.postCache.GetPostList(ctx, page, "published")
	}

	if hit && len(cachedData) > 0 {
		// Unmarshal cached data then re-wrap with standard APIResponse
		var cached PublicListPostsResponse
		if jsonErr := json.Unmarshal(cachedData, &cached); jsonErr == nil {
			return response.Success(c, fiber.StatusOK, &cached, "Posts retrieved successfully")
		}
	}

	// Query from DB: status must be 'published'
	tx := h.postRepo.DB.WithContext(ctx).Model(&postModels.Post{}).Where("posts.status = ?", "published")

	if isFeatured {
		tx = tx.Where("posts.is_featured = ?", true)
	}
	if categoryID > 0 {
		tx = tx.Joins("JOIN post_categories ON post_categories.post_id = posts.id").
			Where("post_categories.category_id = ?", categoryID)
	}
	if tagID > 0 {
		tx = tx.Joins("JOIN post_tags ON post_tags.post_id = posts.id").
			Where("post_tags.tag_id = ?", tagID)
	}
	if authorID > 0 {
		tx = tx.Where("posts.author_id = ?", authorID)
	}
	if nickName != "" {
		tx = tx.Joins("JOIN users ON users.id = posts.author_id").
			Where("users.nickname = ?", nickName)
	}
	if search != "" {
		tx = tx.Where("posts.search_vector @@ plainto_tsquery('english', ?) OR posts.title ILIKE ? OR posts.content ILIKE ?", search, "%"+search+"%", "%"+search+"%")
	}

	var total int64
	if err := tx.Session(&gorm.Session{}).Count(&total).Error; err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to count posts", err.Error())
	}

	var posts []*postModels.Post
	err = tx.Session(&gorm.Session{}).
		Preload("CoverMedia").
		Preload("Author").
		Preload("Categories").
		Preload("Tags").
		Preload("Gallery", func(db *gorm.DB) *gorm.DB {
			return db.Order("post_media.sort_order ASC")
		}).
		Preload("Gallery.Media").
		Offset(offset).Limit(limit).Order("posts.id desc").
		Find(&posts).Error
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to retrieve posts", err.Error())
	}

	res := PublicListPostsResponse{
		Items: posts,
		Total: total,
	}

	// Set cache asynchronously / safely
	marshaled, err := json.Marshal(res)
	if err == nil {
		if hasFilters {
			_ = h.postCache.SetSearchResult(ctx, queryHash, marshaled, 300) // 5 minutes for search
		} else {
			page := (offset / limit) + 1
			_ = h.postCache.SetPostList(ctx, page, "published", marshaled, 600) // 10 minutes for static listing
		}
	}

	go h.auditSvc.Log(nil, "view_post_list", "post", nil, nil, c.IP())

	return response.Success(c, fiber.StatusOK, &res, "Posts retrieved successfully")
}

func (h *PublicHandler) GetPostBySlug(c *fiber.Ctx) error {
	slug := c.Params("slug")
	if slug == "" {
		return response.Error(c, fiber.StatusBadRequest, "Slug is required", nil)
	}

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	// Set Cache-Control header: browser 5 mins, Cloudflare edge 1 hour
	c.Set("Cache-Control", "public, max-age=300, s-maxage=3600")

	var post postModels.Post
	jsonStr, hit, err := h.postCache.GetPostHTML(ctx, slug)
	if hit && err == nil && jsonStr != "" {
		if unmarshalErr := json.Unmarshal([]byte(jsonStr), &post); unmarshalErr == nil && post.ID > 0 {
			h.recordPostViewAsync(post.ID, c.IP(), c.Get("User-Agent"), c.Get("Referer"))
			return response.Success(c, fiber.StatusOK, &post, "Post retrieved successfully")
		}
	}

	// Cache miss, query DB
	err = h.postRepo.DB.WithContext(ctx).
		Preload("CoverMedia").
		Preload("Author").
		Preload("Categories").
		Preload("Tags").
		Preload("Gallery", func(db *gorm.DB) *gorm.DB {
			return db.Order("post_media.sort_order ASC")
		}).
		Preload("Gallery.Media").
		Where("slug = ? AND status = ?", slug, "published").
		First(&post).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return response.Error(c, fiber.StatusNotFound, "Post not found", err.Error())
		}
		return response.Error(c, fiber.StatusInternalServerError, "Failed to retrieve post", err.Error())
	}

	// Cache the full Post JSON model under the slug html key
	marshaled, err := json.Marshal(post)
	if err == nil {
		_ = h.postCache.SetPostHTML(ctx, slug, string(marshaled), 3600) // 1 hour TTL
	}

	h.recordPostViewAsync(post.ID, c.IP(), c.Get("User-Agent"), c.Get("Referer"))
	go h.auditSvc.Log(nil, "view_post_detail", "post", &post.ID, nil, c.IP())

	return response.Success(c, fiber.StatusOK, &post, "Post retrieved successfully")
}

func (h *PublicHandler) ListCategories(c *fiber.Ctx) error {
	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	cacheKey := "public:categories:list"
	// var categories []*any
	// err := h.postCache.Store().Get(ctx, cacheKey, &categories)
	// if err == nil {
	// 	return response.Success(c, fiber.StatusOK, categories, "Categories retrieved successfully")
	// }

	dbCategories, err := h.categoryRepo.FindAll(ctx, false)
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to retrieve categories", err.Error())
	}

	_ = h.postCache.Store().Set(ctx, cacheKey, dbCategories, 10*time.Minute)

	return response.Success(c, fiber.StatusOK, dbCategories, "Categories retrieved successfully")
}

func (h *PublicHandler) ListTags(c *fiber.Ctx) error {
	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	cacheKey := "public:tags:list"
	var tags []*any
	err := h.postCache.Store().Get(ctx, cacheKey, &tags)
	if err == nil {
		return response.Success(c, fiber.StatusOK, tags, "Tags retrieved successfully")
	}

	dbTags, err := h.tagRepo.FindAll(ctx, false)
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to retrieve tags", err.Error())
	}

	_ = h.postCache.Store().Set(ctx, cacheKey, dbTags, 10*time.Minute)

	return response.Success(c, fiber.StatusOK, dbTags, "Tags retrieved successfully")
}

// ─── Analytics Page View Logging ───

func (h *PublicHandler) recordPostViewAsync(postID uint, ip, ua, ref string) {
	go func() {
		// 1. Increment raw view count in posts table
		_ = h.postRepo.DB.Model(&postModels.Post{}).
			Where("id = ?", postID).
			UpdateColumn("view_count", gorm.Expr("view_count + ?", 1)).Error

		// 2. Create post_view record for analytics
		view := postModels.PostView{
			PostID:    postID,
			ViewedAt:  time.Now(),
			IPAddress: ip,
			UserAgent: ua,
			Referrer:  ref,
		}
		_ = h.postRepo.DB.Create(&view).Error
	}()
}

// ─── Public Authors endpoints ───

type PublicAuthorResponse struct {
	ID        uint   `json:"id"`
	Name      string `json:"name"`
	Nickname  string `json:"nickname"`
	Email     string `json:"email"`
	AvatarURL string `json:"avatar_url,omitempty"`
	Bio       string `json:"bio,omitempty"`
}

func (h *PublicHandler) ListAuthors(c *fiber.Ctx) error {
	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	var authors []PublicAuthorResponse
	err := h.postRepo.DB.WithContext(ctx).
		Table("users").
		Select("name, nickname, email, avatar_url, bio, nickname").
		Where("is_active = ? AND deleted_at IS NULL", true).
		Order("name ASC").
		Find(&authors).Error

	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "Failed to retrieve authors", err.Error())
	}

	go h.auditSvc.Log(nil, "view_authors_list", "user", nil, nil, c.IP())

	return response.Success(c, fiber.StatusOK, authors, "Authors retrieved successfully")
}

func (h *PublicHandler) GetAuthorByNickname(c *fiber.Ctx) error {
	nickname := c.Params("nickname")
	if nickname == "" {
		return response.Error(c, fiber.StatusBadRequest, "Invalid author nickname", nil)
	}

	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	var author PublicAuthorResponse
	err := h.postRepo.DB.WithContext(ctx).
		Table("users").
		Select("id, name, nickname, email, avatar_url, bio").
		Where("nickname = ? AND is_active = ? AND deleted_at IS NULL", nickname, true).
		First(&author).Error

	if err != nil {
		return response.Error(c, fiber.StatusNotFound, "Author not found", err.Error())
	}

	authorID := uint(author.ID)
	go h.auditSvc.Log(nil, "view_author_detail", "user", &authorID, nil, c.IP())

	return response.Success(c, fiber.StatusOK, author, "Author retrieved successfully")
}

type settingItem struct {
	Key   string
	Value string
}

func (h *PublicHandler) getSiteSetting(ctx context.Context, key string, defaultVal string) string {
	var item settingItem
	err := h.postRepo.DB.WithContext(ctx).Table("settings").Where("key = ?", key).First(&item).Error
	if err != nil {
		return defaultVal
	}
	return item.Value
}

func (h *PublicHandler) GetRSSFeed(c *fiber.Ctx) error {
	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	siteURL := h.getSiteSetting(ctx, "site_url", "http://localhost:3000")
	siteTitle := h.getSiteSetting(ctx, "site_title", "My Blog Engine")
	siteDesc := h.getSiteSetting(ctx, "site_description", "A modern blog engine written in Go and SvelteKit")

	var posts []*postModels.Post
	err := h.postRepo.DB.WithContext(ctx).
		Where("status = ?", "published").
		Order("published_at DESC, id DESC").
		Limit(20).
		Find(&posts).Error
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString("Failed to query posts: " + err.Error())
	}

	type RSSItem struct {
		Title       string `xml:"title"`
		Link        string `xml:"link"`
		Description string `xml:"description"`
		PubDate     string `xml:"pubDate,omitempty"`
		GUID        string `xml:"guid,omitempty"`
	}

	type RSSChannel struct {
		Title         string    `xml:"title"`
		Link          string    `xml:"link"`
		Description   string    `xml:"description"`
		Language      string    `xml:"language,omitempty"`
		LastBuildDate string    `xml:"lastBuildDate,omitempty"`
		Items         []RSSItem `xml:"item"`
	}

	type RSS struct {
		XMLName xml.Name   `xml:"rss"`
		Version string     `xml:"version,attr"`
		Channel RSSChannel `xml:"channel"`
	}

	items := make([]RSSItem, len(posts))
	for i, post := range posts {
		pubDate := ""
		if post.PublishedAt != nil {
			pubDate = post.PublishedAt.Format(time.RFC1123Z)
		}
		items[i] = RSSItem{
			Title:       post.Title,
			Link:        fmt.Sprintf("%s/posts/%s", strings.TrimSuffix(siteURL, "/"), post.Slug),
			Description: post.Excerpt,
			PubDate:     pubDate,
			GUID:        fmt.Sprintf("%s/posts/%s", strings.TrimSuffix(siteURL, "/"), post.Slug),
		}
	}

	rssFeed := RSS{
		Version: "2.0",
		Channel: RSSChannel{
			Title:         siteTitle,
			Link:          siteURL,
			Description:   siteDesc,
			Language:      "en-us",
			LastBuildDate: time.Now().Format(time.RFC1123Z),
			Items:         items,
		},
	}

	c.Set(fiber.HeaderContentType, "application/xml; charset=utf-8")
	output, err := xml.MarshalIndent(rssFeed, "", "  ")
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString("XML encoding error: " + err.Error())
	}

	return c.Status(fiber.StatusOK).Send(append([]byte(xml.Header), output...))
}

func (h *PublicHandler) GetSitemap(c *fiber.Ctx) error {
	ctx := c.UserContext()
	if ctx == nil {
		ctx = context.Background()
	}

	siteURL := h.getSiteSetting(ctx, "site_url", "http://localhost:3000")

	categories, err := h.categoryRepo.FindAll(ctx, false)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString("Failed to fetch categories: " + err.Error())
	}

	tags, err := h.tagRepo.FindAll(ctx, false)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString("Failed to fetch tags: " + err.Error())
	}

	var posts []*postModels.Post
	err = h.postRepo.DB.WithContext(ctx).
		Where("status = ?", "published").
		Order("published_at DESC, id DESC").
		Find(&posts).Error
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString("Failed to fetch posts: " + err.Error())
	}

	type SitemapURL struct {
		Loc        string `xml:"loc"`
		LastMod    string `xml:"lastmod,omitempty"`
		ChangeFreq string `xml:"changefreq,omitempty"`
		Priority   string `xml:"priority,omitempty"`
	}

	type SitemapUrlset struct {
		XMLName xml.Name     `xml:"urlset"`
		XMLNS   string       `xml:"xmlns,attr"`
		URLs    []SitemapURL `xml:"url"`
	}

	urls := []SitemapURL{
		{
			Loc:        fmt.Sprintf("%s/", strings.TrimSuffix(siteURL, "/")),
			LastMod:    time.Now().Format("2006-01-02"),
			ChangeFreq: "daily",
			Priority:   "1.0",
		},
	}

	for _, cat := range categories {
		lastmod := ""
		if !cat.UpdatedAt.IsZero() {
			lastmod = cat.UpdatedAt.Format("2006-01-02")
		}
		urls = append(urls, SitemapURL{
			Loc:        fmt.Sprintf("%s/categories/%s", strings.TrimSuffix(siteURL, "/"), cat.Slug),
			LastMod:    lastmod,
			ChangeFreq: "weekly",
			Priority:   "0.8",
		})
	}

	for _, tag := range tags {
		lastmod := ""
		if !tag.UpdatedAt.IsZero() {
			lastmod = tag.UpdatedAt.Format("2006-01-02")
		}
		urls = append(urls, SitemapURL{
			Loc:        fmt.Sprintf("%s/tags/%s", strings.TrimSuffix(siteURL, "/"), tag.Slug),
			LastMod:    lastmod,
			ChangeFreq: "weekly",
			Priority:   "0.6",
		})
	}

	for _, post := range posts {
		lastmod := ""
		if !post.UpdatedAt.IsZero() {
			lastmod = post.UpdatedAt.Format("2006-01-02")
		}
		urls = append(urls, SitemapURL{
			Loc:        fmt.Sprintf("%s/posts/%s", strings.TrimSuffix(siteURL, "/"), post.Slug),
			LastMod:    lastmod,
			ChangeFreq: "weekly",
			Priority:   "0.9",
		})
	}

	sitemap := SitemapUrlset{
		XMLNS: "http://www.sitemaps.org/schemas/sitemap/0.9",
		URLs:  urls,
	}

	c.Set(fiber.HeaderContentType, "application/xml; charset=utf-8")
	output, err := xml.MarshalIndent(sitemap, "", "  ")
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString("XML encoding error: " + err.Error())
	}

	return c.Status(fiber.StatusOK).Send(append([]byte(xml.Header), output...))
}
