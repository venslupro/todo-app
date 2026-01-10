-- database/migrations/002_add_rate_limit_tables.sql
-- Add rate limiting related tables

-- Rate limit table (based on IP address)
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  identifier VARCHAR(255) NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API keys table (optional feature)
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key VARCHAR(255) NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  rate_limit INTEGER NOT NULL DEFAULT 1000,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Foreign key constraint
  CONSTRAINT fk_api_keys_user_id 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE
);

-- API key request log table
CREATE TABLE IF NOT EXISTS api_key_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  api_key VARCHAR(255) NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);