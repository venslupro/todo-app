# Main Cloudflare module configuration.
# This file integrates all Cloudflare resources for the Todo application.

# KV namespace for caching and rate limiting.
resource "cloudflare_workers_kv_namespace" "todo_kv" {
  account_id = var.account_id
  title      = local.kv_name
}

# Worker script for the API.
resource "cloudflare_workers_script" "todo_api" {
  account_id  = var.account_id
  script_name = local.worker_name

  # Worker script content loaded from the built distribution.
  content = file(var.worker_script_path)

  # Compatibility settings for modern Worker features
  compatibility_date  = "2024-01-01"
  compatibility_flags = ["nodejs_compat"]

  depends_on = [
    cloudflare_workers_kv_namespace.todo_kv
  ]
}

# Cloudflare Pages project for frontend deployment.
resource "cloudflare_pages_project" "todo_frontend" {
  account_id = var.account_id
  name       = local.pages_name

  # Production branch configuration
  production_branch = "main"

  # Deployment configuration
  deployment_configs = {
    production = {
      compatibility_date  = "2024-01-01"
      compatibility_flags = ["nodejs_compat"]
    }
  }
}

# DNS record for API domain
resource "cloudflare_dns_record" "api" {
  zone_id = data.cloudflare_zone.main.id
  name    = var.api_domain
  content = "${local.worker_name}.workers.dev"
  type    = "CNAME"
  proxied = true
  ttl     = 1

  depends_on = [cloudflare_workers_script.todo_api]
}

# DNS record for web domain
resource "cloudflare_dns_record" "web" {
  zone_id = data.cloudflare_zone.main.id
  name    = var.web_domain
  content = cloudflare_pages_project.todo_frontend.subdomain
  type    = "CNAME"
  proxied = true
  ttl     = 1

  depends_on = [cloudflare_pages_project.todo_frontend]
}

# Worker route for API domain
resource "cloudflare_workers_route" "api" {
  zone_id     = data.cloudflare_zone.main.id
  pattern     = "${var.api_domain}/*"

  depends_on = [cloudflare_workers_script.todo_api]
}