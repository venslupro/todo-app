# Supabase infrastructure configuration for the Todo application.

# Supabase project resource for the Todo application.
# Only create new project if no existing project ID is provided
resource "supabase_project" "todo_app" {
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
  project_ref = var.existing_project_id != "" ? var.existing_project_id : (length(supabase_project.todo_app) > 0 ? supabase_project.todo_app[0].id : "")
}

# Supabase settings configuration for the project
resource "supabase_settings" "todo_settings" {
  project_ref = local.project_ref

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
}

# Output variables for Cloudflare module
output "supabase_url" {
  description = "Supabase project URL"
  value       = var.existing_project_id != "" ? "https://${var.existing_project_id}.supabase.co" : (length(supabase_project.todo_app) > 0 ? "https://${supabase_project.todo_app[0].id}.supabase.co" : "")
}

output "supabase_anon_key" {
  description = "Supabase anonymous API key"
  value       = ""
}

output "supabase_service_key" {
  description = "Supabase service role API key"
  value       = ""
  sensitive   = true
}

# Storage bucket outputs (for existing bucket)
output "storage_bucket_name" {
  description = "Existing storage bucket name"
  value       = local.existing_bucket_name
}

output "storage_bucket_url" {
  description = "Storage bucket public URL"
  value       = local.storage_config.public_url
}

output "storage_api_url" {
  description = "Storage API URL"
  value       = local.storage_config.api_url
}