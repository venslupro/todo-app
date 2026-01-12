# Output variables for Cloudflare module
output "supabase_url" {
  description = "Supabase project URL"
  value       = var.existing_project_id != "" ? "https://${var.existing_project_id}.supabase.co" : (length(supabase_project.project) > 0 ? "https://${supabase_project.project[0].id}.supabase.co" : "")
}

output "supabase_anon_key" {
  description = "Supabase anonymous API key"
  value       = supabase_apikey.anon_key.api_key
  sensitive   = true
}

output "supabase_service_key" {
  description = "Supabase service role API key"
  value       = supabase_apikey.service_key.api_key
  sensitive   = true
}

# Pooler configuration outputs (commented out until proper data source is implemented)
# output "pooler_connection_string" {
#   description = "Database connection string for the pooler"
#   value       = ""
#   sensitive   = true
# }

# output "pooler_max_connections" {
#   description = "Maximum number of connections in the pool"
#   value       = 0
# }

# output "pooler_default_pool_size" {
#   description = "Default pool size configuration"
#   value       = ""
# }

# Storage bucket outputs (for existing bucket)
output "storage_bucket_name" {
  description = "Existing storage bucket name"
  value       = local.existing_bucket_name
}

output "storage_bucket_url" {
  description = "Storage bucket public URL"
  value       = local.storage_config.public_url
}

output "storage_api_url" {
  description = "Storage API URL"
  value       = local.storage_config.api_url
}

# Project information outputs
output "project_id" {
  description = "Supabase project ID"
  value       = local.project_ref
}

output "project_name" {
  description = "Supabase project name"
  value       = local.project_name
}

output "organization_id" {
  description = "Supabase organization ID"
  value       = var.organization_id
}