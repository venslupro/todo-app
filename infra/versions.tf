# Terraform version and provider requirements configuration.
# This file defines the required Terraform version and provider versions.

terraform {
  required_version = ">= 1.0.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
    supabase = {
      source  = "supabase/supabase"
      version = "~> 1.0"
    }
  }

  # Local backend configuration for state storage.
  backend "local" {
    path = "terraform.tfstate"
  }
}