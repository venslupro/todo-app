# database/README.md

## 数据库结构说明

### 表结构概述

1. **todos** - 存储TODO项的主要表
2. **todo_shares** - 存储TODO分享关系
3. **media** - 存储媒体文件元数据
4. **rate_limits** - 速率限制记录
5. **api_keys** - API密钥管理（可选）
6. **api_key_requests** - API密钥请求日志

### 部署到Supabase

1. **方法一：使用Supabase Dashboard**
   - 登录Supabase Dashboard
   - 进入SQL编辑器
   - 复制并运行 `database/migrations/001_initial_schema.sql`
   - 运行其他迁移文件

2. **方法二：使用Supabase CLI**
   ```bash
   # 安装Supabase CLI
   npm install -g supabase
   
   # 登录
   supabase login
   
   # 链接项目
   supabase link --project-ref your-project-ref
   
   # 推送迁移
   supabase db push

3. **方法三：使用pgAdmin或psql**
   ```bash
   psql -h your-project.supabase.co \
     -p 5432 \
     -U postgres \
     -d postgres \
     -f database/init.sql