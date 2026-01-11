# Supabase infrastructure configuration for the Todo application.

# Supabase project resource for the Todo application.
resource "supabase_project" "todo_app" {
  organization_id   = var.organization_id
  name              = local.project_name
  database_password = var.database_password
  region            = var.region

  lifecycle {
    ignore_changes = [database_password]
  }
}

# Supabase settings configuration for the project
resource "supabase_settings" "todo_settings" {
  project_ref = supabase_project.todo_app.id

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
  value       = supabase_project.todo_app.id
}

output "supabase_anon_key" {
  description = "Supabase anonymous API key"
  value       = supabase_project.todo_app.id
}

output "supabase_service_key" {
  description = "Supabase service role API key"
  value       = supabase_project.todo_app.id
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