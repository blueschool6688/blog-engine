package seeds

import (
	"fmt"
	"strings"

	authModels "backend/internal/auth/models"
	postModels "backend/internal/post/models"

	"gorm.io/gorm"
)

// postSeed represents a single post record to be seeded.
type postSeed struct {
	Title       string
	Slug        string
	Excerpt     string
	Content     string
	Status      string
	AuthorEmail string // resolved to AuthorID at runtime
}

// defaultPosts is a collection of realistic sample blog posts.
var defaultPosts = []postSeed{
	{
		Title:       "Getting Started with Go: A Complete Beginner's Guide",
		Slug:        "getting-started-with-go",
		AuthorEmail: "admin@example.com",
		Status:      "published",
		Excerpt:     "Learn the fundamentals of Go — from installation to writing your first web server in under 30 minutes.",
		Content: `<h2>Why Go?</h2>
<p>Go (also known as Golang) is an open-source programming language developed by Google. It combines the performance of compiled languages with the readability of dynamic languages, making it one of the best choices for backend development in 2024.</p>

<h2>Installing Go</h2>
<p>Download the installer from <a href="https://go.dev/dl/">go.dev/dl</a> and follow the platform-specific instructions. Verify your installation:</p>
<pre><code>go version
go version go1.24 windows/amd64</code></pre>

<h2>Your First Go Program</h2>
<pre><code>package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}</code></pre>

<h2>Key Concepts</h2>
<ul>
  <li><strong>Goroutines</strong>: Lightweight threads managed by the Go runtime</li>
  <li><strong>Channels</strong>: Type-safe pipes for goroutine communication</li>
  <li><strong>Interfaces</strong>: Implicit satisfaction for clean abstraction</li>
  <li><strong>Error handling</strong>: Explicit error values instead of exceptions</li>
</ul>

<p>In the next post, we will build a full REST API using the Fiber framework.</p>`,
	},
	{
		Title:       "Building REST APIs with Fiber v2",
		Slug:        "building-rest-apis-with-fiber-v2",
		AuthorEmail: "admin@example.com",
		Status:      "published",
		Excerpt:     "Fiber is an Express.js-inspired web framework for Go. Learn how to build fast, production-ready REST APIs.",
		Content: `<h2>Why Fiber?</h2>
<p>Fiber is built on top of <strong>Fasthttp</strong>, the fastest HTTP engine for Go. It provides an Express-like API that is familiar to JavaScript developers while being extremely performant.</p>

<h2>Installation</h2>
<pre><code>go get github.com/gofiber/fiber/v2</code></pre>

<h2>Basic Server</h2>
<pre><code>package main

import "github.com/gofiber/fiber/v2"

func main() {
    app := fiber.New()

    app.Get("/", func(c *fiber.Ctx) error {
        return c.JSON(fiber.Map{"message": "Hello, Fiber!"})
    })

    app.Listen(":8080")
}</code></pre>

<h2>Middleware</h2>
<p>Fiber ships with a rich set of built-in middleware:</p>
<ul>
  <li><strong>Logger</strong>: Request/response logging</li>
  <li><strong>CORS</strong>: Cross-origin resource sharing</li>
  <li><strong>Recover</strong>: Panic recovery</li>
  <li><strong>Compress</strong>: Gzip / Brotli compression</li>
</ul>`,
	},
	{
		Title:       "Understanding GORM: The Go ORM Library",
		Slug:        "understanding-gorm-go-orm",
		AuthorEmail: "editor@example.com",
		Status:      "published",
		Excerpt:     "GORM is the most popular ORM for Go. This guide covers models, associations, migrations, hooks and advanced querying.",
		Content: `<h2>What is GORM?</h2>
<p>GORM is a full-featured ORM library for Go. It supports PostgreSQL, MySQL, SQLite and SQL Server out of the box.</p>

<h2>Defining Models</h2>
<pre><code>type User struct {
    gorm.Model
    Name  string
    Email string 'gorm:"uniqueIndex"'
}

// gorm.Model embeds: ID, CreatedAt, UpdatedAt, DeletedAt</code></pre>

<h2>CRUD Operations</h2>
<pre><code>// Create
db.Create(&User{Name: "Alice", Email: "alice@example.com"})

// Read
var user User
db.First(&user, 1)        // by primary key
db.Where("email = ?", "alice@example.com").First(&user)

// Update
db.Save(&user)
db.Model(&user).Update("Name", "Bob")

// Delete (soft-delete if model has DeletedAt)
db.Delete(&user, 1)</code></pre>

<h2>Associations</h2>
<p>GORM supports has-one, has-many, belongs-to, and many-to-many relationships with automatic preloading:</p>
<pre><code>db.Preload("Posts").Find(&users)</code></pre>`,
	},
	{
		Title:       "JWT Authentication in Go: Access & Refresh Tokens",
		Slug:        "jwt-authentication-go",
		AuthorEmail: "admin@example.com",
		Status:      "published",
		Excerpt:     "Implement secure JWT-based authentication with short-lived access tokens and rotating refresh tokens stored in HttpOnly cookies.",
		Content: `<h2>The Token Strategy</h2>
<p>A robust auth system uses two tokens:</p>
<ul>
  <li><strong>Access token</strong>: Short-lived (15 minutes), sent in <code>Authorization: Bearer</code> header</li>
  <li><strong>Refresh token</strong>: Long-lived (7 days), stored in an <strong>HttpOnly cookie</strong> to prevent XSS</li>
</ul>

<h2>Generating Tokens</h2>
<pre><code>import "github.com/golang-jwt/jwt/v5"

type Claims struct {
    UserID uint   'json:"user_id"'
    Role   string 'json:"role"'
    jwt.RegisteredClaims
}

func generateToken(userID uint, role, secret string, ttl time.Duration) (string, error) {
    claims := &Claims{
        UserID: userID,
        Role:   role,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(time.Now().Add(ttl)),
        },
    }
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString([]byte(secret))
}</code></pre>

<h2>Refresh Token Rotation</h2>
<p>On every refresh, issue a new refresh token and invalidate the old one. This limits the window for token theft.</p>`,
	},
	{
		Title:       "Memcached Caching Patterns for High-Traffic APIs",
		Slug:        "memcached-caching-patterns",
		AuthorEmail: "editor@example.com",
		Status:      "published",
		Excerpt:     "Learn version-based cache invalidation, cache-aside pattern, and how to prevent cache stampede in production Go services.",
		Content: `<h2>Why Cache?</h2>
<p>Database queries are expensive. For read-heavy endpoints like a public blog API, caching responses in Memcached can reduce database load by 90% and cut response times from ~50ms to <1ms.</p>

<h2>Cache-Aside Pattern</h2>
<pre><code>func (s *QueryService) GetPosts(ctx context.Context) ([]Post, error) {
    key := "posts:v" + s.getVersion()

    // 1. Try cache
    if cached, err := s.cache.Get(key); err == nil {
        var posts []Post
        json.Unmarshal(cached, &posts)
        return posts, nil
    }

    // 2. Query DB on cache miss
    posts, err := s.repo.FindAll(ctx)
    if err != nil {
        return nil, err
    }

    // 3. Populate cache
    data, _ := json.Marshal(posts)
    s.cache.Set(key, data, 5*time.Minute)

    return posts, nil
}</code></pre>

<h2>Version-Based Invalidation</h2>
<p>Instead of deleting specific keys (which can race), bump a version counter. All old keys become unreachable automatically.</p>
<pre><code>// On write:
s.cache.Increment("posts:version", 1)

// On read:
version, _ := s.cache.Get("posts:version")
key := "posts:v" + version</code></pre>`,
	},
	{
		Title:       "React 19 New Features: What Every Developer Should Know",
		Slug:        "react-19-new-features",
		AuthorEmail: "editor@example.com",
		Status:      "draft",
		Excerpt:     "React 19 ships with Actions, useOptimistic, use(), and full Server Components support. Here is everything you need to know.",
		Content: `<h2>React Actions</h2>
<p>Actions replace the pattern of manually managing pending/error state when doing async mutations. Any function passed to a transition is called an "Action".</p>

<pre><code>function UpdateName() {
  const [error, submitAction, isPending] = useActionState(
    async (previousState, formData) => {
      const error = await updateName(formData.get("name"));
      if (error) return error;
      redirect("/");
    },
    null
  );

  return (
    &lt;form action={submitAction}&gt;
      &lt;input type="text" name="name" /&gt;
      &lt;button disabled={isPending}&gt;Update&lt;/button&gt;
      {error &amp;&amp; &lt;p&gt;{error}&lt;/p&gt;}
    &lt;/form&gt;
  );
}</code></pre>

<h2>useOptimistic</h2>
<p>Show an optimistic UI state while an async action is in progress:</p>
<pre><code>const [optimisticName, setOptimisticName] = useOptimistic(currentName);</code></pre>

<h2>The <code>use()</code> Hook</h2>
<p>Read a resource (Promise or Context) during render — this unlocks streaming data patterns.</p>`,
	},
	{
		Title:       "PostgreSQL Full-Text Search with GORM",
		Slug:        "postgresql-fulltext-search-gorm",
		AuthorEmail: "admin@example.com",
		Status:      "draft",
		Excerpt:     "Implement fast, relevance-ranked full-text search in PostgreSQL using tsvector, tsquery, and GIN indexes — all via GORM.",
		Content: `<h2>Why PostgreSQL FTS?</h2>
<p>PostgreSQL's built-in full-text search is powerful enough for most applications. You get stemming, ranking, and boolean queries without adding Elasticsearch.</p>

<h2>Adding a tsvector Column</h2>
<pre><code>ALTER TABLE posts
  ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(title, '') || ' ' || coalesce(content, ''))
  ) STORED;

CREATE INDEX idx_posts_search ON posts USING GIN(search_vector);</code></pre>

<h2>Querying with GORM</h2>
<pre><code>db.Where("search_vector @@ plainto_tsquery('english', ?)", keyword).
   Order("ts_rank(search_vector, plainto_tsquery('english', ?)) DESC", keyword).
   Find(&posts)</code></pre>

<h2>Highlighting Results</h2>
<pre><code>SELECT ts_headline('english', content,
         plainto_tsquery('english', 'fiber middleware'),
         'MaxWords=50, MinWords=10')
FROM posts;</code></pre>`,
	},
}

