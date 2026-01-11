# Output values for the infrastructure deployment.

output "frontend_url" {
  description = "URL of the frontend application."
  value       = module.cloudflare.frontend_url
}

output "worker_url" {
  description = "URL of the Worker API."
  value       = module.cloudflare.worker_url
}

output "supabase_api_url" {
  description = "API URL of the Supabase project."
  value       = module.supabase.api_url
}

output "supabase_project_id" {
  description = "ID of the Supabase project."
  value       = module.supabase.project_id
}

output "supabase_anon_key" {
  description = "Anon key for Supabase authentication."
  value       = module.supabase.anon_key
  sensitive   = true
}

output "supabase_service_key" {
  description = "Service key for Supabase server operations."
  value       = module.supabase.service_key
  sensitive   = true
}

output "supabase_database_url" {
  description = "Database connection URL for Supabase."
  value       = module.supabase.database_url
  sensitive   = true
}

output "websocket_namespace_id" {
  description = "ID of the Durable Object namespace for WebSocket support."
  value       = module.cloudflare.websocket_namespace_id
}

output "kv_namespace_id" {
  description = "ID of the KV namespace for caching and rate limiting."
  value       = module.cloudflare.kv_namespace_id
}