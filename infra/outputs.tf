# Output values for the infrastructure deployment.

output "page_url" {
  description = "URL of the frontend application."
  value       = module.cloudflare.page_url
}

output "worker_url" {
  description = "URL of the Worker API."
  value       = module.cloudflare.worker_url
}

output "supabase_url" {
  description = "API URL of the Supabase project."
  value       = module.supabase.supabase_url
}

output "supabase_anon_key" {
  description = "Anon key for Supabase authentication."
  value       = module.supabase.supabase_anon_key
  sensitive   = true
}

output "supabase_service_key" {
  description = "Service key for Supabase server operations."
  value       = module.supabase.supabase_service_key
  sensitive   = true
}