// PostSeeder creates sample blog posts using the seeded admin and editor accounts.
// Skips posts whose slug already exists (idempotent).
type PostSeeder struct{}

func (s *PostSeeder) Name() string { return "PostSeeder" }

func (s *PostSeeder) Run(db *gorm.DB) error {
	// Build email → ID lookup map
	authorIDs, err := resolveAuthors(db)
	if err != nil {
		return err
	}

	for _, p := range defaultPosts {
		// Idempotency: skip if slug already exists
		var count int64
		if err := db.Unscoped().Model(&postModels.Post{}).
			Where("slug = ?", p.Slug).
			Count(&count).Error; err != nil {
			return fmt.Errorf("check post %q: %w", p.Slug, err)
		}
		if count > 0 {
			continue
		}

		authorID := authorIDs[p.AuthorEmail]
		post := &postModels.Post{
			Title:    p.Title,
			Slug:     p.Slug,
			Content:  strings.TrimSpace(p.Content),
			Status:   p.Status,
			AuthorID: &authorID,
		}
		if err := db.Create(post).Error; err != nil {
			return fmt.Errorf("insert post %q: %w", p.Slug, err)
		}
	}
	return nil
}

// resolveAuthors returns a map of email → user.ID for all seeded users.
func resolveAuthors(db *gorm.DB) (map[string]uint, error) {
	var users []authModels.User
	if err := db.Where("email IN ?", []string{
		"admin@example.com",
		"editor@example.com",
	}).Find(&users).Error; err != nil {
		return nil, fmt.Errorf("load authors: %w", err)
	}

	m := make(map[string]uint, len(users))
	for _, u := range users {
		m[u.Email] = u.ID
	}
	return m, nil
}
