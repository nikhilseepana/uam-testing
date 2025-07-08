# Azure Deployment Guide for UAM API

## Prerequisites
- Azure subscription
- Azure CLI installed (`az --version` to check)
- Git installed
- Node.js 18+ installed locally

## Deployment Options

### Option 1: Azure App Service (Recommended)

#### Step 1: Login to Azure
```bash
az login
```

#### Step 2: Create Resource Group
```bash
az group create --name uam-api-rg --location "East US"
```

#### Step 3: Create App Service Plan
```bash
az appservice plan create \
  --name uam-api-plan \
  --resource-group uam-api-rg \
  --sku B1 \
  --is-linux
```

#### Step 4: Create Web App
```bash
az webapp create \
  --resource-group uam-api-rg \
  --plan uam-api-plan \
  --name uam-api-app-$(date +%s) \
  --runtime "NODE|18-lts" \
  --deployment-local-git
```

#### Step 5: Configure App Settings
```bash
# Get your app name from the previous command
APP_NAME="your-app-name-here"

az webapp config appsettings set \
  --resource-group uam-api-rg \
  --name $APP_NAME \
  --settings \
    NODE_ENV=production \
    WEBSITE_NODE_DEFAULT_VERSION=~18 \
    SCM_DO_BUILD_DURING_DEPLOYMENT=true \
    POST_BUILD_COMMAND="npm run build"
```

#### Step 6: Deploy via Git
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit for Azure deployment"

# Get deployment URL
DEPLOY_URL=$(az webapp deployment source config-local-git \
  --name $APP_NAME \
  --resource-group uam-api-rg \
  --query url --output tsv)

# Add Azure as remote and push
git remote add azure $DEPLOY_URL
git push azure main
```

### Option 2: Azure Container Instances

#### Step 1: Build and Push to Azure Container Registry
```bash
# Create ACR
az acr create \
  --resource-group uam-api-rg \
  --name uamapiacr$(date +%s) \
  --sku Basic

# Login to ACR
az acr login --name uamapiacr$(date +%s)

# Build and push image
docker build -t uam-api .
docker tag uam-api uamapiacr$(date +%s).azurecr.io/uam-api:latest
docker push uamapiacr$(date +%s).azurecr.io/uam-api:latest
```

#### Step 2: Deploy to Container Instance
```bash
az container create \
  --resource-group uam-api-rg \
  --name uam-api-container \
  --image uamapiacr$(date +%s).azurecr.io/uam-api:latest \
  --registry-login-server uamapiacr$(date +%s).azurecr.io \
  --registry-username $(az acr credential show --name uamapiacr$(date +%s) --query username --output tsv) \
  --registry-password $(az acr credential show --name uamapiacr$(date +%s) --query passwords[0].value --output tsv) \
  --dns-name-label uam-api-$(date +%s) \
  --ports 3000
```

### Option 3: One-Click Deployment Script

Run the following script to deploy everything automatically:

```bash
# Make the script executable
chmod +x deploy-azure.sh

# Run the deployment
./deploy-azure.sh
```

## Post-Deployment

### 1. Verify Deployment
- Check the health endpoint: `https://your-app-name.azurewebsites.net/health`
- Access API documentation: `https://your-app-name.azurewebsites.net/api/docs`

### 2. Test API
```bash
# Test login
curl -X POST https://your-app-name.azurewebsites.net/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin@example.com", "password": "pa$$w0rd"}'
```

### 3. Configure Custom Domain (Optional)
```bash
az webapp config hostname add \
  --resource-group uam-api-rg \
  --webapp-name $APP_NAME \
  --hostname your-custom-domain.com
```

## Environment Variables
The following environment variables are automatically configured:
- `NODE_ENV=production`
- `PORT=3000` (or as assigned by Azure)
- `WEBSITE_NODE_DEFAULT_VERSION=~18`

## Monitoring and Logs

### View Application Logs
```bash
az webapp log tail \
  --resource-group uam-api-rg \
  --name $APP_NAME
```

### Enable Application Insights
```bash
az extension add --name application-insights
az monitor app-insights component create \
  --app uam-api-insights \
  --location eastus \
  --resource-group uam-api-rg
```

## Scaling

### Scale Up (Vertical)
```bash
az appservice plan update \
  --name uam-api-plan \
  --resource-group uam-api-rg \
  --sku S1
```

### Scale Out (Horizontal)
```bash
az webapp scale \
  --resource-group uam-api-rg \
  --name $APP_NAME \
  --instance-count 2
```

## Security

### Configure HTTPS Only
```bash
az webapp update \
  --resource-group uam-api-rg \
  --name $APP_NAME \
  --https-only true
```

### Configure Authentication (Optional)
```bash
az webapp auth update \
  --resource-group uam-api-rg \
  --name $APP_NAME \
  --enabled true \
  --action LoginWithAzureActiveDirectory
```

## Troubleshooting

### Common Issues
1. **Build fails**: Check that all dependencies are in `package.json`
2. **App won't start**: Verify `PORT` environment variable usage
3. **Database issues**: Ensure data directory is writable

### Debug Commands
```bash
# Check app status
az webapp show --resource-group uam-api-rg --name $APP_NAME

# View deployment logs
az webapp log deployment show --resource-group uam-api-rg --name $APP_NAME

# SSH into app (if enabled)
az webapp ssh --resource-group uam-api-rg --name $APP_NAME
```

## Costs
- Basic App Service Plan (B1): ~$13/month
- Standard App Service Plan (S1): ~$56/month
- Container Instances: Pay-per-use, typically $1-5/month for light usage

## Support
For issues, check:
1. Application logs in Azure Portal
2. App Service diagnostics
3. Azure Monitor for performance insights
