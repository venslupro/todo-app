-- database/seed/initial_data.sql
-- 初始测试数据

-- 插入测试用户（需要先在Supabase Auth中创建用户）
-- 注意：这里的用户ID应该与Supabase Auth中的实际用户ID匹配

-- 插入测试TODO
INSERT INTO todos (name, description, status, priority, created_by) VALUES
  ('Complete project proposal', 'Write and submit the project proposal by Friday', 'in_progress', 'high', '00000000-0000-0000-0000-000000000001'),
  ('Buy groceries', 'Milk, eggs, bread, and fruits', 'not_started', 'medium', '00000000-0000-0000-0000-000000000001'),
  ('Schedule team meeting', 'Coordinate with team for weekly sync', 'completed', 'low', '00000000-0000-0000-0000-000000000001');

-- 插入测试TODO分享
INSERT INTO todo_shares (todo_id, user_id, permission, shared_by) 
SELECT 
  t.id,
  '00000000-0000-0000-0000-000000000002', -- 分享给另一个用户
  'edit',
  t.created_by
FROM todos t
WHERE t.name = 'Complete project proposal';

-- 插入测试媒体记录
INSERT INTO media (todo_id, file_name, file_path, file_size, mime_type, media_type, created_by) 
SELECT 
  t.id,
  'diagram.png',
  'media/' || t.id || '/diagram.png',
  204800,
  'image/png',
  'image',
  t.created_by
FROM todos t
WHERE t.name = 'Complete project proposal'
LIMIT 1;