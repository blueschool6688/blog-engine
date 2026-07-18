package service

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"time"

	"backend/internal/auth/models"
	"backend/internal/auth/repository"
	categoryModels "backend/internal/category/models"
	mediaModels "backend/internal/media/models"
	postModels "backend/internal/post/models"
	tagModels "backend/internal/tag/models"
	"backend/pkg/cache"
	"backend/pkg/mailer"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// Claims is the JWT payload embedded in every token.
type Claims struct {
	UserID uint   `json:"user_id"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

// TokenPair holds an access token and a refresh token.
type TokenPair struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

// AuthService implements all authentication business logic.
type AuthService struct {
	repo       *repository.UserRepository
	jwtSecret  string
	cacheStore *cache.MemcachedStore
	mailer     *mailer.Mailer
	appURL     string
}

// NewAuthService creates a new AuthService.
func NewAuthService(
	repo *repository.UserRepository,
	jwtSecret string,
	cacheStore *cache.MemcachedStore,
	mailer *mailer.Mailer,
	appURL string,
) *AuthService {
	return &AuthService{
		repo:       repo,
		jwtSecret:  jwtSecret,
		cacheStore: cacheStore,
		mailer:     mailer,
		appURL:     appURL,
	}
}

func (s *AuthService) Login(ctx context.Context, email, password string) (*TokenPair, *models.User, error) {
	lockKey := fmt.Sprintf("login_fail:%s", email)

	var failCount int
	if err := s.cacheStore.Get(ctx, lockKey, &failCount); err == nil {
		if failCount >= 5 {
			return nil, nil, errors.New("account temporarily locked due to too many failed attempts, try again in 15 minutes")
		}
	}

	user, err := s.repo.FindByEmail(ctx, email)
	if err != nil {
		s.incrementFailCount(ctx, lockKey)
		return nil, nil, errors.New("invalid email or password")
	}

	if !user.IsActive {
		return nil, nil, errors.New("your account is currently deactivated")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		s.incrementFailCount(ctx, lockKey)
		return nil, nil, errors.New("invalid email or password")
	}

	_ = s.cacheStore.Delete(ctx, lockKey)

	pair, err := s.generateTokenPair(user.ID, user.Role)
	if err != nil {
		return nil, nil, fmt.Errorf("generate token pair: %w", err)
	}

	return pair, user, nil
}

func (s *AuthService) incrementFailCount(ctx context.Context, key string) {
	var count int
	_ = s.cacheStore.Get(ctx, key, &count)
	count++
	_ = s.cacheStore.Set(ctx, key, count, 15*time.Minute)
}

// RefreshToken validates a refresh token and issues a new TokenPair.
func (s *AuthService) RefreshToken(ctx context.Context, refreshTokenStr string) (*TokenPair, error) {
	claims, err := s.parseToken(refreshTokenStr)
	if err != nil {
		return nil, fmt.Errorf("invalid refresh token: %w", err)
	}

	// Check if user is active before refreshing
	user, err := s.repo.FindByID(ctx, claims.UserID)
	if err != nil || !user.IsActive {
		return nil, errors.New("unauthorized or deactivated user")
	}

	pair, err := s.generateTokenPair(claims.UserID, claims.Role)
	if err != nil {
		return nil, fmt.Errorf("generate token pair: %w", err)
	}

	return pair, nil
}

// GetUserByID fetches a user by their primary key.
func (s *AuthService) GetUserByID(ctx context.Context, id uint) (*models.User, error) {
	user, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("get user by id: %w", err)
	}
	return user, nil
}

// UpdateProfile updates Name, Nickname, Email, AvatarURL, and Bio of a user.
func (s *AuthService) UpdateProfile(ctx context.Context, userID uint, name, nickname, email, avatarURL, bio string) (*models.User, error) {
	user, err := s.repo.FindByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}
	if email != user.Email {
		existing, err := s.repo.FindByEmail(ctx, email)
		if err == nil && existing.ID != userID {
			return nil, errors.New("email is already registered by another account")
		}
	}
	user.Name = name
	user.Nickname = nickname
	user.Email = email
	user.AvatarURL = avatarURL
	user.Bio = bio
	if err := s.repo.Update(ctx, user); err != nil {
		return nil, fmt.Errorf("update user profile: %w", err)
	}
	return user, nil
}

// ChangePassword changes the user password after verifying the old password.
func (s *AuthService) ChangePassword(ctx context.Context, userID uint, oldPassword, newPassword string) error {
	user, err := s.repo.FindByID(ctx, userID)
	if err != nil {
		return fmt.Errorf("user not found: %w", err)
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(oldPassword)); err != nil {
		return errors.New("incorrect old password")
	}
	hashed, err := s.HashPassword(newPassword)
	if err != nil {
		return fmt.Errorf("hash password: %w", err)
	}
	user.Password = hashed
	if err := s.repo.Update(ctx, user); err != nil {
		return fmt.Errorf("update user password: %w", err)
	}
	return nil
}

// HashPassword hashes a plain-text password using bcrypt cost 12.
func (s *AuthService) HashPassword(password string) (string, error) {
	hashed, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	if err != nil {
		return "", fmt.Errorf("hash password: %w", err)
	}
	return string(hashed), nil
}

// SeedAdminUser creates the default admin account if it does not exist.
func (s *AuthService) SeedAdminUser(ctx context.Context) error {
	const (
		adminEmail    = "admin@example.com"
		adminPassword = "Admin@123"
		adminName     = "Admin"
		adminRole     = "admin"
	)

	_, err := s.repo.FindByEmail(ctx, adminEmail)
	if err == nil {
		// Admin already exists — nothing to do.
		return nil
	}

	hashed, err := s.HashPassword(adminPassword)
	if err != nil {
		return fmt.Errorf("seed admin: hash password: %w", err)
	}

	admin := &models.User{
		Name:     adminName,
		Nickname: adminName,
		Email:    adminEmail,
		Password: hashed,
		Role:     adminRole,
		IsActive: true,
	}

	if err := s.repo.Insert(ctx, admin); err != nil {
		return fmt.Errorf("seed admin: insert user: %w", err)
	}

	return nil
}

// ValidateToken parses and validates an access (or refresh) token string.
func (s *AuthService) ValidateToken(tokenStr string) (*Claims, error) {
	return s.parseToken(tokenStr)
}

// ForgotPassword generates a reset token, stores its hash, and emails the user.
func (s *AuthService) ForgotPassword(ctx context.Context, email string) error {
	user, err := s.repo.FindByEmail(ctx, email)
	if err != nil {
		// silent to prevent email enumeration
		return nil
	}

	rawBytes := make([]byte, 32)
	if _, err := rand.Read(rawBytes); err != nil {
		return fmt.Errorf("generate reset token: %w", err)
	}
	rawToken := hex.EncodeToString(rawBytes)

	hash := sha256.Sum256([]byte(rawToken))
	tokenHash := hex.EncodeToString(hash[:])

	// Mark previous tokens as expired
	s.repo.DB.WithContext(ctx).Table("password_reset_tokens").
		Where("user_id = ? AND used_at IS NULL", user.ID).
		UpdateColumn("expires_at", time.Now())

	prt := &models.PasswordResetToken{
		UserID:    user.ID,
		TokenHash: tokenHash,
		ExpiresAt: time.Now().Add(1 * time.Hour),
	}

	if err := s.repo.DB.WithContext(ctx).Create(prt).Error; err != nil {
		return fmt.Errorf("store reset token: %w", err)
	}

	resetLink := fmt.Sprintf("%s/reset-password?token=%s", s.appURL, rawToken)
	return s.mailer.SendPasswordReset(user.Email, user.Name, resetLink)
}

// ResetPassword resets password if token is valid.
func (s *AuthService) ResetPassword(ctx context.Context, rawToken, newPassword string) error {
	hash := sha256.Sum256([]byte(rawToken))
	tokenHash := hex.EncodeToString(hash[:])

	var prt models.PasswordResetToken
	err := s.repo.DB.WithContext(ctx).
		Where("token_hash = ? AND expires_at > NOW() AND used_at IS NULL", tokenHash).
		First(&prt).Error
	if err != nil {
		return errors.New("invalid or expired reset token")
	}

	hashed, err := s.HashPassword(newPassword)
	if err != nil {
		return fmt.Errorf("hash password: %w", err)
	}

	err = s.repo.DB.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&models.User{}).Where("id = ?", prt.UserID).UpdateColumn("password_hash", hashed).Error; err != nil {
			return err
		}
		now := time.Now()
		return tx.Model(&prt).UpdateColumn("used_at", &now).Error
	})
	if err != nil {
		return fmt.Errorf("reset password transaction: %w", err)
	}

	return nil
}

// ListUsers returns paginated list of users.
func (s *AuthService) ListUsers(ctx context.Context, offset, limit int, role string) ([]models.User, int64, error) {
	return s.repo.FindAll(ctx, offset, limit, role)
}

// CreateUser creates a new user.
func (s *AuthService) CreateUser(ctx context.Context, name, nickname, email, password, role string) (*models.User, error) {
	_, err := s.repo.FindByEmail(ctx, email)
	if err == nil {
		return nil, errors.New("email is already registered")
	}

	hashed, err := s.HashPassword(password)
	if err != nil {
		return nil, fmt.Errorf("hash password: %w", err)
	}

	user := &models.User{
		Name:     name,
		Nickname: nickname,
		Email:    email,
		Password: hashed,
		Role:     role,
		IsActive: true,
	}

	if err := s.repo.Insert(ctx, user); err != nil {
		return nil, fmt.Errorf("create user: %w", err)
	}

	return user, nil
}

// UpdateUser updates user status/details by Admin.
func (s *AuthService) UpdateUser(ctx context.Context, id uint, name, nickname, role string, isActive bool) (*models.User, error) {
	user, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	user.Name = name
	user.Nickname = nickname
	user.Role = role
	user.IsActive = isActive

	if err := s.repo.Update(ctx, user); err != nil {
		return nil, fmt.Errorf("update user: %w", err)
	}

	return user, nil
}

// DeleteUser deletes user (prevent self-deletion).
func (s *AuthService) DeleteUser(ctx context.Context, callerID, targetID uint) error {
	if callerID == targetID {
		return errors.New("you cannot delete your own account")
	}
	return s.repo.Delete(ctx, targetID)
}

func (s *AuthService) generateTokenPair(userID uint, role string) (*TokenPair, error) {
	now := time.Now()

	accessClaims := Claims{
		UserID: userID,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(1440 * time.Minute)),
		},
	}
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessTokenStr, err := accessToken.SignedString([]byte(s.jwtSecret))
	if err != nil {
		return nil, fmt.Errorf("sign access token: %w", err)
	}

	// Refresh token — 7 days.
	refreshClaims := Claims{
		UserID: userID,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(7 * 24 * time.Hour)),
		},
	}
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshTokenStr, err := refreshToken.SignedString([]byte(s.jwtSecret))
	if err != nil {
		return nil, fmt.Errorf("sign refresh token: %w", err)
	}

	return &TokenPair{
		AccessToken:  accessTokenStr,
		RefreshToken: refreshTokenStr,
	}, nil
}

// parseToken validates the token signature and returns the embedded Claims.
func (s *AuthService) parseToken(tokenStr string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return []byte(s.jwtSecret), nil
	})
	if err != nil {
		return nil, fmt.Errorf("parse token: %w", err)
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token claims")
	}

	return claims, nil
}

// SeedDemoData seeds categories, tags, media and high-quality posts if DB is fresh.
func (s *AuthService) SeedDemoData(ctx context.Context) error {
	db := s.repo.DB.WithContext(ctx)

	// 1. Seed Categories
	categories := []categoryModels.Category{
		{Name: "Kubernetes / K8s", Slug: "kubernetes", Description: "Chia sẻ bài viết thực hành, cấu hình, quản trị cụm Kubernetes."},
		{Name: "CI/CD & GitOps", Slug: "ci-cd-gitops", Description: "Tìm hiểu Jenkins, GitLab CI, ArgoCD, Github Actions và quy trình GitOps."},
		{Name: "DevOps Văn Hóa & Công Cụ", Slug: "devops", Description: "Văn hóa DevOps, tư duy tự động hóa và các công cụ bổ trợ."},
		{Name: "Infrastructure as Code", Slug: "infrastructure-as-code", Description: "Quản lý hạ tầng bằng mã nguồn sử dụng Terraform, Ansible, OpenTofu."},
	}

	for i := range categories {
		var existing categoryModels.Category
		if err := db.Where("slug = ?", categories[i].Slug).First(&existing).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				if err := db.Create(&categories[i]).Error; err != nil {
					return fmt.Errorf("seed category: %w", err)
				}
			}
		} else {
			categories[i] = existing
		}
	}

	// 2. Seed Tags
	tags := []tagModels.Tag{
		{Name: "Kubernetes", Slug: "kubernetes"},
		{Name: "Docker", Slug: "docker"},
		{Name: "CI/CD", Slug: "ci-cd"},
		{Name: "ArgoCD", Slug: "argocd"},
		{Name: "Terraform", Slug: "terraform"},
		{Name: "Kubestronaut", Slug: "kubestronaut"},
	}

	for i := range tags {
		var existing tagModels.Tag
		if err := db.Where("slug = ?", tags[i].Slug).First(&existing).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				if err := db.Create(&tags[i]).Error; err != nil {
					return fmt.Errorf("seed tag: %w", err)
				}
			}
		} else {
			tags[i] = existing
		}
	}

	// 3. Find seeded admin for Author association
	var adminUser models.User
	if err := db.Where("role = ?", "admin").First(&adminUser).Error; err != nil {
		return fmt.Errorf("find admin user for seeding posts: %w", err)
	}

	// 4. Seed Media
	mediaList := []mediaModels.Media{
		{
			FileName: "kubestronaut-cover.png",
			URL:      "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=1200&auto=format&fit=crop&q=80",
			Status:   "completed",
			Type:     "image",
			FileSize: 254100,
			MimeType: "image/png",
		},
		{
			FileName: "cert-cka.png",
			URL:      "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&auto=format&fit=crop&q=80",
			Status:   "completed",
			Type:     "image",
			FileSize: 104000,
			MimeType: "image/png",
		},
		{
			FileName: "cert-cks.png",
			URL:      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
			Status:   "completed",
			Type:     "image",
			FileSize: 112000,
			MimeType: "image/png",
		},
	}

	for i := range mediaList {
		var existing mediaModels.Media
		if err := db.Where("file_name = ?", mediaList[i].FileName).First(&existing).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				if err := db.Create(&mediaList[i]).Error; err != nil {
					return fmt.Errorf("seed media: %w", err)
				}
			}
		} else {
			mediaList[i] = existing
		}
	}

	// 5. Seed Posts
	now := time.Now()
	postKubestronaut := postModels.Post{
		Title:   "Hành trình chinh phục Kubestronaut trong 3 tháng",
		Slug:    "hanh-trinh-chinh-phuc-kubestronaut-trong-3-thang",
		Excerpt: "Chinh phục chương trình Kubestronaut danh giá của CNCF trong 3 tháng qua việc thi đỗ 5 chứng chỉ Kubernetes CKA, CKAD, CKS, KCNA, KCSA. Lộ trình chi tiết, tài liệu và kinh nghiệm ôn thi thực tế.",
		Content: `<h2>Kubestronaut là gì?</h2>
<p><strong>Kubestronaut</strong> là chương trình vinh danh đặc biệt của Cloud Native Computing Foundation (CNCF) dành cho những cá nhân chứng minh được năng lực chuyên môn xuất sắc nhất về Kubernetes. Để trở thành một Kubestronaut, bạn cần đỗ đồng thời 5 chứng chỉ chính thức bao gồm:</p>
<ul>
  <li><strong>KCNA</strong> (Kubernetes and Cloud Native Associate)</li>
  <li><strong>KCSA</strong> (Kubernetes and Cloud Native Security Associate)</li>
  <li><strong>CKA</strong> (Certified Kubernetes Administrator)</li>
  <li><strong>CKAD</strong> (Certified Kubernetes Application Developer)</li>
  <li><strong>CKS</strong> (Certified Kubernetes Security Specialist)</li>
</ul>

<blockquote>
  <p>"Trở thành Kubestronaut không chỉ là việc sở hữu các tấm bằng chứng chỉ, mà đó là minh chứng cho sự kiên trì, đam mê học hỏi và một tư duy hệ thống vững chắc trong thế giới Cloud Native."</p>
</blockquote>

<h2>Lộ trình học và thi chi tiết</h2>
<h3>1. KCNA & KCSA - Khởi động cơ bản</h3>
<p>Hai chứng chỉ Associate này chủ yếu tập trung vào lý thuyết và các khái niệm cơ bản về kiến trúc Kubernetes, bảo mật container, và hệ sinh thái CNCF. Ôn luyện tập trung vào tài liệu chính thức của CNCF và các khóa học trên Udemy hoặc KodeKloud.</p>

<h3>2. CKA - Quản trị hệ thống</h3>
<p>CKA là chứng chỉ thực hành (hands-on) hoàn toàn trên môi trường console terminal thực tế. Bạn sẽ được yêu cầu thiết lập cụm K8s, nâng cấp control plane, khắc phục sự cố node, cấu hình ingress và phân quyền RBAC.
Hãy làm quen với việc thao tác nhanh trên Command Line Interface (CLI):</p>

<pre><code class="language-bash"># Tạo alias và autocomplete nhanh khi đi thi
alias k=kubectl
complete -o default -F __start_kubectl k

# Tạo pod nhanh dùng chế độ chạy thử (imperative command)
k run nginx-pod --image=nginx --dry-run=client -o yaml > pod.yaml
kubectl apply -f pod.yaml</code></pre>

<h3>3. CKAD - Phát triển ứng dụng</h3>
<p>CKAD yêu cầu bạn cấu hình nhanh Pods, Deployments, Services, ConfigMaps, Secrets, và các mô hình Network Policy. Đòi hỏi kỹ năng tối ưu hóa file YAML và khả năng đọc đề nhanh.</p>

<h3>4. CKS - Bảo mật nâng cao</h3>
<p>CKS là chứng chỉ khó nhất trong chuỗi. Tập trung vào việc bảo mật hệ thống từ tầng xây dựng image, cấu hình TLS, audit logging, giám sát Runtime Security (Falco), quét lỗ hổng ứng dụng với Trivy, và thiết lập AppArmor/Seccomp profiles:</p>

<pre><code class="language-yaml">apiVersion: v1
kind: Pod
metadata:
  name: secure-pod
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
  containers:
  - name: app
    image: alpine:3.18
    command: ["sleep", "3600"]
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop:
        - ALL</code></pre>

<h2>Lời khuyên khi đi thi thực hành</h2>
<p>Khi bước vào phòng thi CKA/CKAD/CKS, yếu tố thời gian là vô cùng quan trọng. Hãy tận dụng tối đa tài liệu được phép tham khảo tại trang kubernetes.io/docs. Hãy bookmark trước các mục quan trọng như NetworkPolicy, PV/PVC, Ingress để truy cập nhanh khi cần.</p>
<p>Chúc các bạn sớm ghi danh vào ngôi đền huyền thoại Kubestronaut!</p>`,
		CoverMediaID: &mediaList[0].ID,
		Status:       "published",
		AuthorID:     &adminUser.ID,
		MetaTitle:    "Lộ trình chinh phục Kubestronaut trong 3 tháng - DevOps.vn",
		MetaDesc:     "Lộ trình chi tiết chinh phục chương trình Kubestronaut danh giá của CNCF. Tổng ôn CKA, CKAD, CKS, KCNA, KCSA trong thời gian ngắn.",
		IsFeatured:   true,
		PublishedAt:  &now,
		ViewCount:    3450,
	}

	postTerraform := postModels.Post{
		Title:   "Quản lý hạ tầng Multi-Cloud hiệu quả với Terraform Workspace",
		Slug:    "quan-ly-ha-tang-multi-cloud-voi-terraform-workspace",
		Excerpt: "Hướng dẫn sử dụng Terraform Workspace và Terragrunt để quản lý hạ tầng đa môi trường Development, Staging, Production độc lập, giảm thiểu rủi ro xung đột mã.",
		Content: `<h2>Tại sao nên sử dụng Terraform Workspace?</h2>
<p>Khi quy mô hạ tầng lớn lên, việc quản trị độc lập các môi trường dev, staging, và production trở nên tối quan trọng. Terraform Workspace cho phép ta cô lập state file của từng môi trường mà không cần nhân bản mã nguồn nhiều lần.</p>

<pre><code class="language-bash"># Tạo mới workspace dev
terraform workspace new dev

# Chuyển sang workspace prod
terraform workspace select prod

# Xem danh sách các workspace đang có
terraform workspace list</code></pre>

<p>Việc kết hợp với Terraform Backend S3 và DynamoDB Lock sẽ giúp toàn bộ team DevOps làm việc cộng tác an toàn, tránh ghi đè state lẫn nhau.</p>`,
		CoverMediaID: &mediaList[1].ID,
		Status:       "published",
		AuthorID:     &adminUser.ID,
		MetaTitle:    "Quản lý hạ tầng Multi-Cloud với Terraform Workspace - DevOps.vn",
		MetaDesc:     "Sử dụng Terraform Workspace quản lý hạ tầng Dev, Staging, Prod chuyên nghiệp.",
		IsFeatured:   false,
		PublishedAt:  &now,
		ViewCount:    920,
	}

	postsToSeed := []postModels.Post{postKubestronaut, postTerraform}

	for i := range postsToSeed {
		var existing postModels.Post
		if err := db.Where("slug = ?", postsToSeed[i].Slug).First(&existing).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				if postsToSeed[i].Slug == "hanh-trinh-chinh-phuc-kubestronaut-trong-3-thang" {
					postsToSeed[i].Categories = []categoryModels.Category{categories[0], categories[2]}
					postsToSeed[i].Tags = []tagModels.Tag{tags[0], tags[1], tags[5]}
				} else {
					postsToSeed[i].Categories = []categoryModels.Category{categories[3]}
					postsToSeed[i].Tags = []tagModels.Tag{tags[4]}
				}

				if err := db.Create(&postsToSeed[i]).Error; err != nil {
					return fmt.Errorf("seed post %s: %w", postsToSeed[i].Slug, err)
				}

				if postsToSeed[i].Slug == "hanh-trinh-chinh-phuc-kubestronaut-trong-3-thang" {
					galleryMedia := []postModels.PostMedia{
						{PostID: postsToSeed[i].ID, MediaID: mediaList[1].ID, SortOrder: 1, Caption: "Chứng chỉ CKA đạt được sau 3 tuần ôn tập", AltText: "Certified Kubernetes Administrator CKA"},
						{PostID: postsToSeed[i].ID, MediaID: mediaList[2].ID, SortOrder: 2, Caption: "Hoàn tất chứng chỉ khó nhất CKS", AltText: "Certified Kubernetes Security Specialist CKS"},
					}
					for _, gm := range galleryMedia {
						_ = db.Create(&gm)
					}
				}
			}
		}
	}

	return nil
}
