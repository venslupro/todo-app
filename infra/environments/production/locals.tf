# Local variables for production environment.

locals {
  # Environment identifier: prd (production)
  environment = "prd"

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