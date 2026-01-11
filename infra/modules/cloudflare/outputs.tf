# Output values for Cloudflare module.

output "worker_name" {
  description = "Name of the deployed Worker script."
  value       = cloudflare_worker_script.todo_api.name
}

output "worker_id" {
  description = "ID of the deployed Worker script."
  value       = cloudflare_worker_script.todo_api.id
}

output "worker_url" {
  description = "URL of the Worker API."
  value       = "https://${local.api_domain}"
}

output "frontend_url" {
  description = "URL of the frontend application."
  value       = "https://${local.web_domain}"
}

output "kv_namespace_id" {
  description = "ID of the KV namespace for caching."
  value       = cloudflare_workers_kv_namespace.todo_kv.id
}

output "websocket_namespace_id" {
  description = "ID of the Durable Object namespace for WebSocket support."
  value       = cloudflare_durable_object_namespace.todo_websocket.id
}

output "pages_project_name" {
  description = "Name of the Pages project."
  value       = cloudflare_pages_project.todo_frontend.name
}

output "pages_project_id" {
  description = "ID of the Pages project."
  value       = cloudflare_pages_project.todo_frontend.id
}