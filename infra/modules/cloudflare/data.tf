# Data sources for Cloudflare module.

data "cloudflare_zone" "main" {
  filter = {
    name = var.zone_name
  }
}