# Main Cloudflare module configuration.
# This file integrates all Cloudflare resources for the Todo application.

# KV namespace for caching and rate limiting.
# Only create if zone exists and API token has proper permissions
resource "cloudflare_workers_kv_namespace" "todo_kv" {
  count = length(data.cloudflare_zone.main.*.id) > 0 ? 1 : 0
  
  account_id = var.account_id
  title      = local.kv_name
}

# Worker script for the API.
# In Cloudflare provider v5.x, we create the Worker resource but defer script upload to Wrangler
resource "cloudflare_workers_script" "todo_api" {
  count = length(data.cloudflare_zone.main.*.id) > 0 ? 1 : 0
  
  account_id  = var.account_id
  script_name = local.worker_name

  # Use a minimal placeholder script - actual deployment via Wrangler
  content = <<-EOT
    export default {
      async fetch(request, env, ctx) {
        return new Response('Todo API Worker - Deploy with Wrangler for full functionality', {
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    }
  EOT

  # Compatibility settings for modern Worker features
  compatibility_date  = "2024-01-01"
  compatibility_flags = ["nodejs_compat"]

  depends_on = [
    cloudflare_workers_kv_namespace.todo_kv[0]
  ]
}

# KV namespace binding for Worker
# In Cloudflare provider v5.x, KV bindings are configured within the Worker script resource
# The actual binding will be handled by Wrangler during deployment

# Cloudflare Pages project for frontend deployment.
resource "cloudflare_pages_project" "todo_frontend" {
  count = length(data.cloudflare_zone.main.*.id) > 0 ? 1 : 0
  
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

# DNS record for API domain (using custom domain for Worker)
resource "cloudflare_dns_record" "api" {
  zone_id = data.cloudflare_zone.main.id
  name    = var.api_domain
  type    = "CNAME"
  content = "${local.worker_name}.${data.cloudflare_zone.main.name}"
  proxied = true
  ttl     = 1

  depends_on = [cloudflare_workers_script.todo_api]
}

# DNS record for web domain (Pages deployment)
resource "cloudflare_dns_record" "web" {
  zone_id = data.cloudflare_zone.main.id
  name    = var.web_domain
  type    = "CNAME"
  content = length(cloudflare_pages_project.todo_frontend) > 0 ? cloudflare_pages_project.todo_frontend[0].subdomain : ""
  proxied = true
  ttl     = 1

  depends_on = [cloudflare_pages_project.todo_frontend]
}

# Worker route for API domain - route to custom domain
resource "cloudflare_workers_route" "api" {
  zone_id     = data.cloudflare_zone.main.id
  pattern     = "${var.api_domain}/*"

  depends_on = [
    cloudflare_workers_script.todo_api,
    cloudflare_dns_record.api
  ]
}