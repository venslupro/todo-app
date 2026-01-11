# Local variables for Supabase module.

locals {
  # Project naming convention.
  project_name = "${var.project_name}-${var.environment}"
  
  # Storage bucket configuration (assuming bucket exists in Dashboard)
  existing_bucket_name = var.existing_bucket_name
  
  # Storage configuration
  storage_config = {
    bucket_name = local.existing_bucket_name
    public_url  = var.existing_project_id != "" ? "https://${var.existing_project_id}.supabase.co/storage/v1/object/public/${local.existing_bucket_name}" : (length(supabase_project.todo_app) > 0 ? "https://${supabase_project.todo_app[0].id}.supabase.co/storage/v1/object/public/${local.existing_bucket_name}" : "")
    api_url     = var.existing_project_id != "" ? "https://${var.existing_project_id}.supabase.co/storage/v1" : (length(supabase_project.todo_app) > 0 ? "https://${supabase_project.todo_app[0].id}.supabase.co/storage/v1" : "")
  }
  
  # Standard tags.
  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
    Module      = "supabase"
  }
}