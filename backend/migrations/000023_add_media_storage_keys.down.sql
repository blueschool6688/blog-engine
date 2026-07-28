-- Rollback migration 023
ALTER TABLE media
    DROP COLUMN IF EXISTS storage_provider,
    DROP COLUMN IF EXISTS storage_key,
    DROP COLUMN IF EXISTS thumbnail_storage_key;
