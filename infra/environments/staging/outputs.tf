# Output values for staging environment.

output "worker_url" {
  description = "URL of the deployed Worker API."
  value       = "https://${var.api_domain}"
}

output "frontend_url" {
  description = "URL of the deployed frontend application."
  value       = "https://${var.web_domain}"
}

output "supabase_url" {
  description = "Supabase API URL for application integration."
  value       = module.supabase.supabase_url
  sensitive   = true
}

output "supabase_anon_key" {
  description = "Supabase anon key for client-side authentication."
  value       = module.supabase.supabase_anon_key
  sensitive   = true
}

output "supabase_service_key" {
  description = "Supabase service key for server-side authentication."
  value       = module.supabase.supabase_service_key
  sensitive   = true
}