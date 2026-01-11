# Data sources for Cloudflare module.

data "cloudflare_zone" "main" {
  name = var.zone_name
}