CREATE TABLE IF NOT EXISTS "post_views" (
    "id"            BIGSERIAL PRIMARY KEY,
    "post_id"       BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    "viewed_at"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "ip_address"    VARCHAR(45),
    "user_agent"    TEXT,
    "referrer"      TEXT
);

CREATE INDEX IF NOT EXISTS "idx_post_views_post_id" ON "post_views"("post_id");
CREATE INDEX IF NOT EXISTS "idx_post_views_viewed_at" ON "post_views"("viewed_at");
