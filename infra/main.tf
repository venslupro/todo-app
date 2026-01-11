# Main Terraform configuration for Todo App infrastructure.
# This file orchestrates the deployment of all infrastructure components.

# Supabase module for database and backend services.
# This should be deployed first as it provides configuration for Cloudflare.
module "supabase" {
  source = "./modules/supabase"
  
  project_name = local.project_name
  environment  = local.environment
  region       = var.supabase_region
  plan         = var.supabase_plan
  web_domain   = local.web_domain
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
  worker_script_path = "../dist/index.js"
  
  # Dependencies
  depends_on = [module.supabase]
}