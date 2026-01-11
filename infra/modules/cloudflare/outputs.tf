# Output values for Cloudflare module.

output "worker_name" {
  description = "Name of the deployed Worker script."
  value       = cloudflare_workers_script.todo_api.script_name
}

output "worker_id" {
  description = "ID of the deployed Worker script."
  value       = cloudflare_workers_script.todo_api.id
}

output "worker_url" {
  description = "URL of the Worker API."
  value       = "https://${var.api_domain}"
}

output "frontend_url" {
  description = "URL of the frontend application."
  value       = "https://${var.web_domain}"
}

output "kv_namespace_id" {
  description = "ID of the KV namespace for caching."
  value       = cloudflare_workers_kv_namespace.todo_kv.id
}



output "pages_project_name" {
  description = "Name of the Pages project."
  value       = cloudflare_pages_project.todo_frontend.name
}

output "pages_project_id" {
  description = "ID of the Pages project."
  value       = cloudflare_pages_project.todo_frontend.id
}