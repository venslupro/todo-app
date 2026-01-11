#!/bin/bash

# Terraform Initialization Script
# Handles Terraform initialization with proper configuration

echo "🚀 Initializing Terraform..."

# Check if we're in the right directory
if [ ! -f "versions.tf" ]; then
    echo "❌ Not in Terraform directory"
    echo "Please run this script from the infra directory"
    exit 1
fi

# Check for required environment variables
REQUIRED_VARS=("CLOUDFLARE_API_TOKEN" "CLOUDFLARE_ACCOUNT_ID" "SUPABASE_ACCESS_TOKEN")

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Environment variable $var is not set"
        echo "Please set the following environment variables:"
        echo "- CLOUDFLARE_API_TOKEN"
        echo "- CLOUDFLARE_ACCOUNT_ID" 
        echo "- SUPABASE_ACCESS_TOKEN"
        exit 1
    fi
done

echo "✅ Required environment variables are set"

# Check if terraform.tfvars exists
if [ ! -f "terraform.tfvars" ]; then
    echo "⚠️  terraform.tfvars not found"
    echo "Creating terraform.tfvars from example..."
    
    if [ -f "terraform.tfvars.example" ]; then
        cp terraform.tfvars.example terraform.tfvars
        echo "✅ Created terraform.tfvars"
        echo "⚠️  Please edit terraform.tfvars with your actual values"
    else
        echo "❌ terraform.tfvars.example not found"
        exit 1
    fi
else
    echo "✅ terraform.tfvars exists"
fi

# Initialize Terraform
echo ""
echo "🔧 Running terraform init..."

if terraform init; then
    echo "✅ Terraform initialized successfully"
else
    echo "❌ Terraform initialization failed"
    exit 1
fi

# Validate configuration
echo ""
echo "🔍 Validating configuration..."

if terraform validate; then
    echo "✅ Configuration is valid"
else
    echo "❌ Configuration validation failed"
    exit 1
fi

# Format code
echo ""
echo "🎨 Formatting Terraform code..."

if terraform fmt -recursive; then
    echo "✅ Code formatted successfully"
else
    echo "❌ Code formatting failed"
    exit 1
fi

echo ""
echo "🎉 Terraform initialization complete!"
echo ""
echo "Next steps:"
echo "1. Review terraform.tfvars configuration"
echo "2. Run 'terraform plan' to see deployment plan"
echo "3. Run 'terraform apply' to deploy infrastructure"