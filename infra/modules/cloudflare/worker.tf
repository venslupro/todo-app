# Cloudflare Worker configuration for the Todo application API.

# KV namespace resource for rate limiting and caching.
resource "cloudflare_workers_kv_namespace" "todo_kv" {
  account_id = var.account_id
  title      = local.kv_name
  
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

  # Enable logging for monitoring and debugging.
  logpush = true

  tags = local.tags
}