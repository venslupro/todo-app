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
  value       = var.api_domain != "" ? "https://${var.api_domain}" : "https://${local.worker_name}.${local.account_subdomain}.workers.dev"
}

output "frontend_url" {
  description = "URL of the frontend application."
  value       = var.web_domain != "" ? "https://${var.web_domain}" : "https://${local.pages_name}.pages.dev"
}

output "pages_project_name" {
  description = "Name of the Pages project."
  value       = cloudflare_pages_project.todo_frontend.name
}

output "pages_project_id" {
  description = "ID of the Pages project."
  value       = cloudflare_pages_project.todo_frontend.id
}