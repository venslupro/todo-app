# Output values for Supabase module.

output "project_id" {
  description = "ID of the Supabase project."
  value       = data.supabase_project.current.id
}

output "api_url" {
  description = "API URL for the Supabase project."
  value       = data.supabase_project.current.api_url
}

output "anon_key" {
  description = "Anon key for client-side authentication."
  value       = data.supabase_project.current.anon_key
  sensitive   = true
}

output "service_key" {
  description = "Service key for server-side operations."
  value       = data.supabase_project.current.service_key
  sensitive   = true
}

output "database_url" {
  description = "Database connection URL."
  value       = "postgresql://postgres:${data.supabase_project.current.database_password}@db.${data.supabase_project.current.id}.supabase.co:5432/postgres"
  sensitive   = true
}