package seeds

import (
	"fmt"

	authModels "backend/internal/auth/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// userSeed represents a single user record to be seeded.
type userSeed struct {
	Name      string
	Email     string
	Password  string
	Role      string
	AvatarURL string
}

// defaultUsers is the list of users seeded by UserSeeder.
// All passwords are bcrypt-hashed at cost 12 before insertion.
var defaultUsers = []userSeed{
	{
		Name:     "Admin",
		Email:    "admin@example.com",
		Password: "Admin@123",
		Role:     "admin",
	},
	{
		Name:     "Editor",
		Email:    "editor@example.com",
		Password: "Editor@123",
		Role:     "editor",
	},
}

// UserSeeder creates default admin and editor accounts.
// Skips any user whose email already exists in the database.
type UserSeeder struct{}

func (s *UserSeeder) Name() string { return "UserSeeder" }

func (s *UserSeeder) Run(db *gorm.DB) error {
	for _, u := range defaultUsers {
		// Idempotency: skip if the email already exists (including soft-deleted)
		var count int64
		if err := db.Unscoped().Model(&authModels.User{}).
			Where("email = ?", u.Email).
			Count(&count).Error; err != nil {
			return fmt.Errorf("check user %s: %w", u.Email, err)
		}
		if count > 0 {
			continue // already seeded
		}

		hash, err := bcrypt.GenerateFromPassword([]byte(u.Password), 12)
		if err != nil {
			return fmt.Errorf("hash password for %s: %w", u.Email, err)
		}

		user := &authModels.User{
			Name:      u.Name,
			Email:     u.Email,
			Password:  string(hash),
			Role:      u.Role,
			AvatarURL: u.AvatarURL,
		}
		if err := db.Create(user).Error; err != nil {
			return fmt.Errorf("insert user %s: %w", u.Email, err)
		}
	}
	return nil
}
