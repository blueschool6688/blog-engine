-- Tạo bảng translate_jobs để lưu trữ async translation job queue.
-- Dùng SELECT FOR UPDATE SKIP LOCKED để worker poll không bị xung đột.
CREATE TABLE translate_jobs (
    id          BIGSERIAL   PRIMARY KEY,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ,
    job_id      VARCHAR(36) NOT NULL UNIQUE,
    content     TEXT        NOT NULL,
    target_lang VARCHAR(5)  NOT NULL,
    source_lang VARCHAR(5)  NOT NULL DEFAULT '',
    status      VARCHAR(20) NOT NULL DEFAULT 'pending',
    result      TEXT        NOT NULL DEFAULT ''
);

-- Index để worker nhanh chóng tìm job pending (ORDER BY created_at ASC)
CREATE INDEX idx_translate_jobs_status_created ON translate_jobs (status, created_at);
