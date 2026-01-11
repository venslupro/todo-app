# Cloudflare Worker routes configuration.

resource "cloudflare_worker_route" "api_route" {
  zone_id     = data.cloudflare_zone.main.id
  pattern     = "${var.api_domain}/*"
  script_name = cloudflare_worker_script.todo_api.name
  
  depends_on = [cloudflare_worker_script.todo_api]
}