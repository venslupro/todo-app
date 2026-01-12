# Input variables for production environment.

variable "cloudflare_account_id" {
  type        = string
  description = "Cloudflare account ID for production environment."
}

variable "cloudflare_api_token" {
  type        = string
  description = "Cloudflare API token for production environment."
  sensitive   = true
}

variable "supabase_access_token" {
  type        = string
  description = "Supabase access token for production environment."
  sensitive   = true
}

variable "api_domain" {
  type        = string
  description = "API domain for production environment. Leave empty to use default workers.dev domain."
  default     = ""
}

variable "web_domain" {
  type        = string
  description = "Web domain for production environment. Leave empty to use default pages.dev domain."
  default     = ""
}

variable "zone_name" {
  type        = string
  description = "Cloudflare zone name for production environment. Leave empty if using default domains."
  default     = ""
}

variable "supabase_organization_id" {
  type        = string
  description = "Supabase organization ID for production environment."
}

variable "supabase_database_password" {
  type        = string
  description = "Database password for Supabase project in production."
  sensitive   = true
}