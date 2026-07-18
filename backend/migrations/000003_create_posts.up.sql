-- Migration: 000003_create_posts
-- Creates the posts table with FK to media (cover image) and users (author)
-- Status: draft | published
-- Soft-delete supported via deleted_at

CREATE TABLE IF NOT EXISTS "posts" (
    "id"             BIGSERIAL PRIMARY KEY,
    "created_at"     TIMESTAMPTZ,
    "updated_at"     TIMESTAMPTZ,
    "deleted_at"     TIMESTAMPTZ,
    "title"          VARCHAR(255) NOT NULL,
    "slug"           VARCHAR(255) NOT NULL,
    "content"        TEXT,
    "cover_media_id" BIGINT REFERENCES "media"("id") ON DELETE SET NULL,
    "author_id"      BIGINT REFERENCES "users"("id") ON DELETE SET NULL,
    "status"         VARCHAR(50) NOT NULL DEFAULT 'draft'
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_posts_slug"           ON "posts"("slug") WHERE "deleted_at" IS NULL;
CREATE INDEX        IF NOT EXISTS "idx_posts_deleted_at"     ON "posts"("deleted_at");
CREATE INDEX        IF NOT EXISTS "idx_posts_status"         ON "posts"("status");
CREATE INDEX        IF NOT EXISTS "idx_posts_cover_media_id" ON "posts"("cover_media_id");
CREATE INDEX        IF NOT EXISTS "idx_posts_author_id"      ON "posts"("author_id");
