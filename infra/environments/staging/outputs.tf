# Output values for staging environment.

output "worker_url" {
  description = "URL of the deployed Worker API."
  value       = "https://${var.api_domain}"
}

output "frontend_url" {
  description = "URL of the deployed frontend application."
  value       = "https://${var.web_domain}"
}

output "supabase_api_url" {
  description = "Supabase API URL for application integration."
  value       = module.supabase.api_url
  sensitive   = true
}

output "supabase_anon_key" {
  description = "Supabase anon key for client-side authentication."
  value       = module.supabase.anon_key
  sensitive   = true
}