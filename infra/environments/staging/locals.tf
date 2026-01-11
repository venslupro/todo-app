# Local variables for staging environment.

locals {
  project_name = "todo-api"
  environment  = "staging"
  
  # Standard tags for staging resources.
  tags = {
    Project     = local.project_name
    Environment = local.environment
    ManagedBy   = "terraform"
  }
}