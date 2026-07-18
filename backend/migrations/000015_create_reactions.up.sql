CREATE TABLE reactions (
    id          BIGSERIAL PRIMARY KEY,
    post_id     BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    emoji       VARCHAR(20) NOT NULL,
    fingerprint VARCHAR(255) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_reactions_unique ON reactions(post_id, fingerprint);
CREATE INDEX idx_reactions_post_emoji ON reactions(post_id, emoji);
