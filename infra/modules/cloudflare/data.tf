# Data sources for Cloudflare module.

# Validate Cloudflare account access
data "cloudflare_accounts" "available" {
  # This data source validates the API token has access to accounts
}

# Validate API token permissions by checking account details
data "cloudflare_account" "current" {
  account_id = var.account_id
}