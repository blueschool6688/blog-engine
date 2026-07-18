-- Migration: 000006_create_post_relations
-- Creates post_categories and post_tags join tables for many-to-many relationships

CREATE TABLE IF NOT EXISTS "post_categories" (
    "post_id" BIGINT REFERENCES posts(id) ON DELETE CASCADE,
    "category_id" BIGINT REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY ("post_id", "category_id")
);

CREATE TABLE IF NOT EXISTS "post_tags" (
    "post_id" BIGINT REFERENCES posts(id) ON DELETE CASCADE,
    "tag_id" BIGINT REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY ("post_id", "tag_id")
);
