ALTER TABLE posts
ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS meta_desc TEXT,
ADD COLUMN IF NOT EXISTS excerpt TEXT,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS view_count BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE INDEX IF NOT EXISTS idx_posts_search_vector ON posts USING gin(search_vector);

CREATE OR REPLACE FUNCTION posts_search_vector_trigger() RETURNS trigger AS $$
begin
  new.search_vector :=
    to_tsvector('english', coalesce(new.title, '')) ||
    to_tsvector('english', coalesce(new.content, ''));
  return new;
end
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_posts_search_vector ON posts;
CREATE TRIGGER trigger_posts_search_vector BEFORE INSERT OR UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION posts_search_vector_trigger();

-- Initialize existing records
UPDATE posts SET search_vector = 
  to_tsvector('english', coalesce(title, '')) ||
  to_tsvector('english', coalesce(content, ''));
