# Data sources for Supabase module.

# Data source to get Supabase project details after creation.
data "supabase_project" "current" {
  id = supabase_project.todo_app.id
  
  depends_on = [supabase_project.todo_app]
}