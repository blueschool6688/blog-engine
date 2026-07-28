package bootstrap

import (
	"context"
	"fmt"
	"os"
	"time"

	"backend/internal/shared/middleware"
	"backend/pkg/cache"
	"backend/pkg/config"
	"backend/pkg/database"
	"backend/pkg/logger"
	"backend/pkg/mailer"

	// Auth Domain
	authHandlers "backend/internal/auth/handlers"
	authRepository "backend/internal/auth/repository"
	authService "backend/internal/auth/service"

	// Category Domain
	categoryHandlers "backend/internal/category/handlers"
	categoryRepository "backend/internal/category/repository"

	// Media Domain
	mediaHandlers "backend/internal/media/handlers"
	mediaRepository "backend/internal/media/repository"
	mediaWorker "backend/internal/media/worker"

	// Post Domain
	postCommands "backend/internal/post/commands"
	postHandlers "backend/internal/post/handlers"
	postQueries "backend/internal/post/queries"
	postRepository "backend/internal/post/repository"
	postWorker "backend/internal/post/worker"

	// Tag Domain
	tagHandlers "backend/internal/tag/handlers"
	tagRepository "backend/internal/tag/repository"

	// Public Domain
	publicHandlers "backend/internal/public/handlers"

	// Feedback Domain
	feedbackHandlers "backend/internal/feedback/handlers"
	feedbackRepository "backend/internal/feedback/repository"

	// Settings Domain
	settingsHandlers "backend/internal/settings/handlers"
	settingsRepository "backend/internal/settings/repository"

	// Dashboard Domain
	dashboardHandlers "backend/internal/dashboard/handlers"

	// Audit Domain
	auditHandlers "backend/internal/audit/handlers"
	auditService "backend/internal/audit/service"

	// Comment Domain
	commentHandlers "backend/internal/comment/handlers"
	commentRepository "backend/internal/comment/repository"
	commentService "backend/internal/comment/service"

	// Translate Domain
	translateDomain "backend/internal/translate"

	// AI / Generation Domain
	aiClientPkg "backend/pkg/ai"
	aiGenerateDomain "backend/internal/aigenerate"
	aiDomain "backend/internal/ai"
	discordWebhook "backend/internal/webhook/discord"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	fiberLogger "github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func New(ctx context.Context) (*fiber.App, func(), error) {
	log := logger.New()
	cfg := config.Load()

	log.Info("Loading configurations...\n")

	db, err := database.Connect(cfg)
	if err != nil {
		return nil, nil, fmt.Errorf("database connection failed: %w", err)
	}
	log.Info("Connected to PostgreSQL successfully.\n")

	auditSvc := auditService.NewAuditService(db)

	log.Info("Connecting to Memcached at %s...\n", cfg.MemcachedAddr)
	cacheStore := cache.NewMemcachedStore(cfg.MemcachedAddr)
	if err := cacheStore.Ping(); err != nil {
		log.Error("Failed to connect to Memcached: %v\n", err)
	} else {
		log.Info("Memcached client initialized and connected successfully.\n")
	}

	mailerSvc := mailer.New(cfg, log)

	userRepo := authRepository.NewUserRepository(db)
	authSvc := authService.NewAuthService(userRepo, cfg.JWTSecret, cacheStore, mailerSvc, cfg.AppURL)
	// if err := authSvc.SeedAdminUser(context.Background()); err != nil {
	// 	log.Error("Failed to seed admin user: %v\n", err)
	// }
	// if err := authSvc.SeedDemoData(context.Background()); err != nil {
	// 	log.Error("Failed to seed demo data: %v\n", err)
	// }
	authHandler := authHandlers.NewAuthHandler(authSvc, auditSvc)
	userHandler := authHandlers.NewUserHandler(authSvc)

	categoryRepo := categoryRepository.NewCategoryRepository(db)
	categoryHandler := categoryHandlers.NewCategoryHandler(categoryRepo)

	mediaRepo := mediaRepository.NewMediaRepository(db)
	imageChan := make(chan uint, 100)
	videoChan := make(chan uint, 100)
	worker := mediaWorker.NewMediaWorker(mediaRepo, log, imageChan, videoChan, cfg.UploadsDir)
	worker.Start(ctx)
	mediaHandler := mediaHandlers.NewMediaHandler(mediaRepo, imageChan, videoChan, cfg.UploadsDir, auditSvc)

	tagRepo := tagRepository.NewTagRepository(db)
	tagHandler := tagHandlers.NewTagHandler(tagRepo)

	postCache := cache.NewPostCache(cacheStore)
	postRepo := postRepository.NewPostRepository(db)
	postCmdService := postCommands.NewCommandService(postRepo, postCache, cfg.CFZoneID, cfg.CFAPIToken, cfg.AppURL)
	postQryService := postQueries.NewQueryService(postRepo, cacheStore)
	postHandler := postHandlers.NewPostHandler(postCmdService, postQryService, auditSvc)

	publishWorker := postWorker.NewPublishWorker(db, cacheStore, log)
	publishWorker.Start(ctx)

	publicHandler := publicHandlers.NewPublicHandler(postRepo, categoryRepo, tagRepo, postCache, auditSvc)

	feedbackRepo := feedbackRepository.NewFeedbackRepository(db)
	feedbackHandler := feedbackHandlers.NewFeedbackHandler(feedbackRepo, auditSvc)

	settingsRepo := settingsRepository.NewSettingsRepository(db)
	settingsHandler := settingsHandlers.NewSettingsHandler(settingsRepo)

	dashboardHandler := dashboardHandlers.NewDashboardHandler(db, cfg.UploadsDir)

	auditHandler := auditHandlers.NewAuditHandler(auditSvc)

	// Khởi tạo AI Generate Domain & Discord Webhook
	aiClient := aiClientPkg.NewClient(cfg.NVIDIAAPIKey, cfg.NVIDIAModel)
	spamClient := aiClientPkg.NewClient(cfg.NVIDIAAPIKey, cfg.NVIDIASpamModel)
	aiGenerateSvc := aiGenerateDomain.NewServiceWithSpamModel(aiClient, spamClient, log)
	discordWebhookHandler := discordWebhook.NewHandler(
		aiGenerateSvc,
		postCmdService,
		db,
		cfg.DiscordPublicKey,
		cfg.DiscordBotSecret,
		cfg.DiscordAuthorID,
		cfg.AppURL,
		log,
	)
	aiHandler := aiDomain.NewHandler(aiGenerateSvc)

	commentRepo := commentRepository.NewCommentRepository(db)
	reactionRepo := commentRepository.NewReactionRepository(db)
	commentSvc := commentService.NewCommentService(commentRepo, reactionRepo, db, aiGenerateSvc)
	commentHandler := commentHandlers.NewCommentHandler(commentSvc, auditSvc)

	// Khởi tạo Translate Domain (Phase 2: job store + configurable chunk size)
	nvidiaClient := translateDomain.NewNVIDIAClient(cfg.NVIDIAAPIKey, cfg.NVIDIAModel)
	translateCache := translateDomain.NewMemcachedTranslateCache(cacheStore)
	translateJobStore := translateDomain.NewPostgresJobStore(db)
	translateSvc := translateDomain.NewService(nvidiaClient, translateCache, log, cfg.TranslateChunkSize, translateJobStore)
	translateHandler := translateDomain.NewHandler(translateSvc)

	app := fiber.New(fiber.Config{
		ErrorHandler: middleware.ErrorHandler,
		BodyLimit:    50 * 1024 * 1024,
	})

	app.Use(recover.New())
	app.Use(fiberLogger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
	}))

	app.Use(limiter.New(limiter.Config{
		Max:        2000,
		Expiration: 1 * time.Minute,
		KeyGenerator: func(c *fiber.Ctx) string {
			return c.IP()
		},
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"success": false,
				"message": "Too many requests, please try again later.",
			})
		},
	}))

	sensitiveLimiter := limiter.New(limiter.Config{
		Max:        500,
		Expiration: 1 * time.Minute,
		KeyGenerator: func(c *fiber.Ctx) string {
			return c.IP()
		},
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"success": false,
				"message": "Too many requests to this sensitive endpoint, please try again later.",
			})
		},
	})

	commentLimiter := limiter.New(limiter.Config{
		Max:        5,
		Expiration: 1 * time.Minute,
		KeyGenerator: func(c *fiber.Ctx) string {
			return c.IP()
		},
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"success": false,
				"message": "Too many requests, please slow down.",
			})
		},
	})

	_ = os.MkdirAll(cfg.UploadsDir, 0755)
	app.Static("/uploads", cfg.UploadsDir, fiber.Static{
		MaxAge: 31536000,
		ModifyResponse: func(c *fiber.Ctx) error {
			c.Set("Cache-Control", "public, max-age=31536000, immutable")
			return nil
		},
	})

	api := app.Group("/api")
	api.Get("/settings", settingsHandler.GetSettings)

	// Discord Webhook
	api.Post("/webhooks/discord", discordWebhookHandler.Handle)

	// ── Translate routes (public, no JWT, separate rate limiter) ────────────
	translateLimiter := limiter.New(limiter.Config{
		Max:        30,
		Expiration: 1 * time.Minute,
		KeyGenerator: func(c *fiber.Ctx) string {
			return c.IP()
		},
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"success": false,
				"message": "Translation rate limit exceeded. Please wait a moment.",
			})
		},
	})
	api.Post("/translate", translateLimiter, translateHandler.Translate)
	api.Post("/translate/batch", translateLimiter, translateHandler.BatchTranslate)
	api.Post("/translate/async", translateLimiter, translateHandler.TranslateAsync)
	api.Get("/translate/async/:job_id", translateHandler.GetAsyncJob)

	// ── Public auth routes (no JWT required) ─────────────────────────────────
	api.Post("/auth/login", sensitiveLimiter, authHandler.Login)
	api.Post("/auth/refresh", authHandler.Refresh)
	api.Post("/auth/forgot-password", sensitiveLimiter, authHandler.ForgotPassword)
	api.Post("/auth/reset-password", authHandler.ResetPassword)

	public := api.Group("/public")
	public.Get("/posts", publicHandler.ListPosts)
	public.Get("/posts/:slug", publicHandler.GetPostBySlug)
	public.Get("/categories", publicHandler.ListCategories)
	public.Get("/tags", publicHandler.ListTags)
	public.Get("/feed.xml", publicHandler.GetRSSFeed)
	public.Get("/sitemap.xml", publicHandler.GetSitemap)
	public.Get("/authors", publicHandler.ListAuthors)
	public.Get("/authors/:nickname", publicHandler.GetAuthorByNickname)
	public.Post("/feedbacks", feedbackHandler.Create)

	// Comments & Reactions ()
	public.Get("/posts/:id/comments", commentHandler.ListComments)
	public.Post("/posts/:id/comments", commentLimiter, commentHandler.CreateComment)
	public.Get("/posts/:id/reactions", commentHandler.GetReactions)
	public.Post("/posts/:id/react", commentLimiter, commentHandler.React)

	// ── Protected routes (JWT required) ──────────────────────────────────────
	protected := api.Group("", middleware.JWTGuard(authSvc))

	// Auth
	protected.Post("/auth/logout", authHandler.Logout)
	protected.Get("/auth/me", authHandler.Me)
	protected.Put("/auth/me", authHandler.UpdateProfile)
	protected.Put("/auth/password", authHandler.ChangePassword)

	// Dashboard
	protected.Get("/dashboard/stats", dashboardHandler.GetStats)

	// Settings
	protected.Put("/settings", settingsHandler.UpdateSettings)

	// AI Routes
	protected.Post("/ai/generate-post", aiHandler.GeneratePost)
	protected.Post("/ai/summarize", aiHandler.Summarize)
	protected.Post("/ai/keywords", aiHandler.ExtractKeywords)
	protected.Post("/ai/seo-score", aiHandler.ScoreSEO)
	protected.Post("/ai/alt-text", aiHandler.GenerateAltText)
	protected.Post("/ai/sentiment", aiHandler.AnalyzeSentiment)

	// Category Routes
	protected.Get("/categories", categoryHandler.List)
	protected.Post("/categories", categoryHandler.Create)
	protected.Put("/categories/:id", categoryHandler.Update)
	protected.Delete("/categories/:id", categoryHandler.Delete)
	protected.Post("/categories/:id/restore", categoryHandler.Restore)

	// Media Routes
	protected.Post("/media", sensitiveLimiter, mediaHandler.Upload)
	protected.Get("/media", mediaHandler.List)
	protected.Get("/media/:id", mediaHandler.Detail)
	protected.Delete("/media/:id", mediaHandler.Delete)

	// Tag Routes
	protected.Get("/tags", tagHandler.List)
	protected.Post("/tags", tagHandler.Create)
	protected.Delete("/tags/:id", tagHandler.Delete)
	protected.Post("/tags/:id/restore", tagHandler.Restore)

	// Comment Moderation (admin + editor) - REGISTER FIRST to avoid /posts/:id wildcard collision
	protected.Get("/posts/comments/pending-count", commentHandler.PendingCount)
	protected.Get("/posts/comments", commentHandler.ListPendingComments)
	protected.Put("/posts/comments/:id/approve", commentHandler.Approve)
	protected.Put("/posts/comments/:id/reject", commentHandler.Reject)
	protected.Delete("/posts/comments/:id", commentHandler.Delete)

	// Post Routes (Static routes first)
	protected.Post("/posts", postHandler.Create)
	protected.Post("/posts/bulk", postHandler.Bulk)
	protected.Get("/posts", postHandler.List)

	// Post Routes (Parameterized/Wildcard routes last)
	protected.Put("/posts/:id", postHandler.Update)
	protected.Delete("/posts/:id", postHandler.Delete)
	protected.Post("/posts/:id/restore", postHandler.Restore)
	protected.Get("/posts/:id", postHandler.Detail)
	protected.Post("/posts/:id/media", postHandler.AttachMedia)
	protected.Put("/posts/:id/media/reorder", postHandler.ReorderGallery)
	protected.Get("/posts/:id/media", postHandler.GetGallery)
	protected.Delete("/posts/:id/media/:mediaId", postHandler.DetachMedia)

	// Feedback admin routes
	protected.Get("/feedbacks", feedbackHandler.List)
	protected.Put("/feedbacks/:id/status", feedbackHandler.UpdateStatus)
	protected.Delete("/feedbacks/:id", feedbackHandler.Delete)

	// Translate admin routes
	protected.Get("/translate/jobs", translateHandler.ListJobs)
	protected.Post("/translate/jobs/:job_id/retry", translateHandler.RetryJob)
	protected.Delete("/translate/jobs/:job_id", translateHandler.DeleteJob)

	// Admin-only Routes
	adminOnly := protected.Group("", middleware.RoleGuard("admin"))
	adminOnly.Get("/users", userHandler.List)
	adminOnly.Post("/users", userHandler.Create)
	adminOnly.Put("/users/:id", userHandler.Update)
	adminOnly.Delete("/users/:id", userHandler.Delete)
	adminOnly.Get("/audit-logs", auditHandler.List)

	// Health (protected — any valid JWT can hit this)
	protected.Get("/health", func(c *fiber.Ctx) error {
		return c.Status(200).JSON(fiber.Map{
			"status": "healthy",
		})
	})

	log.Info("Bootstrap complete. Fiber app constructed successfully.\n")

	cleanup := func() {
		if db != nil {
			sqlDB, err := db.DB()
			if err == nil {
				log.Info("Closing database connection...")
				_ = sqlDB.Close()
			}
		}
	}

	return app, cleanup, nil
}
