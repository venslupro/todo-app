# Data sources for Cloudflare module.

data "cloudflare_zone" "main" {
  zone_id = var.zone_id
}

# Validate Cloudflare account access
data "cloudflare_accounts" "available" {
  # This data source validates the API token has access to accounts
}