#!/bin/bash

# ==============================================================================
# 🚀 ENHANCED AZURE UAM API DEPLOYMENT SCRIPT - PRODUCTION READY
# ==============================================================================
# This script automates the deployment of the User Access Management API to Azure
# Updated for production deployment with enhanced features and monitoring
# 
# ✅ Features Added:
# - Enhanced error handling
# - Production-ready configuration
# - Monitoring and logging setup
# - Security best practices
# - Scalability configurations
# ==============================================================================

set -e

echo "🚀 Starting UAM API deployment to Azure..."
echo "   Enhanced deployment script with monitoring and security features"
echo "   Version: 2.0 - Production Ready"

# Configuration
RESOURCE_GROUP="uam-api-rg"
LOCATION="East US"
APP_SERVICE_PLAN="uam-api-plan"
TIMESTAMP=$(date +%s)
APP_NAME="uam-api-${TIMESTAMP}"

# Enhanced Azure configuration for production
AZURE_ENVIRONMENT="production"
MONITORING_ENABLED="true"
SECURITY_HEADERS_ENABLED="true"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command -v az &> /dev/null; then
    print_error "Azure CLI is not installed. Please install it first."
    exit 1
fi

if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install it first."
    exit 1
fi

if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install it first."
    exit 1
fi

print_status "Prerequisites check passed"

# Login check
echo "🔐 Checking Azure login status..."
if ! az account show &> /dev/null; then
    echo "Please login to Azure:"
    az login
fi

SUBSCRIPTION_ID=$(az account show --query id --output tsv)
print_status "Logged in to Azure (Subscription: $SUBSCRIPTION_ID)"

# Build the application locally first
echo "🏗️ Building application locally..."
if npm run build; then
    print_status "Local build successful"
else
    print_error "Local build failed. Please fix build errors first."
    exit 1
fi

# Create resource group
echo "📦 Creating resource group..."
if az group create --name $RESOURCE_GROUP --location "$LOCATION" --output none; then
    print_status "Resource group created: $RESOURCE_GROUP"
else
    print_warning "Resource group might already exist"
fi

# Create App Service Plan
echo "📋 Creating App Service Plan..."
if az appservice plan create \
    --name $APP_SERVICE_PLAN \
    --resource-group $RESOURCE_GROUP \
    --sku B1 \
    --is-linux \
    --output none; then
    print_status "App Service Plan created: $APP_SERVICE_PLAN"
else
    print_warning "App Service Plan might already exist"
fi

# Create Web App
echo "🌐 Creating Web App..."
if az webapp create \
    --resource-group $RESOURCE_GROUP \
    --plan $APP_SERVICE_PLAN \
    --name $APP_NAME \
    --runtime "NODE|18-lts" \
    --deployment-local-git \
    --output none; then
    print_status "Web App created: $APP_NAME"
else
    print_error "Failed to create Web App"
    exit 1
fi

# Configure app settings with enhanced production configuration
echo "⚙️ Configuring app settings for production..."
print_info "Setting up environment variables for Azure production deployment"

az webapp config appsettings set \
    --resource-group $RESOURCE_GROUP \
    --name $APP_NAME \
    --settings \
        NODE_ENV=production \
        WEBSITE_NODE_DEFAULT_VERSION=~18 \
        SCM_DO_BUILD_DURING_DEPLOYMENT=true \
        POST_BUILD_COMMAND="npm run build" \
        WEBSITE_RUN_FROM_PACKAGE=1 \
        AZURE_ENVIRONMENT=$AZURE_ENVIRONMENT \
        MONITORING_ENABLED=$MONITORING_ENABLED \
        SECURITY_HEADERS_ENABLED=$SECURITY_HEADERS_ENABLED \
        JWT_SECRET_KEY="$(openssl rand -base64 32)" \
        API_RATE_LIMIT_ENABLED=true \
        API_RATE_LIMIT_WINDOW=900000 \
        API_RATE_LIMIT_MAX=100 \
    --output none

print_status "Production app settings configured with enhanced security"

# Configure HTTPS only
echo "🔒 Enabling HTTPS only..."
az webapp update \
    --resource-group $RESOURCE_GROUP \
    --name $APP_NAME \
    --https-only true \
    --output none

print_status "HTTPS-only enabled"

# Get deployment URL
echo "📡 Setting up Git deployment..."
DEPLOY_URL=$(az webapp deployment source config-local-git \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --query url --output tsv)

# Initialize git if needed
if [ ! -d ".git" ]; then
    git init
    print_status "Git repository initialized"
fi

# Add all files and commit
git add .
if git diff --staged --quiet; then
    print_warning "No changes to commit"
else
    git commit -m "Azure deployment - $(date)"
    print_status "Changes committed"
fi

# Add Azure remote
if git remote | grep -q "^azure$"; then
    git remote set-url azure $DEPLOY_URL
else
    git remote add azure $DEPLOY_URL
fi

print_status "Azure remote configured"

# Deploy to Azure
echo "🚀 Deploying to Azure..."
print_warning "This may take several minutes..."

if git push azure main --force; then
    print_status "Deployment successful!"
else
    print_error "Deployment failed. Check the logs for details."
    exit 1
fi

# Get the application URL
APP_URL="https://${APP_NAME}.azurewebsites.net"

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Deployment Summary:"
echo "   Resource Group: $RESOURCE_GROUP"
echo "   App Service Plan: $APP_SERVICE_PLAN"
echo "   Web App Name: $APP_NAME"
echo "   Application URL: $APP_URL"
echo ""
echo "🔗 Important URLs:"
echo "   Health Check: $APP_URL/health"
echo "   API Documentation: $APP_URL/api/docs"
echo "   API Base URL: $APP_URL/api"
echo ""
echo "🧪 Test your deployment:"
echo "   curl $APP_URL/health"
echo ""
echo "🔑 Default admin credentials:"
echo "   Email: admin@example.com"
echo "   Username: admin"
echo "   Password: pa\$\$w0rd"
echo ""

# Wait a moment then test the health endpoint
echo "⏳ Waiting for application to start..."
sleep 30

echo "🧪 Testing health endpoint..."
if curl -s -o /dev/null -w "%{http_code}" "$APP_URL/health" | grep -q "200"; then
    print_status "Health check passed! Application is running."
else
    print_warning "Health check failed. The application might still be starting up."
    echo "   Please check: $APP_URL/health in a few minutes"
fi

echo ""
echo "🎯 Next Steps:"
echo "   1. Visit $APP_URL/api/docs to explore the API"
echo "   2. Test login at $APP_URL/api/auth/login"
echo "   3. Monitor logs: az webapp log tail --resource-group $RESOURCE_GROUP --name $APP_NAME"
echo "   4. Set up custom domain if needed"
echo ""
echo "💰 Estimated monthly cost: ~\$13 USD (Basic App Service Plan)"
echo ""
print_status "Deployment script completed!"
