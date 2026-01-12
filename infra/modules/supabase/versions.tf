# Terraform version and provider requirements for Supabase module.

terraform {
  required_version = ">= 1.0.0"

  required_providers {
    supabase = {
      source  = "supabase/supabase"
      version = "~> 1.0"
    }
  }
}