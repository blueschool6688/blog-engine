-- Migration: 000004_create_categories
-- Creates the categories table

CREATE TABLE IF NOT EXISTS "categories" (
    "id"            BIGSERIAL PRIMARY KEY,
    "created_at"    TIMESTAMPTZ,
    "updated_at"    TIMESTAMPTZ,
    "deleted_at"    TIMESTAMPTZ,
    "name"          VARCHAR(255) NOT NULL,
    "slug"          VARCHAR(255) NOT NULL,
    "description"   TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_categories_name" ON "categories"("name") WHERE "deleted_at" IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "idx_categories_slug" ON "categories"("slug") WHERE "deleted_at" IS NULL;
CREATE INDEX IF NOT EXISTS "idx_categories_deleted_at" ON "categories"("deleted_at");
