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
  description = "API domain for Worker deployment."
}

variable "web_domain" {
  type        = string
  description = "Web domain for Pages deployment."
}

variable "zone_name" {
  type        = string
  description = "Cloudflare zone name."
  default     = "example.com"
}

variable "worker_script_path" {
  type        = string
  description = "Path to the compiled Worker script."
  default     = "../dist/index.js"
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