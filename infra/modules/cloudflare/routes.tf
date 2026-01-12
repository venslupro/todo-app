# Cloudflare Worker routes configuration.
# Only create routes if zone is configured (custom domain)

resource "cloudflare_workers_route" "route" {
  count   = var.zone_id != "" ? 1 : 0  # Only create if zone_id is provided (existing zone)
  zone_id = var.zone_id
  pattern = "${var.api_domain}/*"
  
  depends_on = [cloudflare_workers_script.worker, cloudflare_dns_record.api_dns]
}