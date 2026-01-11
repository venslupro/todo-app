# Cloudflare Worker routes configuration.

resource "cloudflare_workers_route" "api_route" {
  zone_id     = data.cloudflare_zone.main.id
  pattern     = "${var.api_domain}/*"
  
  depends_on = [cloudflare_workers_script.todo_api]
}