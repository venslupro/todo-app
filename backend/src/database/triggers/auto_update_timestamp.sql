-- database/triggers/auto_update_timestamp.sql
-- Triggers for automatic timestamp updates

-- TODO table trigger
CREATE TRIGGER trigger_todos_updated_at
  BEFORE UPDATE ON todos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- TODO sharing table trigger
CREATE TRIGGER trigger_todo_shares_updated_at
  BEFORE UPDATE ON todo_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Media files table trigger
CREATE TRIGGER trigger_media_updated_at
  BEFORE UPDATE ON media
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();