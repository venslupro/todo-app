#!/bin/bash

# Terraform Configuration Validation Script
# This script validates the Terraform configuration structure and syntax

echo "🔍 Validating Terraform configuration..."

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    echo "❌ Terraform is not installed"
    exit 1
fi

echo "✅ Terraform is installed"

# Check all required Terraform files exist
REQUIRED_FILES=("versions.tf" "providers.tf" "variables.tf" "locals.tf" "main.tf" "outputs.tf")

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file is missing"
        exit 1
    fi
done

# Check module directories
MODULE_DIRS=("modules/cloudflare" "modules/supabase")

for dir in "${MODULE_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "✅ $dir exists"
        
        # Check module files
        MODULE_FILES=("versions.tf" "variables.tf" "locals.tf")
        for file in "${MODULE_FILES[@]}"; do
            if [ -f "$dir/$file" ]; then
                echo "  ✅ $dir/$file exists"
            else
                echo "  ❌ $dir/$file is missing"
                exit 1
            fi
        done
    else
        echo "❌ $dir is missing"
        exit 1
    fi
done

# Check environment directory
if [ -d "environments/production" ]; then
    echo "✅ environments/production exists"
    
    ENV_FILES=("versions.tf" "providers.tf" "variables.tf" "locals.tf" "main.tf" "outputs.tf")
    for file in "${ENV_FILES[@]}"; do
        if [ -f "environments/production/$file" ]; then
            echo "  ✅ environments/production/$file exists"
        else
            echo "  ❌ environments/production/$file is missing"
            exit 1
        fi
    done
else
    echo "❌ environments/production is missing"
    exit 1
fi

# Validate Terraform syntax
echo ""
echo "🔍 Validating Terraform syntax..."

if terraform validate; then
    echo "✅ Terraform syntax is valid"
else
    echo "❌ Terraform syntax validation failed"
    exit 1
fi

# Format check
echo ""
echo "🔍 Checking Terraform formatting..."

if terraform fmt -check -recursive; then
    echo "✅ Terraform formatting is correct"
else
    echo "❌ Terraform formatting issues found"
    echo "Run 'terraform fmt -recursive' to fix formatting"
    exit 1
fi

# Plan validation
echo ""
echo "🔍 Generating Terraform plan..."

if terraform plan -out=tfplan > /dev/null 2>&1; then
    echo "✅ Terraform plan generated successfully"
    rm -f tfplan
else
    echo "❌ Terraform plan generation failed"
    exit 1
fi

echo ""
echo "🎉 All validations passed!"
echo "The Terraform configuration is ready for deployment."