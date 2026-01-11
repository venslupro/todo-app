# Main Terraform configuration for Todo App infrastructure.
# This file orchestrates the deployment of all infrastructure components.

# Supabase module for database and backend services.
# This should be deployed first as it provides configuration for Cloudflare.
module "supabase" {
  source = "./modules/supabase"
  
  organization_id       = var.supabase_organization_id
  project_name          = local.project_name
  environment           = local.environment
  region                = var.supabase_region
  database_password     = var.supabase_database_password
  web_domain            = local.web_domain
  existing_bucket_name  = var.existing_bucket_name
}

# Cloudflare module for Worker and Pages deployment.
# Depends on Supabase for API URLs and authentication keys.
module "cloudflare" {
  source = "./modules/cloudflare"
  
  account_id         = var.cloudflare_account_id
  project_name       = local.project_name
  environment        = local.environment
  api_domain         = local.api_domain
  web_domain         = local.web_domain
  zone_name          = var.zone_name
  
  # Supabase configuration from the supabase module
  supabase_url             = module.supabase.supabase_url
  supabase_anon_key        = module.supabase.supabase_anon_key
  supabase_service_key     = module.supabase.supabase_service_key
  
  # Dependencies
  depends_on = [module.supabase]
}