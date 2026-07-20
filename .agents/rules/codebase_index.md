---
trigger: always_on
---

# Codebase Index — Auto-generated, DO NOT EDIT MANUALLY
# Generated at: 2026-07-20T09:48:01.101Z
# Generated from commit: b945b1f

## 1. Directory Tree
```
├── backend
│   ├── bootstrap
│   │   └── app.go
│   ├── cmd
│   │   └── migrate
│   │       └── main.go
│   ├── internal
│   │   ├── seeds
│   │   │   ├── post_seeder.go
│   │   │   ├── seeder.go
│   │   │   └── user_seeder.go
│   │   └── translate
│   │       ├── cache.go
│   │       ├── client.go
│   │       ├── handler.go
│   │       ├── job_store.go
│   │       ├── service.go
│   │       └── types.go
│   └── pkg
│       ├── cache
│       │   ├── memcached.go
│       │   └── post_cache.go
│       ├── cloudflare
│       │   └── cloudflare.go
│       ├── config
│       │   └── config.go
│       ├── database
│       │   └── postgres.go
│       ├── logger
│       │   └── logger.go
│       └── mailer
│           └── mailer.go
└── web
    └── src
        ├── components
        │   ├── ArticleMiniSlider.tsx
        │   ├── CommentSection.tsx
        │   ├── ConfirmModal.tsx
        │   ├── GalleryUploader.tsx
        │   ├── ProtectedRoute.tsx
        │   ├── RichTextEditor.tsx
        │   └── TranslateToggle.tsx
        ├── context
        │   ├── AuthContext.tsx
        │   ├── LanguageContext.tsx
        │   ├── ThemeContext.tsx
        │   └── ToastContext.tsx
        ├── hooks
        │   └── useTranslate.ts
        ├── layouts
        │   ├── AdminLayout.tsx
        │   ├── PublicLayout.tsx
        │   └── RootLayout.tsx
        ├── pages
        │   ├── AuditLog.tsx
        │   ├── AuthorDetail.tsx
        │   ├── AuthorsList.tsx
        │   ├── BlogHome.tsx
        │   ├── BlogPostDetail.tsx
        │   ├── Categories.tsx
        │   ├── CommentModeration.tsx
        │   ├── Dashboard.tsx
        │   ├── FeedbackNew.tsx
        │   ├── FeedbacksAdmin.tsx
        │   ├── ForgotPassword.tsx
        │   ├── Login.tsx
        │   ├── MediaLibrary.tsx
        │   ├── NotFound.tsx
        │   ├── PostEditor.tsx
        │   ├── PostList.tsx
        │   ├── ResetPassword.tsx
        │   ├── Settings.tsx
        │   ├── Tags.tsx
        │   └── Users.tsx
        ├── services
        │   └── api.ts
        ├── utils
        │   └── cookie.ts
        ├── entry.server.tsx
        ├── root.tsx
        └── routes.ts
```

## 2. Backend (Golang)
### Package: cache
#### File: backend/pkg/cache/memcached.go
**Imports:** `context`, `encoding/json`, `errors`, `fmt`, `time`, `github.com/bradfitz/gomemcache/memcache`
**Structs:**
- `MemcachedStore`
  - Fields: { client: *memcache.Client }
**Functions (names only):** `NewMemcachedStore`, `Ping`, `Get`, `Set`, `Delete`, `Increment`

#### File: backend/pkg/cache/post_cache.go
**Imports:** `context`, `crypto/sha256`, `encoding/hex`, `fmt`, `log`, `time`
**Structs:**
- `PostCache`
  - Fields: { store: *MemcachedStore }
**Functions (names only):** `NewPostCache`, `Store`, `GetPostHTML`, `SetPostHTML`, `DeletePostHTML`, `GetPostList`, `SetPostList`, `InvalidatePostLists`, `GetSearchResult`, `SetSearchResult`, `HashQuery`

### Package: service
#### File: backend/internal/audit/service/audit_service.go
**Imports:** `context`, `encoding/json`, `fmt`, `backend/internal/audit/models`, `gorm.io/gorm`
**Structs:**
- `AuditService`
  - Fields: { db: *gorm.DB }
**Functions (names only):** `NewAuditService`, `Log`, `GetLogs`

#### File: backend/internal/auth/service/auth_service.go
**Imports:** `context`, `crypto/rand`, `crypto/sha256`, `encoding/hex`, `errors`, `fmt`, `time`, `backend/internal/auth/models`, `backend/internal/auth/repository`, `backend/internal/category/models`, `backend/internal/media/models`, `backend/internal/post/models`, `backend/internal/tag/models`, `backend/pkg/cache`, `backend/pkg/mailer`, `github.com/golang-jwt/jwt/v5`, `golang.org/x/crypto/bcrypt`, `gorm.io/gorm`
**Structs:**
- `Claims` — Claims is the JWT payload embedded in every token.
  - Fields: { UserID: uint, Role: string, [embedded]: jwt.RegisteredClaims }
