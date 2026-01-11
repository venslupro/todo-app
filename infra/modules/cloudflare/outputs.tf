# Output values for Cloudflare module.

output "worker_name" {
  description = "Name of the deployed Worker script."
  value       = length(cloudflare_workers_script.todo_api) > 0 ? cloudflare_workers_script.todo_api[0].script_name : ""
}

output "worker_id" {
  description = "ID of the deployed Worker script."
  value       = length(cloudflare_workers_script.todo_api) > 0 ? cloudflare_workers_script.todo_api[0].id : ""
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
  value       = length(cloudflare_workers_kv_namespace.todo_kv) > 0 ? cloudflare_workers_kv_namespace.todo_kv[0].id : ""
}



output "pages_project_name" {
  description = "Name of the Pages project."
  value       = length(cloudflare_pages_project.todo_frontend) > 0 ? cloudflare_pages_project.todo_frontend[0].name : ""
}

output "pages_project_id" {
  description = "ID of the Pages project."
  value       = length(cloudflare_pages_project.todo_frontend) > 0 ? cloudflare_pages_project.todo_frontend[0].id : ""
}