-- database/migrations/001_initial_schema.sql
-- 初始数据库表结构

-- 启用UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TODO表
CREATE TABLE IF NOT EXISTS todos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  tags TEXT[] DEFAULT '{}',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  parent_id UUID REFERENCES todos(id) ON DELETE SET NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  
  -- 外键约束（引用Supabase auth.users）
  CONSTRAINT fk_todos_created_by 
    FOREIGN KEY (created_by) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE
);

-- TODO分享表
CREATE TABLE IF NOT EXISTS todo_shares (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  todo_id UUID NOT NULL,
  user_id UUID NOT NULL,
  permission VARCHAR(10) NOT NULL DEFAULT 'view' CHECK (permission IN ('view', 'edit')),
  shared_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 唯一约束，防止重复分享
  UNIQUE(todo_id, user_id),
  
  -- 外键约束
  CONSTRAINT fk_todo_shares_todo_id 
    FOREIGN KEY (todo_id) 
    REFERENCES todos(id) 
    ON DELETE CASCADE,
  
  CONSTRAINT fk_todo_shares_user_id 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE,
  
  CONSTRAINT fk_todo_shares_shared_by 
    FOREIGN KEY (shared_by) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE
);

-- 媒体文件表
CREATE TABLE IF NOT EXISTS media (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  todo_id UUID NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('image', 'video')),
  duration INTEGER, -- 视频时长（秒）
  width INTEGER,
  height INTEGER,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 外键约束
  CONSTRAINT fk_media_todo_id 
    FOREIGN KEY (todo_id) 
    REFERENCES todos(id) 
    ON DELETE CASCADE,
  
  CONSTRAINT fk_media_created_by 
    FOREIGN KEY (created_by) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE
);

-- 为Supabase Storage创建存储桶策略
COMMENT ON TABLE media IS 'Stores metadata for media files uploaded to Supabase Storage';