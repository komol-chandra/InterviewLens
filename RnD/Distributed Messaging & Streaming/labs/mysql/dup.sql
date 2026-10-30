CREATE DATABASE lab; USE lab;
-- same indexes as 2020_08_18_074138_create_trackings_table: no unique key
CREATE TABLE trackings (id BIGINT AUTO_INCREMENT PRIMARY KEY, user_id INT, lat DECIMAL(10,7), lng DECIMAL(10,7),
  created_at DATETIME, KEY (user_id), KEY (created_at, user_id));
SET @batch = 'INSERT INTO trackings (user_id,lat,lng,created_at) VALUES (7,23.81,90.41,"2026-10-26 10:00:00"),(7,23.82,90.42,"2026-10-26 10:00:05"),(9,22.33,91.83,"2026-10-26 10:00:00")';
PREPARE b FROM @batch; EXECUTE b; EXECUTE b;            -- the F9 replay: same batch twice
SELECT 'after replay' step, COUNT(*) n FROM trackings;
DELETE t1 FROM trackings t1 JOIN trackings t2 ON t1.user_id=t2.user_id AND t1.created_at=t2.created_at AND t1.id>t2.id;
ALTER TABLE trackings ADD UNIQUE KEY trackings_user_time_unique (user_id, created_at);
SET @ignore = REPLACE(@batch, 'INSERT INTO', 'INSERT IGNORE INTO'); PREPARE i FROM @ignore; EXECUTE i;   -- = insertOrIgnore()
SELECT 'after dedupe + unique + replay' step, COUNT(*) n FROM trackings;
