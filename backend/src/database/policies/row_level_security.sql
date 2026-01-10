-- database/policies/row_level_security.sql
-- 行级安全策略（如果需要）

-- 启用行级安全
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- TODO表策略
CREATE POLICY "Users can view their own todos" ON todos
  FOR SELECT USING (
    created_by = auth.uid() 
    OR id IN (
      SELECT todo_id FROM todo_shares WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own todos" ON todos
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own todos" ON todos
  FOR UPDATE USING (
    created_by = auth.uid() 
    OR id IN (
      SELECT todo_id FROM todo_shares 
      WHERE user_id = auth.uid() AND permission = 'edit'
    )
  );

CREATE POLICY "Users can delete their own todos" ON todos
  FOR DELETE USING (created_by = auth.uid());