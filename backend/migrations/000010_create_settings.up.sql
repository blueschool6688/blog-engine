-- Migration: 000010_create_settings
-- Creates settings table for global configurations

CREATE TABLE IF NOT EXISTS "settings" (
    "id"            BIGSERIAL PRIMARY KEY,
    "created_at"    TIMESTAMPTZ,
    "updated_at"    TIMESTAMPTZ,
    "deleted_at"    TIMESTAMPTZ,
    "key"           VARCHAR(100) NOT NULL UNIQUE,
    "value"         TEXT
);

CREATE INDEX IF NOT EXISTS "idx_settings_deleted_at" ON "settings"("deleted_at");

-- Seed initial settings
INSERT INTO "settings" ("created_at", "updated_at", "key", "value") VALUES
(NOW(), NOW(), 'site_name', 'Blog Engine'),
(NOW(), NOW(), 'site_description', 'Welcome to my tech blog'),
(NOW(), NOW(), 'logo_url', '')
ON CONFLICT ("key") DO NOTHING;
