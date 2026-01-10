-- database/migrations/003_add_indexes.sql
-- Add indexes to improve query performance

-- TODO table indexes
CREATE INDEX IF NOT EXISTS idx_todos_created_by ON todos(created_by);
CREATE INDEX IF NOT EXISTS idx_todos_status ON todos(status);
CREATE INDEX IF NOT EXISTS idx_todos_priority ON todos(priority);
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date);
CREATE INDEX IF NOT EXISTS idx_todos_is_deleted ON todos(is_deleted);
CREATE INDEX IF NOT EXISTS idx_todos_parent_id ON todos(parent_id);
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_todos_updated_at ON todos(updated_at DESC);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_todos_user_status 
  ON todos(created_by, status, is_deleted);

CREATE INDEX IF NOT EXISTS idx_todos_user_due_date 
  ON todos(created_by, due_date) 
  WHERE is_deleted = FALSE;

-- TODO sharing table indexes
CREATE INDEX IF NOT EXISTS idx_todo_shares_todo_id ON todo_shares(todo_id);
CREATE INDEX IF NOT EXISTS idx_todo_shares_user_id ON todo_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_todo_shares_shared_by ON todo_shares(shared_by);
CREATE INDEX IF NOT EXISTS idx_todo_shares_created_at ON todo_shares(created_at DESC);

-- Media files table indexes
CREATE INDEX IF NOT EXISTS idx_media_todo_id ON media(todo_id);
CREATE INDEX IF NOT EXISTS idx_media_created_by ON media(created_by);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_media_type ON media(media_type);

-- Rate limit table indexes
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier);
CREATE INDEX IF NOT EXISTS idx_rate_limits_timestamp ON rate_limits(timestamp);
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_timestamp ON rate_limits(identifier, timestamp DESC);

-- API keys table indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);

-- API密钥请求日志表索引
CREATE INDEX IF NOT EXISTS idx_api_key_requests_api_key ON api_key_requests(api_key);
CREATE INDEX IF NOT EXISTS idx_api_key_requests_timestamp ON api_key_requests(timestamp);
CREATE INDEX IF NOT EXISTS idx_api_key_requests_api_key_timestamp ON api_key_requests(api_key, timestamp DESC);

-- 全文搜索索引（如果需要搜索功能）
CREATE INDEX IF NOT EXISTS idx_todos_search 
  ON todos 
  USING GIN (to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(description, '')));