# Local variables for Supabase module.

locals {
  # Project naming convention.
  project_name = "${var.project_name}-${var.environment}"
  
  # Storage bucket configuration (assuming bucket exists in Dashboard)
  existing_bucket_name = var.existing_bucket_name
  
  # Storage configuration
  storage_config = {
    bucket_name = local.existing_bucket_name
    public_url  = "https://${supabase_project.todo_app.id}.supabase.co/storage/v1/object/public/${local.existing_bucket_name}"
    api_url     = "https://${supabase_project.todo_app.id}.supabase.co/storage/v1"
  }
  
  # Standard tags.
  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
    Module      = "supabase"
  }
}