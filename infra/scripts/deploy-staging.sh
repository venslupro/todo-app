#!/bin/bash

# Staging Deployment Script
# Deploys infrastructure to staging environment

echo "🚀 Deploying to staging environment..."

# Check if we're in the right directory
if [ ! -f "versions.tf" ]; then
    echo "❌ Not in Terraform directory"
    echo "Please run this script from the infra directory"
    exit 1
fi

# Check if staging environment exists
if [ ! -d "environments/staging" ]; then
    echo "❌ Staging environment not found"
    exit 1
fi

# Change to staging directory
cd environments/staging

echo "✅ Working in staging environment"

# Initialize if not already done
if [ ! -d ".terraform" ]; then
    echo "🔧 Initializing Terraform..."
    
    if ! terraform init; then
        echo "❌ Terraform initialization failed"
        exit 1
    fi
    
    echo "✅ Terraform initialized"
fi

# Validate configuration
echo "🔍 Validating configuration..."

if ! terraform validate; then
    echo "❌ Configuration validation failed"
    exit 1
fi

echo "✅ Configuration is valid"

# Generate deployment plan
echo "📋 Generating deployment plan..."

if ! terraform plan -out=staging.tfplan; then
    echo "❌ Plan generation failed"
    exit 1
fi

echo "✅ Deployment plan generated"

# Ask for confirmation before applying
echo ""
echo "⚠️  This will deploy infrastructure to staging environment"
echo ""
read -p "Do you want to proceed with deployment? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Deployment cancelled"
    rm -f staging.tfplan
    exit 0
fi

# Apply the deployment
echo ""
echo "🚀 Applying deployment..."

if terraform apply staging.tfplan; then
    echo "✅ Deployment successful!"
    
    # Show outputs
    echo ""
    echo "📊 Deployment outputs:"
    terraform output
    
    # Clean up
    rm -f staging.tfplan
else
    echo "❌ Deployment failed"
    exit 1
fi

echo ""
echo "🎉 Staging deployment complete!"
echo ""
echo "Infrastructure URLs:"
echo "- Frontend: $(terraform output -raw frontend_url)"
echo "- API: $(terraform output -raw worker_url)"