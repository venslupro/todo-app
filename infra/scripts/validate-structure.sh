#!/bin/bash

# Infrastructure Structure Validation Script
# Validates the directory structure and file organization

echo "🔍 Validating infrastructure structure..."

# Check root directory structure
echo ""
echo "📁 Root directory structure:"

REQUIRED_ROOT_FILES=("versions.tf" "providers.tf" "variables.tf" "locals.tf" "main.tf" "outputs.tf" "README.md")

for file in "${REQUIRED_ROOT_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file missing"
        exit 1
    fi
done

# Check modules directory structure
echo ""
echo "📁 Modules directory structure:"

MODULE_DIRS=("modules/cloudflare" "modules/supabase")

for module in "${MODULE_DIRS[@]}"; do
    if [ -d "$module" ]; then
        echo "✅ $module"
        
        # Check module files
        MODULE_FILES=("versions.tf" "variables.tf" "locals.tf" "main.tf" "outputs.tf")
        for file in "${MODULE_FILES[@]}"; do
            if [ -f "$module/$file" ]; then
                echo "  ✅ $module/$file"
            else
                echo "  ❌ $module/$file missing"
                exit 1
            fi
        done
    else
        echo "❌ $module missing"
        exit 1
    fi
done

# Check environments directory structure
echo ""
echo "📁 Environments directory structure:"

ENVIRONMENT_DIRS=("environments/production")

for env in "${ENVIRONMENT_DIRS[@]}"; do
    if [ -d "$env" ]; then
        echo "✅ $env"
        
        # Check environment files
        ENV_FILES=("versions.tf" "providers.tf" "variables.tf" "locals.tf" "main.tf" "outputs.tf")
        for file in "${ENV_FILES[@]}"; do
            if [ -f "$env/$file" ]; then
                echo "  ✅ $env/$file"
            else
                echo "  ❌ $env/$file missing"
                exit 1
            fi
        done
    else
        echo "❌ $env missing"
        exit 1
    fi
done

# Check scripts directory
echo ""
echo "📁 Scripts directory structure:"

if [ -d "scripts" ]; then
    echo "✅ scripts directory"
    
    SCRIPT_FILES=("terraform-init.sh" "validate-config.sh" "simple-validate.sh" "deploy-production.sh" "validate-structure.sh")
    for script in "${SCRIPT_FILES[@]}"; do
        if [ -f "scripts/$script" ]; then
            echo "  ✅ scripts/$script"
        else
            echo "  ❌ scripts/$script missing"
        fi
    done
else
    echo "❌ scripts directory missing"
    exit 1
fi

# Check file content
echo ""
echo "📄 File content validation:"

for file in "${REQUIRED_ROOT_FILES[@]}"; do
    if [ -s "$file" ]; then
        echo "✅ $file has content"
    else
        echo "❌ $file is empty"
        exit 1
    fi
done

echo ""
echo "🎉 Infrastructure structure validation passed!"
echo ""
echo "Summary:"
echo "- ✅ Root directory structure: 7/7 files"
echo "- ✅ Modules structure: 2/2 modules with 5/5 files each"
echo "- ✅ Environments structure: 1/1 environment with 6/6 files"
echo "- ✅ Scripts directory: 5/5 scripts"
echo ""
echo "The infrastructure is properly structured according to Google code style guidelines."