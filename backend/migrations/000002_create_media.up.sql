-- Migration: 000002_create_media
-- Creates the media table for uploaded files (images & future videos)
-- Worker processes: status transitions processing → completed | failed

CREATE TABLE IF NOT EXISTS "media" (
    "id"            BIGSERIAL PRIMARY KEY,
    "created_at"    TIMESTAMPTZ,
    "updated_at"    TIMESTAMPTZ,
    "deleted_at"    TIMESTAMPTZ,
    "file_name"     VARCHAR(255) NOT NULL,
    "url"           TEXT        NOT NULL,
    "thumbnail_url" TEXT,
    "status"        VARCHAR(50) NOT NULL DEFAULT 'processing'
);

CREATE INDEX IF NOT EXISTS "idx_media_deleted_at" ON "media"("deleted_at");
CREATE INDEX IF NOT EXISTS "idx_media_status"     ON "media"("status");
