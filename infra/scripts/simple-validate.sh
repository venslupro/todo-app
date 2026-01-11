#!/bin/bash

# Simple Terraform Configuration Validation
# Quick check for basic configuration integrity

echo "🔍 Quick Terraform configuration check..."

# Check if we're in the right directory
if [ ! -f "versions.tf" ]; then
    echo "❌ Not in Terraform directory"
    exit 1
fi

echo "✅ In Terraform directory"

# Quick file existence check
FILES=("versions.tf" "providers.tf" "variables.tf" "locals.tf" "main.tf" "outputs.tf")

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file missing"
        exit 1
    fi
done

# Check file content
for file in "${FILES[@]}"; do
    if [ -s "$file" ]; then
        echo "✅ $file has content"
    else
        echo "❌ $file is empty"
        exit 1
    fi
done

# Check module directories
if [ -d "modules/cloudflare" ] && [ -d "modules/supabase" ]; then
    echo "✅ Module directories exist"
else
    echo "❌ Module directories missing"
    exit 1
fi

# Check environment directory
if [ -d "environments/production" ]; then
    echo "✅ Production environment exists"
else
    echo "❌ Production environment missing"
    exit 1
fi

# Quick Terraform init check
echo ""
echo "🔍 Quick Terraform initialization check..."

if terraform init -backend=false > /dev/null 2>&1; then
    echo "✅ Terraform can initialize"
else
    echo "❌ Terraform initialization failed"
    exit 1
fi

echo ""
echo "✅ Quick validation passed!"
echo "Run './scripts/validate-config.sh' for full validation"