# Main Cloudflare module configuration.
# This file integrates all Cloudflare resources for the Todo application.

# KV namespace for caching and rate limiting.
resource "cloudflare_workers_kv_namespace" "todo_kv" {
  account_id = var.account_id
  title      = local.kv_name
  
  tags = local.tags
}

# Durable Object namespace for WebSocket support.
resource "cloudflare_durable_object_namespace" "todo_websocket" {
  account_id = var.account_id
  name       = "${local.worker_name}-websocket"
  
  tags = local.tags
}

# Primary Worker script for the Todo application API.
resource "cloudflare_worker_script" "todo_api" {
  account_id = var.account_id
  name       = local.worker_name

  # Worker script content loaded from the built distribution.
  content = file(var.worker_script_path)

  # Environment variable bindings for application configuration.
  plain_text_binding {
    name = "ENVIRONMENT"
    text = var.environment
  }

  # KV namespace binding for caching and rate limiting.
  kv_namespace_binding {
    name         = "TODO_KV"
    namespace_id = cloudflare_workers_kv_namespace.todo_kv.id
  }

  # Durable Object binding for WebSocket support.
  durable_object_binding {
    name         = "TODO_WEBSOCKET"
    namespace_id = cloudflare_durable_object_namespace.todo_websocket.id
    class_name   = "TodoWebSocket"
  }

  # Enable logging for monitoring and debugging.
  logpush = true

  # Compatibility settings for modern Worker features
  compatibility_date = "2024-01-01"
  compatibility_flags = ["nodejs_compat"]

  tags = local.tags

  depends_on = [
    cloudflare_workers_kv_namespace.todo_kv,
    cloudflare_durable_object_namespace.todo_websocket
  ]
}

# Cloudflare Pages project for frontend deployment.
resource "cloudflare_pages_project" "todo_frontend" {
  account_id = var.account_id
  name       = local.pages_name

  # Production branch configuration
  production_branch = "main"

  # Deployment configuration
  deployment_configs {
    production {
      compatibility_date = "2024-01-01"
      compatibility_flags = ["nodejs_compat"]
      
      # Environment variables for frontend build
      env_vars = {
        NODE_VERSION = "18"
        API_BASE_URL = "https://${var.api_domain}"
      }
    }
  }

  tags = local.tags
}

# DNS record for API domain
resource "cloudflare_record" "api" {
  zone_id = data.cloudflare_zone.main.id
  name    = var.api_domain
  value   = local.worker_name + ".workers.dev"
  type    = "CNAME"
  proxied = true

  depends_on = [cloudflare_worker_script.todo_api]
}

# DNS record for web domain
resource "cloudflare_record" "web" {
  zone_id = data.cloudflare_zone.main.id
  name    = var.web_domain
  value   = cloudflare_pages_project.todo_frontend.subdomain
  type    = "CNAME"
  proxied = true

  depends_on = [cloudflare_pages_project.todo_frontend]
}

# Worker route for API domain
resource "cloudflare_worker_route" "api" {
  zone_id     = data.cloudflare_zone.main.id
  pattern     = "${var.api_domain}/*"
  script_name = cloudflare_worker_script.todo_api.name

  depends_on = [cloudflare_worker_script.todo_api]
}