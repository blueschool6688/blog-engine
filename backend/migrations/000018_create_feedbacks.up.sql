CREATE TABLE IF NOT EXISTS "feedbacks" (
    "id"            BIGSERIAL PRIMARY KEY,
    "created_at"    TIMESTAMPTZ,
    "updated_at"    TIMESTAMPTZ,
    "deleted_at"    TIMESTAMPTZ,
    "name"          VARCHAR(255) NOT NULL,
    "email"         VARCHAR(255) NOT NULL,
    "subject"       VARCHAR(255),
    "content"       TEXT NOT NULL,
    "rating"        INT DEFAULT 5,
    "status"        VARCHAR(50) DEFAULT 'pending'
);

CREATE INDEX IF NOT EXISTS "idx_feedbacks_deleted_at" ON "feedbacks"("deleted_at");
CREATE INDEX IF NOT EXISTS "idx_feedbacks_status" ON "feedbacks"("status");
