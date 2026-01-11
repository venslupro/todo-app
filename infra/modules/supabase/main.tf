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

# Supabase storage bucket for media files
resource "supabase_storage_bucket" "media" {
  project_ref = supabase_project.todo_app.id
  name        = "media"
  public      = true
  file_size_limit = 52428800  # 50MB
}

# Output variables for Cloudflare module
output "supabase_url" {
  description = "Supabase project URL"
  value       = supabase_project.todo_app.endpoint
}

output "supabase_anon_key" {
  description = "Supabase anonymous API key"
  value       = supabase_project.todo_app.anon_key
}

output "supabase_service_key" {
  description = "Supabase service role API key"
  value       = supabase_project.todo_app.service_key
  sensitive   = true
}