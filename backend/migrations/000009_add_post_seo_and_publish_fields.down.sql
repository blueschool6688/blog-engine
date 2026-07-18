DROP TRIGGER IF EXISTS trigger_posts_search_vector ON posts;
DROP FUNCTION IF EXISTS posts_search_vector_trigger();
DROP INDEX IF EXISTS idx_posts_search_vector;

ALTER TABLE posts
DROP COLUMN IF EXISTS meta_title,
DROP COLUMN IF EXISTS meta_desc,
DROP COLUMN IF EXISTS excerpt,
DROP COLUMN IF EXISTS is_featured,
DROP COLUMN IF EXISTS published_at,
DROP COLUMN IF EXISTS view_count,
DROP COLUMN IF EXISTS search_vector;
