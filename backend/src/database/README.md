# database/README.md

## Database Structure Documentation

### Table Structure Overview

1. **todos** - Main table for storing TODO items
2. **todo_shares** - Stores TODO sharing relationships
3. **media** - Stores media file metadata
4. **rate_limits** - Rate limiting records
5. **api_keys** - API key management (optional)
6. **api_key_requests** - API key request logs

### Deployment to Supabase

1. **Method 1: Using Supabase Dashboard**
   - Log in to Supabase Dashboard
   - Go to SQL Editor
   - Copy and run `database/migrations/001_initial_schema.sql`
   - Run other migration files

2. **Method 2: Using Supabase CLI**
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Login
   supabase login
   
   # Link project
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