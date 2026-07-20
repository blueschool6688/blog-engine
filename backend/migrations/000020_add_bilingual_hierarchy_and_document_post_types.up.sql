ALTER TABLE posts ADD COLUMN IF NOT EXISTS title_en varchar(255);
ALTER TABLE posts ADD COLUMN IF NOT EXISTS content_en text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS excerpt_en text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS slug_en varchar(255);
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_document boolean DEFAULT false;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS pdf_media_id bigint REFERENCES media(id) ON DELETE SET NULL;

ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_en varchar(255);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS slug_en varchar(255);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS description_en text;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id bigint REFERENCES categories(id) ON DELETE SET NULL;
