-- database/init.sql
-- Complete database initialization script

-- Set search path
SET search_path TO public;

-- Run all migration files
\i database/migrations/001_initial_schema.sql
\i database/migrations/002_add_rate_limit_tables.sql
\i database/migrations/003_add_indexes.sql

-- Run functions and triggers
\i database/functions/update_updated_at.sql
\i database/triggers/auto_update_timestamp.sql

-- Run row-level security policies (optional)
-- \i database/policies/row_level_security.sql

-- Run seed data
\i database/seed/initial_data.sql

-- Verify table creation
SELECT 
  table_name,
  pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) as size
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;