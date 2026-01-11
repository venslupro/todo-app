# Local variables for production environment.

locals {
  project_name = "todo-api"
  environment  = "production"
  
  # Standard tags for production resources.
  tags = {
    Project     = local.project_name
    Environment = local.environment
    ManagedBy   = "terraform"
  }
}