# Provider configurations for infrastructure resources.
# This file defines the provider configurations with authentication settings.

# Cloudflare provider configuration for managing Cloudflare resources.
# Credentials can be provided via environment variables or terraform.tfvars.
provider "cloudflare" {
  # Configuration options:
  # - Set via environment variables: CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID
  # - Or via terraform.tfvars: cloudflare_api_token, cloudflare_account_id
  
  # Required permissions for Cloudflare resources:
  # - Account:Workers Scripts:Edit
  # - Account:Workers KV Storage:Edit
  # - Account:Cloudflare Pages:Edit
  # - Zone:Zone:Read (if using custom domains)
  
  # Explicitly set API token and account ID for better reliability
  api_token   = var.cloudflare_api_token
  account_id  = var.cloudflare_account_id
}

# Supabase provider configuration for managing Supabase resources.
# Access token can be provided via environment variable or terraform.tfvars.
provider "supabase" {
  # Configuration options:
  # - Set via environment variable: SUPABASE_ACCESS_TOKEN
  # - Or via terraform.tfvars: supabase_access_token
  access_token = var.supabase_access_token
}