// Package seeds defines the Seeder interface and the ordered list of seeders
// registered for the blog engine project.
//
// Each seeder must be idempotent (safe to run multiple times) and should
// check whether its data already exists before inserting.
package seeds

import (
	"fmt"

	"gorm.io/gorm"
)

// Seeder is the contract every seed file must implement.
type Seeder interface {
	// Name returns a human-readable identifier shown in CLI output.
	Name() string
	// Run executes the seed logic. It receives the active *gorm.DB connection.
	// Implementations must be idempotent.
	Run(db *gorm.DB) error
}

// All returns the ordered slice of seeders that will be executed by the CLI.
// Add new seeders here in dependency order (users before posts, etc.).
func All() []Seeder {
	return []Seeder{
		&UserSeeder{},
		&PostSeeder{},
	}
}

// Run executes every registered seeder and prints a summary line for each.
func Run(db *gorm.DB) error {
	seeders := All()
	fmt.Printf("\n  Running %d seeder(s)...\n\n", len(seeders))

	for i, s := range seeders {
		fmt.Printf("  [%d/%d] %-30s ", i+1, len(seeders), s.Name()+"...")
		if err := s.Run(db); err != nil {
			fmt.Println("❌ FAILED")
			return fmt.Errorf("seeder %q: %w", s.Name(), err)
		}
		fmt.Println("✅ done")
	}

	fmt.Printf("\n  All seeders completed successfully.\n\n")
	return nil
}
