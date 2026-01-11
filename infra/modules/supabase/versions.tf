# Terraform version requirements for Supabase module.

terraform {
  required_version = ">= 1.0.0"
  
  required_providers {
    supabase = {
      source  = "supabase/supabase"
      version = "~> 0.1"
    }
  }
}