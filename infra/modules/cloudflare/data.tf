# Data sources for Cloudflare module.

# Use existing zone if zone_id is provided, otherwise create new zone
data "cloudflare_zone" "existing" {
  count   = var.zone_id != "" ? 1 : 0
  zone_id = var.zone_id
}

# Validate Cloudflare account access
data "cloudflare_accounts" "available" {
  # This data source validates the API token has access to accounts
}