# Main configuration for staging environment.

# Supabase module for database and backend services.
# This should be deployed first as it provides configuration for Cloudflare.
module "supabase" {
  source = "../../modules/supabase"
  
  organization_id   = var.supabase_organization_id
  project_name      = local.project_name
  environment       = local.environment
  region            = "ap-southeast-1"  # Different region for staging
  database_password = var.supabase_database_password
  web_domain        = var.web_domain
}

# Cloudflare module for Worker and Pages deployment.
# Depends on Supabase for API URLs and authentication keys.
module "cloudflare" {
  source = "../../modules/cloudflare"
  
  account_id         = var.cloudflare_account_id
  project_name       = local.project_name
  environment        = local.environment
  api_domain         = var.api_domain
  web_domain         = var.web_domain
  zone_name          = var.zone_name
  
  # Supabase configuration from the supabase module
  supabase_url         = module.supabase.supabase_url
  supabase_anon_key    = module.supabase.supabase_anon_key
  supabase_service_key = module.supabase.supabase_service_key
  
  # Dependencies
  depends_on = [module.supabase]
}