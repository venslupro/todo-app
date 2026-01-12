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

output "supabase_api_key" {
  description = "API key for Supabase authentication (contains both anon and service keys)."
  value       = module.supabase.supabase_api_key
  sensitive   = true
}

