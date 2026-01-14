-- database/seed/initial_data.sql
-- Initial test data

-- Insert test users (need to create users in Supabase Auth first)
-- Note: User IDs here should match actual user IDs in Supabase Auth

-- Insert test TODOs
INSERT INTO todos (name, description, status, priority, created_by) VALUES
  ('Complete project proposal', 'Write and submit the project proposal by Friday', 'in_progress', 'high', '00000000-0000-0000-0000-000000000001'),
  ('Buy groceries', 'Milk, eggs, bread, and fruits', 'not_started', 'medium', '00000000-0000-0000-0000-000000000001'),
  ('Schedule team meeting', 'Coordinate with team for weekly sync', 'completed', 'low', '00000000-0000-0000-0000-000000000001');

-- Insert test TODO shares
INSERT INTO todo_shares (todo_id, user_id, permission, shared_by) 
SELECT 
  t.id,
  '00000000-0000-0000-0000-000000000002', -- Share to another user
  'edit',
  t.created_by
FROM todos t
WHERE t.name = 'Complete project proposal';

-- Insert test media records
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