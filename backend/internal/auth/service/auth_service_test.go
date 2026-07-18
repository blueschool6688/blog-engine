package service_test

import (
	"context"
	"testing"

	"backend/internal/auth/models"
	"backend/internal/auth/repository"
	"backend/internal/auth/service"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

func setupTestDB(t *testing.T) (*gorm.DB, func()) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect database: %v", err)
	}

	err = db.AutoMigrate(&models.User{})
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

func TestAuthService_PasswordHashing(t *testing.T) {
	db, cleanup := setupTestDB(t)
	defer cleanup()

	repo := repository.NewUserRepository(db)
	svc := service.NewAuthService(repo, "test-secret")

	password := "SecretPass123!"
	hashed, err := svc.HashPassword(password)
	if err != nil {
		t.Fatalf("expected no error during hash generation, got %v", err)
	}

	if hashed == "" || hashed == password {
		t.Errorf("expected secure hashed password, got %q", hashed)
	}
}

func TestAuthService_LoginAndTokenValidation(t *testing.T) {
	db, cleanup := setupTestDB(t)
	defer cleanup()

	repo := repository.NewUserRepository(db)
	svc := service.NewAuthService(repo, "test-secret")

	ctx := context.Background()
	email := "test@example.com"
	password := "supersecret"

	// Create user
	hashed, _ := svc.HashPassword(password)
	user := &models.User{
		Name:     "Test User",
		Email:    email,
		Password: hashed,
		Role:     "user",
	}
	if err := repo.Insert(ctx, user); err != nil {
		t.Fatalf("failed to insert test user: %v", err)
	}

	// Test Login success
	pair, loggedInUser, err := svc.Login(ctx, email, password)
	if err != nil {
		t.Fatalf("expected successful login, got error: %v", err)
	}

	if loggedInUser.Email != email {
		t.Errorf("expected email %q, got %q", email, loggedInUser.Email)
	}

	if pair.AccessToken == "" || pair.RefreshToken == "" {
		t.Error("expected valid token pair generated")
	}

	// Test Token Validation
	claims, err := svc.ValidateToken(pair.AccessToken)
	if err != nil {
		t.Fatalf("expected access token to be valid, got error: %v", err)
	}

	if claims.UserID != user.ID || claims.Role != user.Role {
		t.Errorf("expected claims mismatch, user id %d, role %s", claims.UserID, claims.Role)
	}

	// Test Login fail (wrong password)
	_, _, err = svc.Login(ctx, email, "wrongpassword")
	if err == nil {
		t.Error("expected login error with incorrect password, got nil")
	}

	// Test Login fail (non-existent email)
	_, _, err = svc.Login(ctx, "nonexistent@example.com", password)
	if err == nil {
		t.Error("expected login error for non-existent user, got nil")
	}
}
