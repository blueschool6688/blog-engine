ALTER TABLE users ADD COLUMN nickname VARCHAR(100);

-- Backfill old users with their name as the default nickname
UPDATE users SET nickname = COALESCE(name, 'User');

-- Apply NOT NULL constraint after backfilling
ALTER TABLE users ALTER COLUMN nickname SET NOT NULL;
