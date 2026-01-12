# Local variables for Supabase module.

locals {
  # 资源命名规范: 环境名-应用名-资源类型
  
  # Supabase项目命名: stg-todo-project / prd-todo-project
  project_name = "${var.environment}-${var.project_name}-project"
  
  # API密钥资源命名: stg_todo_api_key / prd_todo_api_key
  # 需要将连字符替换为下划线以符合Supabase命名要求
  api_key_name = "${var.environment}_${replace(var.project_name, "-", "_")}_api_key"
  
  # 设置资源命名: stg-todo-settings / prd-todo-settings
  settings_name = "${var.environment}-${var.project_name}-settings"
  
  # 连接池资源命名: stg-todo-pooler / prd-todo-pooler
  pooler_name = "${var.environment}-${var.project_name}-pooler"
  
  # 标准标签
  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
    Module      = "supabase"
  }
}