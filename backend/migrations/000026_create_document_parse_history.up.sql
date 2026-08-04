CREATE TABLE IF NOT EXISTS document_parse_history (
    id SERIAL PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'success', 'failed'
    error_message TEXT,
    markdown_result TEXT,
    duration_ms BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
