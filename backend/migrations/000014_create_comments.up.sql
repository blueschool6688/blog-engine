CREATE TABLE comments (
    id           BIGSERIAL PRIMARY KEY,
    post_id      BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    parent_id    BIGINT REFERENCES comments(id) ON DELETE CASCADE,
    author_name  VARCHAR(255),
    author_email VARCHAR(255),
    content      TEXT NOT NULL,
    status       VARCHAR(50) NOT NULL DEFAULT 'pending',
    ip_address   VARCHAR(45),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_status ON comments(status);
