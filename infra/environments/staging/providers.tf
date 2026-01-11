# Provider configurations for staging environment.

provider "cloudflare" {
  # Configuration via environment variables or terraform.tfvars
}

provider "supabase" {
  access_token = var.supabase_access_token
}