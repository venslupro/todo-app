# Local variables for Supabase module.

locals {
  # 资源命名规范: 环境名-应用名-资源类型
  
  # Supabase项目命名: stg-todo-project / prd-todo-project
  project_name = "${var.environment}-${var.project_name}-project"
  
  # API密钥资源命名: stg-todo-anon-key / prd-todo-anon-key
  anon_key_name = "${var.environment}-${var.project_name}-anon-key"
  
  # 服务密钥资源命名: stg-todo-service-key / prd-todo-service-key
  service_key_name = "${var.environment}-${var.project_name}-service-key"
  
  # 设置资源命名: stg-todo-settings / prd-todo-settings
  settings_name = "${var.environment}-${var.project_name}-settings"
  
  # 连接池资源命名: stg-todo-pooler / prd-todo-pooler
  pooler_name = "${var.environment}-${var.project_name}-pooler"
  
  # 存储桶配置 (假设桶存在于Dashboard中)
  existing_bucket_name = var.existing_bucket_name
  
  # 存储配置
  storage_config = {
    bucket_name = local.existing_bucket_name
    public_url  = var.existing_project_id != "" ? "https://${var.existing_project_id}.supabase.co/storage/v1/object/public/${local.existing_bucket_name}" : (length(supabase_project.project) > 0 ? "https://${supabase_project.project[0].id}.supabase.co/storage/v1/object/public/${local.existing_bucket_name}" : "")
    api_url     = var.existing_project_id != "" ? "https://${var.existing_project_id}.supabase.co/storage/v1" : (length(supabase_project.project) > 0 ? "https://${supabase_project.project[0].id}.supabase.co/storage/v1" : "")
  }
  
  # 标准标签
  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
    Module      = "supabase"
  }
}