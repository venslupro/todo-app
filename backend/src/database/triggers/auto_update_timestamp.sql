-- database/triggers/auto_update_timestamp.sql
-- 自动更新时间戳的触发器

-- TODO表触发器
CREATE TRIGGER trigger_todos_updated_at
  BEFORE UPDATE ON todos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- TODO分享表触发器
CREATE TRIGGER trigger_todo_shares_updated_at
  BEFORE UPDATE ON todo_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 媒体文件表触发器
CREATE TRIGGER trigger_media_updated_at
  BEFORE UPDATE ON media
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();