- `TokenPair` — TokenPair holds an access token and a refresh token.
  - Fields: { AccessToken: string, RefreshToken: string }
- `AuthService` — AuthService implements all authentication business logic.
  - Fields: { repo: *repository.UserRepository, jwtSecret: string, cacheStore: *cache.MemcachedStore, mailer: *mailer.Mailer, appURL: string }
**Functions (names only):** `NewAuthService`, `Login`, `RefreshToken`, `GetUserByID`, `UpdateProfile`, `ChangePassword`, `HashPassword`, `SeedAdminUser`, `ValidateToken`, `ForgotPassword`, `ResetPassword`, `ListUsers`, `CreateUser`, `UpdateUser`, `DeleteUser`, `SeedDemoData`

#### File: backend/internal/comment/service/comment_service.go
**Imports:** `context`, `crypto/sha256`, `encoding/hex`, `errors`, `fmt`, `backend/internal/comment/models`, `backend/internal/comment/repository`, `gorm.io/gorm`
**Structs:**
- `CommentService`
  - Fields: { commentRepo: *repository.CommentRepository, reactionRepo: *repository.ReactionRepository, db: *gorm.DB }
**Functions (names only):** `NewCommentService`, `BuildFingerprint`, `CreateComment`, `GetApprovedComments`, `ListAll`, `ApproveComment`, `RejectComment`, `DeleteComment`, `React`, `GetReactions`, `CountPending`

### Package: queries
#### File: backend/internal/post/queries/service.go
**Imports:** `context`, `fmt`, `backend/internal/post/models`, `backend/internal/post/repository`, `backend/pkg/cache`, `gorm.io/gorm`
**Structs:**
- `QueryService`
  - Fields: { repo: *repository.PostRepository, cacheStore: *cache.MemcachedStore }
- `ListPostsResponse`
  - Fields: { Items: []*models.Post, Total: int64 }
**Functions (names only):** `NewQueryService`, `GetPostByID`, `ListPosts`, `GetGallery`

### Package: middleware
#### File: backend/internal/shared/middleware/auth_middleware.go
**Imports:** `strings`, `backend/internal/auth/service`, `backend/internal/shared/response`, `github.com/gofiber/fiber/v2`
**Functions (names only):** `JWTGuard`

#### File: backend/internal/shared/middleware/middleware.go
**Imports:** `backend/internal/shared/response`, `github.com/gofiber/fiber/v2`
**Functions (names only):** `ErrorHandler`

#### File: backend/internal/shared/middleware/role_middleware.go
**Imports:** `backend/internal/shared/response`, `github.com/gofiber/fiber/v2`
**Functions (names only):** `RoleGuard`

### Package: database
#### File: backend/pkg/database/postgres.go
**Imports:** `fmt`, `backend/pkg/config`, `gorm.io/driver/postgres`, `gorm.io/gorm`
**Functions (names only):** `Connect`

### Package: worker
#### File: backend/internal/media/worker/media_worker.go
**Imports:** `context`, `fmt`, `image`, `image/jpeg`, `image/png`, `io`, `os`, `os/exec`, `path/filepath`, `strconv`, `strings`, `time`, `backend/internal/media/repository`, `backend/pkg/logger`
**Structs:**
- `MediaWorker`
  - Fields: { repo: *repository.MediaRepository, logger: *logger.Logger, imageQueue: chan uint, videoQueue: chan uint, uploads: string }
**Functions (names only):** `NewMediaWorker`, `Start`

#### File: backend/internal/post/worker/publish_worker.go
**Imports:** `context`, `time`, `backend/pkg/cache`, `backend/pkg/logger`, `gorm.io/gorm`
**Structs:**
- `PublishWorker`
  - Fields: { db: *gorm.DB, cacheStore: *cache.MemcachedStore, logger: *logger.Logger }
**Functions (names only):** `NewPublishWorker`, `Start`, `PublishPendingPosts`

### Package: commands
#### File: backend/internal/post/commands/service.go
**Imports:** `context`, `errors`, `fmt`, `regexp`, `strings`, `time`, `encoding/json`, `backend/internal/category/models`, `backend/internal/post/models`, `backend/internal/post/repository`, `backend/internal/tag/models`, `backend/pkg/cache`, `backend/pkg/cloudflare`, `gorm.io/gorm`
**Structs:**
- `CreatePostCommand`
  - Fields: { Title: string, TitleEn: string, Slug: string, SlugEn: string, Content: string, ContentEn: string, CoverMediaID: *uint, Status: string, AuthorID: *uint, CategoryIDs: []uint, TagIDs: []uint, MetaTitle: string, MetaDesc: string, Excerpt: string, ExcerptEn: string, IsFeatured: bool, IsDocument: bool, PDFMediaID: *uint, PublishedAt: *time.Time }
