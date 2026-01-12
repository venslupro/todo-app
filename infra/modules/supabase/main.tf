# Supabase infrastructure configuration for the Todo application.

# Supabase project resource for the Todo application.
# Only create new project if no existing project ID is provided
resource "supabase_project" "project" {
  count = var.existing_project_id == "" ? 1 : 0
  
  organization_id   = var.organization_id
  name              = local.project_name
  database_password = var.database_password
  region            = var.region

  lifecycle {
    ignore_changes = [database_password]
  }
}

# Local value for project reference (either created or existing)
locals {
  project_ref = var.existing_project_id != "" ? var.existing_project_id : (length(supabase_project.project) > 0 ? supabase_project.project[0].id : "")
}

# Supabase API key resource for the project
# Supabase automatically creates both anon_key and service_key when creating a project
resource "supabase_apikey" "api_key" {
  project_ref = local.project_ref
  name        = local.api_key_name
  
  # Ensure project is fully initialized before creating API key
  depends_on = [supabase_project.project]
}

# Supabase settings configuration for the project
resource "supabase_settings" "settings" {
  project_ref = local.project_ref
  
  # Ensure project is fully initialized before configuring settings
  depends_on = [supabase_project.project, supabase_apikey.api_key]

  # API configuration
  api = jsonencode({
    db_schema            = "public,storage,graphql_public"
    db_extra_search_path = "public,extensions"
    max_rows             = 1000
  })

  # Authentication configuration
  auth = jsonencode({
    site_url = "https://${var.web_domain}"
  })

  # Database configuration
  database = jsonencode({
    pooler = {
      default_pool_size = var.pooler_default_size
      max_client_conn   = var.pooler_max_connections
    }
  })
}

# Supabase pooler data source for connection pool management
data "supabase_pooler" "pooler" {
  project_ref = local.project_ref
}