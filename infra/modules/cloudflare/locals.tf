# Local variables for Cloudflare module.

locals {
  # 资源命名规范: 环境名-应用名-资源类型
  
  # Worker资源命名: stg-todo-worker / prd-todo-worker
  worker_name = "${var.environment}-${var.project_name}-worker"
  
  # Pages资源命名: stg-todo-page / prd-todo-page
  pages_name  = "${var.environment}-${var.project_name}-page"
  
  # DNS记录命名
  api_dns_name = "${var.environment}-${var.project_name}-api-dns"
  web_dns_name = "${var.environment}-${var.project_name}-web-dns"
  
  # Worker路由命名
  api_route_name = "${var.environment}-${var.project_name}-api-route"
  
  # 账户子域名 (基于环境)
  account_subdomain = "${var.environment}-${var.project_name}"
  
  # 标准标签
  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
    Module      = "cloudflare"
  }
}