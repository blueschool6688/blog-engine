package database

import (
	"fmt"

	"backend/pkg/config"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Connect(cfg *config.Config) (*gorm.DB, error) {
	dsnSystem := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=postgres port=%s sslmode=%s",
		cfg.DBHost, cfg.DBUser, cfg.DBPassword, cfg.DBPort, cfg.DBSSLMode,
	)

	dbSystem, err := gorm.Open(postgres.Open(dsnSystem), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("connect to system db: %w", err)
	}

	var exists bool
	query := fmt.Sprintf("SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = '%s')", cfg.DBName)
	if err := dbSystem.Raw(query).Scan(&exists).Error; err != nil {
		_ = closeSystemDB(dbSystem)
		return nil, fmt.Errorf("check database existence: %w", err)
	}

	if !exists {
		createDBQuery := fmt.Sprintf("CREATE DATABASE %s", cfg.DBName)
		if err := dbSystem.Exec(createDBQuery).Error; err != nil {
			_ = closeSystemDB(dbSystem)
			return nil, fmt.Errorf("create database %s: %w", cfg.DBName, err)
		}
	}

	_ = closeSystemDB(dbSystem)

	dsnTarget := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
		cfg.DBHost, cfg.DBUser, cfg.DBPassword, cfg.DBName, cfg.DBPort, cfg.DBSSLMode,
	)

	db, err := gorm.Open(postgres.Open(dsnTarget), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("connect to target db: %w", err)
	}

	return db, nil
}

func closeSystemDB(db *gorm.DB) error {
	sqlDB, err := db.DB()
	if err == nil {
		return sqlDB.Close()
	}
	return nil
}
