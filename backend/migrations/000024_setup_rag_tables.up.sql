-- Kích hoạt pgvector (Tạm ẩn cho Windows/Laragon)
-- CREATE EXTENSION IF NOT EXISTS vector;

-- Bảng lưu trữ chunks
CREATE TABLE IF NOT EXISTS blog_chunks (
    id SERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    embedding TEXT, -- Tạm thời đổi sang TEXT thay vì vector(1024) do thiếu pgvector
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index HNSW tối ưu hóa tìm kiếm cosine similarity ( <=> )
-- (Tạm ẩn do đổi sang TEXT)
-- CREATE INDEX ON blog_chunks USING hnsw (embedding vector_cosine_ops);

-- Bảng job queue cho RAG worker
CREATE TABLE IF NOT EXISTS rag_jobs (
    id SERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, done, failed
    error_msg TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
