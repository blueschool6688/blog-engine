CREATE TABLE IF NOT EXISTS "post_media" (
    "id"          BIGSERIAL PRIMARY KEY,
    "post_id"     BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    "media_id"    BIGINT NOT NULL REFERENCES media(id) ON DELETE CASCADE,
    "sort_order"  INT DEFAULT 0,
    "caption"     TEXT,
    "alt_text"    VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS "idx_post_media_post_id" ON "post_media"("post_id");