- `UpdatePostCommand`
  - Fields: { Title: string, TitleEn: string, Slug: string, SlugEn: string, Content: string, ContentEn: string, CoverMediaID: *uint, Status: string, CategoryIDs: []uint, TagIDs: []uint, MetaTitle: string, MetaDesc: string, Excerpt: string, ExcerptEn: string, IsFeatured: bool, IsDocument: bool, PDFMediaID: *uint, PublishedAt: *time.Time }
- `BulkPostCommand`
  - Fields: { IDs: []uint, Action: string }
- `CommandService`
  - Fields: { repo: *repository.PostRepository, postCache: *cache.PostCache, cfZoneID: string, cfAPIToken: string, appURL: string }
- `ReorderItem`
  - Fields: { MediaID: uint, SortOrder: int }
**Functions (names only):** `NewCommandService`, `CreatePost`, `UpdatePost`, `DeletePost`, `RestorePost`, `AttachMedia`, `DetachMedia`, `ReorderGallery`, `BulkPost`

### Package: repositories
#### File: backend/internal/shared/repositories/gorm_repository.go
**Imports:** `context`, `fmt`, `gorm.io/gorm`
**Structs:**
- `GormRepository`
  - Fields: { DB: *gorm.DB }
**Interfaces:**
- `Repository`
  - Methods:
    - `Insertfunc(...)`
    - `Updatefunc(...)`
    - `Deletefunc(...)`
    - `FindByIDfunc(...)`
    - `FindOnefunc(...)`
    - `FindAllfunc(...)`
    - `FindWithPaginationfunc(...)`
    - `Countfunc(...)`
**Functions (names only):** `NewGormRepository`, `Insert`, `Update`, `Delete`, `FindByID`, `FindOne`, `FindAll`, `FindWithPagination`, `Count`

### Package: cloudflare
#### File: backend/pkg/cloudflare/cloudflare.go
**Imports:** `bytes`, `encoding/json`, `fmt`, `net/http`, `time`
**Structs:**
- `PurgeRequest`
  - Fields: { Files: []string }
**Functions (names only):** `PurgeCacheAsync`

### Package: mailer
#### File: backend/pkg/mailer/mailer.go
**Imports:** `crypto/tls`, `fmt`, `net/smtp`, `strings`, `backend/pkg/config`, `backend/pkg/logger`
**Structs:**
- `Mailer`
  - Fields: { cfg: *config.Config, log: *logger.Logger }
**Functions (names only):** `New`, `SendPasswordReset`

### Package: bootstrap
#### File: backend/bootstrap/app.go
**Imports:** `context`, `fmt`, `os`, `time`, `backend/internal/shared/middleware`, `backend/pkg/cache`, `backend/pkg/config`, `backend/pkg/database`, `backend/pkg/logger`, `backend/pkg/mailer`, `backend/internal/auth/handlers`, `backend/internal/auth/repository`, `backend/internal/auth/service`, `backend/internal/category/handlers`, `backend/internal/category/repository`, `backend/internal/media/handlers`, `backend/internal/media/repository`, `backend/internal/media/worker`, `backend/internal/post/commands`, `backend/internal/post/handlers`, `backend/internal/post/queries`, `backend/internal/post/repository`, `backend/internal/post/worker`, `backend/internal/tag/handlers`, `backend/internal/tag/repository`, `backend/internal/public/handlers`, `backend/internal/feedback/handlers`, `backend/internal/feedback/repository`, `backend/internal/settings/handlers`, `backend/internal/settings/repository`, `backend/internal/dashboard/handlers`, `backend/internal/audit/handlers`, `backend/internal/audit/service`, `backend/internal/comment/handlers`, `backend/internal/comment/repository`, `backend/internal/comment/service`, `backend/internal/translate`, `github.com/gofiber/fiber/v2`, `github.com/gofiber/fiber/v2/middleware/cors`, `github.com/gofiber/fiber/v2/middleware/limiter`, `github.com/gofiber/fiber/v2/middleware/logger`, `github.com/gofiber/fiber/v2/middleware/recover`
**Functions (names only):** `New`

### Package: models
#### File: backend/internal/audit/models/audit_log.go
**Imports:** `encoding/json`, `time`
**Structs:**
- `AuditLog`
  - Fields: { ID: uint, UserID: *uint, Action: string, EntityType: string, EntityID: *uint, Changes: json.RawMessage, IPAddress: string, CreatedAt: time.Time }
**Functions (names only):** `TableName`

#### File: backend/internal/auth/models/password_reset_token.go
**Imports:** `time`
**Structs:**
- `PasswordResetToken`
  - Fields: { ID: uint, UserID: uint,