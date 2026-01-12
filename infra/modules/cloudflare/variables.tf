# Input variables for Cloudflare module.

variable "account_id" {
  type        = string
  description = "Cloudflare account ID."
}

variable "project_name" {
  type        = string
  description = "Project name for resource naming."
}

variable "environment" {
  type        = string
  description = "Deployment environment."
}

variable "api_domain" {
  type        = string
  description = "API domain for Worker deployment. Leave empty to use default workers.dev domain."
  default     = ""
}

variable "web_domain" {
  type        = string
  description = "Web domain for Pages deployment. Leave empty to use default pages.dev domain."
  default     = ""
}

variable "zone_id" {
  type        = string
  description = "Cloudflare zone ID. Leave empty if using default domains."
  default     = ""
}

variable "zone_name" {
  type        = string
  description = "Cloudflare zone name."
  default     = "example.com"
}

# Supabase configuration variables
variable "supabase_url" {
  type        = string
  description = "Supabase project URL"
}

variable "supabase_anon_key" {
  type        = string
  description = "Supabase anonymous API key"
  sensitive   = true
}

variable "supabase_service_key" {
  type        = string
  description = "Supabase service role API key"
  sensitive   = true
}