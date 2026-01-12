# Local variables for staging environment.

locals {
  # 环境标识: stg (staging)
  environment = "stg"
  
  # 应用名称: todo
  app_name = "todo"
  
  # 基础项目名称: 环境名-应用名 (模块内部会添加资源类型后缀)
  project_name = "${local.environment}-${local.app_name}"
  
  # 标准标签
  tags = {
    Project     = local.app_name
    Environment = local.environment
    ManagedBy   = "terraform"
  }
}