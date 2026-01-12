# Output values for Cloudflare module.

output "worker_name" {
  description = "Name of the deployed Worker script."
  value       = cloudflare_workers_script.api.script_name
}

output "worker_id" {
  description = "ID of the deployed Worker script."
  value       = cloudflare_workers_script.api.id
}

output "worker_url" {
  description = "URL of the Worker API."
  value       = "https://${local.api_domain_final}"
}

output "worker_default_url" {
  description = "Default URL of the Worker API (workers.dev domain)."
  value       = "https://${local.worker_default_domain}"
}

output "frontend_url" {
  description = "URL of the frontend application."
  value       = "https://${local.web_domain_final}"
}

output "frontend_default_url" {
  description = "Default URL of the frontend application (pages.dev domain)."
  value       = "https://${local.pages_default_domain}"
}

output "pages_project_name" {
  description = "Name of the Pages project."
  value       = cloudflare_pages_project.frontend.name
}

output "pages_project_id" {
  description = "ID of the Pages project."
  value       = cloudflare_pages_project.frontend.id
}