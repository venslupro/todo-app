# Terraform version and provider requirements configuration.
# This file defines the required Terraform version and provider versions.

terraform {
  required_version = ">= 1.0.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
    supabase = {
      source  = "supabase/supabase"
      version = "~> 1.0"
    }
  }

  # Remote backend configuration for state storage.
  backend "remote" {
    organization = "your-org-name"

    workspaces {
      name = "todo-api-production"
    }
  }
}