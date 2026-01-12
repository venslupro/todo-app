# Input variables for staging environment.

variable "cloudflare_account_id" {
  type        = string
  description = "Cloudflare account ID for staging environment."
}

variable "cloudflare_api_token" {
  type        = string
  description = "Cloudflare API token for staging environment."
  sensitive   = true
}

variable "supabase_access_token" {
  type        = string
  description = "Supabase access token for staging environment."
  sensitive   = true
}

variable "supabase_organization_id" {
  type        = string
  description = "Supabase organization ID for staging environment."
}

variable "supabase_database_password" {
  type        = string
  description = "Supabase database password for staging environment."
  sensitive   = true
}

variable "api_domain" {
  type        = string
  description = "API domain for staging environment. Leave empty to use default workers.dev domain."
  default     = ""
}

variable "web_domain" {
  type        = string
  description = "Web domain for staging environment. Leave empty to use default pages.dev domain."
  default     = ""
}

variable "zone_name" {
  type        = string
  description = "Cloudflare zone name for staging environment."
  default     = "todoapp.com"
}