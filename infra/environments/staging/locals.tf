# Local variables for staging environment.

locals {
  # Environment identifier: stg (staging)
  environment = "stg"
  
  # Application name: todo
  app_name = "todo"
  
  # Base project name: environment-app (modules will add resource type suffix)
  project_name = "${local.environment}-${local.app_name}"
  
  # Standard tags
  tags = {
    Project     = local.app_name
    Environment = local.environment
    ManagedBy   = "terraform"
  }
}