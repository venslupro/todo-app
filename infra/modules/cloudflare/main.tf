# Main Cloudflare module configuration.
# This file integrates all Cloudflare resources for the Todo application.

# KV namespace for caching and rate limiting.
# This is an account-level resource and doesn't require a zone
resource "cloudflare_workers_kv_namespace" "todo_kv" {
  account_id = var.account_id
  title      = local.kv_name
}

# Worker script for the API.
# In Cloudflare provider v5.x, we create the Worker resource but defer script upload to Wrangler
# This is an account-level resource and doesn't require a zone
resource "cloudflare_workers_script" "todo_api" {
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
    cloudflare_workers_kv_namespace.todo_kv
  ]
}

# KV namespace binding for Worker
# In Cloudflare provider v5.x, KV bindings are configured within the Worker script resource
# The actual binding will be handled by Wrangler during deployment

# Cloudflare zone creation is currently disabled due to Cloudflare provider v5.15.0 requirements
# Zone creation requires specific account object format and permissions
# For now, we focus on using existing zones (via zone_id) or default Workers domain

# Cloudflare Pages project for frontend deployment.
# This is an account-level resource and doesn't require a zone
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

# DNS record for API domain (using custom domain for Worker)
# Only create if zone is configured (custom domain)
resource "cloudflare_dns_record" "api" {
  count = var.zone_id != "" ? 1 : 0  # Only create if zone_id is provided (existing zone)
  
  zone_id = var.zone_id
  name    = var.api_domain
  type    = "CNAME"
  content = "${local.worker_name}.${data.cloudflare_zone.existing[0].name}"
  proxied = true
  ttl     = 1

  depends_on = [cloudflare_workers_script.todo_api]
}

# DNS record for web domain (Pages deployment)
# Only create if zone is configured (custom domain)
resource "cloudflare_dns_record" "web" {
  count = var.zone_id != "" ? 1 : 0  # Only create if zone_id is provided (existing zone)
  
  zone_id = var.zone_id
  name    = var.web_domain
  type    = "CNAME"
  content = cloudflare_pages_project.todo_frontend.subdomain
  proxied = true
  ttl     = 1

  depends_on = [cloudflare_pages_project.todo_frontend]
}

# Worker route for API domain - route to custom domain
resource "cloudflare_workers_route" "api" {
  count   = var.zone_id != "" ? 1 : 0  # Only create if zone_id is provided (existing zone)
  zone_id = var.zone_id
  pattern = "${var.api_domain}/*"

  depends_on = [
    cloudflare_workers_script.todo_api,
    cloudflare_dns_record.api
  ]
}