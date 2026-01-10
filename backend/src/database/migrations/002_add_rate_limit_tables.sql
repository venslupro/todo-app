-- database/migrations/002_add_rate_limit_tables.sql
-- 添加速率限制相关表

-- 速率限制表（基于IP地址）
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  identifier VARCHAR(255) NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API密钥表（可选功能）
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key VARCHAR(255) NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  rate_limit INTEGER NOT NULL DEFAULT 1000,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- 外键约束
  CONSTRAINT fk_api_keys_user_id 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE
);

-- API密钥请求日志表
CREATE TABLE IF NOT EXISTS api_key_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  api_key VARCHAR(255) NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);