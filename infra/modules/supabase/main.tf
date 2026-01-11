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