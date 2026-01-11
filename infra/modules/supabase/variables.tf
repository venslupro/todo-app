# Input variables for Supabase module.

variable "project_name" {
  type        = string
  description = "Project name for resource naming."
}

variable "environment" {
  type        = string
  description = "Deployment environment."
}

variable "region" {
  type        = string
  description = "Supabase deployment region."
  default     = "us-east-1"
}

variable "plan" {
  type        = string
  description = "Supabase service plan."
  default     = "free"
}

variable "web_domain" {
  type        = string
  description = "Web domain for authentication configuration."
}

variable "organization_id" {
  type        = string
  description = "Supabase organization ID for the project."
}

variable "database_password" {
  type        = string
  description = "Database password for the Supabase project."
  sensitive   = true
}