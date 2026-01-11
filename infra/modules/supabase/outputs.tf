# Output values for Supabase module.

output "project_id" {
  description = "ID of the Supabase project."
  value       = var.existing_project_id != "" ? var.existing_project_id : (length(supabase_project.todo_app) > 0 ? supabase_project.todo_app[0].id : "")
}

output "api_url" {
  description = "API URL for the Supabase project."
  value       = var.existing_project_id != "" ? "https://${var.existing_project_id}.supabase.co" : (length(supabase_project.todo_app) > 0 ? "https://${supabase_project.todo_app[0].id}.supabase.co" : "")
}

output "anon_key" {
  description = "Anon key for client-side authentication."
  value       = ""
  sensitive   = true
}

output "service_key" {
  description = "Service key for server-side operations."
  value       = ""
  sensitive   = true
}

output "database_url" {
  description = "Database connection URL."
  value       = var.existing_project_id != "" ? "postgresql://postgres:${var.database_password}@db.${var.existing_project_id}.supabase.co:5432/postgres" : (length(supabase_project.todo_app) > 0 ? "postgresql://postgres:${supabase_project.todo_app[0].database_password}@db.${supabase_project.todo_app[0].id}.supabase.co:5432/postgres" : "")
  sensitive   = true
}