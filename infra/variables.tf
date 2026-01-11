# Input variables for infrastructure configuration.
# This file defines all input variables with descriptions and validation.

# Cloudflare configuration variables.
variable "cloudflare_account_id" {
  type        = string
  description = "Cloudflare account ID for resource management."
}

variable "cloudflare_api_token" {
  type        = string
  description = "Cloudflare API token with appropriate permissions."
  sensitive   = true
}

variable "zone_name" {
  type        = string
  description = "Cloudflare zone name for DNS configuration."
  default     = "example.com"
}

# Supabase configuration variables.
variable "supabase_access_token" {
  type        = string
  description = "Supabase access token for API authentication."
  sensitive   = true
}

variable "supabase_region" {
  type        = string
  description = "Supabase deployment region (e.g., us-east-1, eu-central-1)."
  default     = "us-east-1"
}

variable "supabase_plan" {
  type        = string
  description = "Supabase service plan (free, pro, team)."
  default     = "free"
  
  validation {
    condition     = contains(["free", "pro", "team"], var.supabase_plan)
    error_message = "Plan must be free, pro, or team."
  }
}

# Application configuration variables.
variable "project_name" {
  type        = string
  description = "Project name used for resource naming and tagging."
  default     = "todo-api"
}

variable "environment" {
  type        = string
  description = "Deployment environment (production, staging, development)."
  default     = "production"
  
  validation {
    condition     = contains(["production", "staging", "development"], var.environment)
    error_message = "Environment must be production, staging, or development."
  }
}

variable "api_domain" {
  type        = string
  description = "API domain for Worker deployment."
  default     = "api.example.com"
}

variable "web_domain" {
  type        = string
  description = "Web domain for Pages deployment."
  default     = "app.example.com"
}