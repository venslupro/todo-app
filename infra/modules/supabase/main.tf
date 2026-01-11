# Supabase infrastructure configuration for the Todo application.

# Supabase project resource for the Todo application.
resource "supabase_project" "todo_app" {
  name   = local.project_name
  region = var.region
  plan   = var.plan

  database = {
    version = "15"
  }

  # Authentication configuration with frontend domain.
  auth = {
    site_url = "https://${var.web_domain}"
  }

  # Storage configuration for file uploads.
  storage = {
    file_size_limit = 50 # MB
  }

  tags = local.tags
}

# Supabase API configuration to enable required features.
resource "supabase_api" "todo_api" {
  project_id = supabase_project.todo_app.id

  # Enable REST API for standard HTTP requests.
  rest = true

  # Enable Realtime API for WebSocket support.
  realtime = true

  # Enable Storage API for file uploads and management.
  storage = true
}