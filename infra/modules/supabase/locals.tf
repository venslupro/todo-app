# Local variables for Supabase module.

locals {
  # Resource naming convention: environment-name-app-name-resource-type
  
  # Supabase project naming: stg-todo-project / prd-todo-project
  project_name = "${var.environment}-${var.project_name}-project"
  
  # API key resource naming: stg_todo_api_key / prd_todo_api_key
  # Need to replace hyphens with underscores to comply with Supabase naming requirements
  api_key_name = "${var.environment}_${replace(var.project_name, "-", "_")}_api_key"
  
  # Settings resource naming: stg-todo-settings / prd-todo-settings
  settings_name = "${var.environment}-${var.project_name}-settings"
  
  # Connection pool resource naming: stg-todo-pooler / prd-todo-pooler
  pooler_name = "${var.environment}-${var.project_name}-pooler"
  
  # Standard tags
  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
    Module      = "supabase"
  }
}