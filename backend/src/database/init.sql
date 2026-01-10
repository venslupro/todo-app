-- database/init.sql
-- 完整的数据库初始化脚本

-- 设置搜索路径
SET search_path TO public;

-- 运行所有迁移文件
\i database/migrations/001_initial_schema.sql
\i database/migrations/002_add_rate_limit_tables.sql
\i database/migrations/003_add_indexes.sql

-- 运行函数和触发器
\i database/functions/update_updated_at.sql
\i database/triggers/auto_update_timestamp.sql

-- 运行行级安全策略（可选）
-- \i database/policies/row_level_security.sql

-- 运行种子数据
\i database/seed/initial_data.sql

-- 验证表创建
SELECT 
  table_name,
  pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) as size
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;