# Main configuration for production environment.

# Cloudflare module for Worker and Pages deployment.
module "cloudflare" {
  source = "../../modules/cloudflare"
  
  account_id         = var.cloudflare_account_id
  project_name       = local.project_name
  environment        = local.environment
  api_domain         = var.api_domain
  web_domain         = var.web_domain
  zone_name          = var.zone_name
  worker_script_path = "${path.module}/../../../dist/index.js"
}

# Supabase module for database and backend services.
module "supabase" {
  source = "../../modules/supabase"
  
  organization_id   = var.supabase_organization_id
  project_name      = local.project_name
  environment       = local.environment
  region            = "us-east-1"
  database_password = var.supabase_database_password
  web_domain        = var.web_domain
}