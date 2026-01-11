# Output values for Supabase module.

output "project_id" {
  description = "ID of the Supabase project."
  value       = supabase_project.todo_app.id
}

output "api_url" {
  description = "API URL for the Supabase project."
  value       = supabase_project.todo_app.api_url
}

output "anon_key" {
  description = "Anon key for client-side authentication."
  value       = supabase_project.todo_app.anon_key
  sensitive   = true
}

output "service_key" {
  description = "Service key for server-side operations."
  value       = supabase_project.todo_app.service_key
  sensitive   = true
}

output "database_url" {
  description = "Database connection URL."
  value       = "postgresql://postgres:${supabase_project.todo_app.database_password}@db.${supabase_project.todo_app.id}.supabase.co:5432/postgres"
  sensitive   = true
}