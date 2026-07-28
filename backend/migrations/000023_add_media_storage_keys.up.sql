-- Migration 023: Thêm storage_provider, storage_key và thumbnail_storage_key cho bảng media
ALTER TABLE media
    ADD COLUMN IF NOT EXISTS storage_provider     VARCHAR(50) DEFAULT 'local',
    ADD COLUMN IF NOT EXISTS storage_key          VARCHAR(500),
    ADD COLUMN IF NOT EXISTS thumbnail_storage_key VARCHAR(500);
