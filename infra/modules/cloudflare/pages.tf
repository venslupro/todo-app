# Cloudflare Pages configuration for frontend deployment.

resource "cloudflare_pages_project" "todo_frontend" {
  account_id = var.account_id
  name       = local.pages_name
  
  # Production branch configuration.
  production_branch = "main"
  
  # Build configuration.
  build_config {
    build_command       = "npm run build"
    destination_dir     = "dist"
    root_dir           = "/"
    
    # Environment variables.
    environment_variables = {
      NODE_VERSION = "18"
      API_BASE_URL = "https://${var.api_domain}"
    }
  }
  
  tags = local.tags
}