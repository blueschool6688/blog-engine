-- Migration: 000001_create_users
-- Creates the users table (used for both authentication and authorship)
-- Author domain: name, email, password_hash, avatar_url, bio, role

CREATE TABLE IF NOT EXISTS "users" (
    "id"            BIGSERIAL PRIMARY KEY,
    "created_at"    TIMESTAMPTZ,
    "updated_at"    TIMESTAMPTZ,
    "deleted_at"    TIMESTAMPTZ,
    "name"          VARCHAR(255) NOT NULL,
    "email"         VARCHAR(255) NOT NULL,
    "password" TEXT        NOT NULL,
    "avatar_url"    TEXT,
    "role"          VARCHAR(50) NOT NULL DEFAULT 'client'
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_users_email"      ON "users"("email") WHERE "deleted_at" IS NULL;
CREATE INDEX        IF NOT EXISTS "idx_users_deleted_at" ON "users"("deleted_at");
