# 🚀 Deployment Guide - Order Nexus Customer Hub

This guide covers multiple methods to deploy the Order Nexus Customer Hub to Azure. This file is kept local and not pushed to the main repository.

## 📋 Prerequisites

- Azure CLI installed and logged in
- Node.js and npm installed
- Azure subscription with appropriate permissions
- Static Web Apps CLI (optional, for direct deployment)

## 🔧 Setup Commands

### Install Azure CLI (if not already installed)
```bash
# Windows (using winget)
winget install Microsoft.AzureCLI

# Or download from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli
```

### Login to Azure
```bash
az login
```

### Install Static Web Apps CLI (optional)
```bash
npm install -g @azure/static-web-apps-cli
```

## 🎯 Deployment Methods

### Method 1: Azure Static Web Apps CLI (Recommended)

This is the most straightforward method for direct deployment from your local machine.

#### Step 1: Build the Project
```bash
npm run build
```

#### Step 2: Deploy to Static Web Apps
```bash
swa deploy dist --deployment-token YOUR_DEPLOYMENT_TOKEN
```

**Your Current Deployment Token:**
```
fcae4401d8dc1d527ff42b1c63d3eb65dca6493948a17d9a86b40dd6403228a602-8fbed2c3-c950-407d-8847-d858aaac654200f10070b07be50f
```

#### Step 3: Access Your Application
- **URL**: https://red-dune-0b07be50f.2.azurestaticapps.net/
- **Status**: Ready
- **Environment**: Default (production)

### Method 2: Azure Storage Account (Alternative)

This method creates a storage account with static website hosting.

#### Step 1: Create Storage Account
```bash
az storage account create \
  --name govmetricstorage \
  --resource-group GovmetricAI \
  --location "East US 2" \
  --sku Standard_LRS \
  --kind StorageV2
```

#### Step 2: Enable Static Website Hosting
```bash
az storage blob service-properties update \
  --account-name govmetricstorage \
  --static-website \
  --index-document index.html \
  --404-document index.html
```

#### Step 3: Build and Upload
```bash
# Build the project
npm run build

# Upload to storage account
az storage blob upload-batch \
  --account-name govmetricstorage \
  --auth-mode key \
  --source dist \
  --destination '$web'
```

#### Step 4: Get the URL
```bash
az storage account show \
  --name govmetricstorage \
  --resource-group GovmetricAI \
  --query "primaryEndpoints.web" \
  --output tsv
```

**Storage Account URL**: https://govmetricstorage.z20.web.core.windows.net/

### Method 3: GitHub Actions (Automatic)

This method uses the existing GitHub Actions workflow for automatic deployment.

#### Step 1: Push to Main Branch
```bash
git add .
git commit -m "Update application"
git push origin main
```

#### Step 2: Monitor Deployment
- Go to GitHub repository → Actions tab
- Monitor the deployment progress
- Check Azure Portal for status

## 🔄 Quick Deployment Script

Create a `deploy.ps1` (PowerShell) or `deploy.sh` (Bash) script for quick deployments:

### PowerShell Script (deploy.ps1)
```powershell
# Build the project
Write-Host "Building project..." -ForegroundColor Green
npm run build

# Deploy to Static Web Apps
Write-Host "Deploying to Azure Static Web Apps..." -ForegroundColor Green
swa deploy dist --deployment-token fcae4401d8dc1d527ff42b1c63d3eb65dca6493948a17d9a86b40dd6403228a602-8fbed2c3-c950-407d-8847-d858aaac654200f10070b07be50f

Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host "URL: https://red-dune-0b07be50f.2.azurestaticapps.net/" -ForegroundColor Yellow
```

### Bash Script (deploy.sh)
```bash
#!/bin/bash

# Build the project
echo "Building project..."
npm run build

# Deploy to Static Web Apps
echo "Deploying to Azure Static Web Apps..."
swa deploy dist --deployment-token fcae4401d8dc1d527ff42b1c63d3eb65dca6493948a17d9a86b40dd6403228a602-8fbed2c3-c950-407d-8847-d858aaac654200f10070b07be50f

echo "Deployment complete!"
echo "URL: https://red-dune-0b07be50f.2.azurestaticapps.net/"
```

## 📁 Configuration Files

### staticwebapp.config.json
```json
{
  "routes": [
    {
      "route": "/*",
      "rewrite": "/index.html"
    }
  ],
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/images/*.{png,jpg,gif}", "/css/*", "/js/*", "/api/*"]
  }
}
```

### vite.config.ts (Build Configuration)
The Vite configuration includes a custom plugin that automatically copies `staticwebapp.config.json` to the `dist` folder during build.

## 🌐 Application URLs

### Production URLs
- **Static Web Apps**: https://red-dune-0b07be50f.2.azurestaticapps.net/
- **Storage Account**: https://govmetricstorage.z20.web.core.windows.net/

### Development URLs
- **Local Development**: http://localhost:8080
- **Local Preview**: http://localhost:4173 (after `npm run preview`)

## 🔍 Troubleshooting

### Common Issues

#### 1. Configuration Validation Error
**Error**: `Failed to validate staticwebapp.config.json schema`
**Solution**: Ensure `staticwebapp.config.json` uses valid properties:
- Use `rewrite` instead of `serve`
- Remove `statusCode` property
- Follow the official schema: https://aka.ms/swa/config-schema

#### 2. Build Failures
**Error**: Build process fails
**Solution**:
```bash
# Clear cache and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### 3. Deployment Token Issues
**Error**: Invalid deployment token
**Solution**: Get a new token from Azure Portal:
1. Go to your Static Web App
2. Navigate to "Manage deployment tokens"
3. Generate a new token

#### 4. Permission Issues
**Error**: Insufficient permissions
**Solution**: Ensure your Azure account has the required roles:
- Storage Blob Data Contributor
- Static Web Apps Contributor

### Debug Commands

#### Check Azure CLI Status
```bash
az account show
az staticwebapp list --output table
```

#### Check Storage Account Status
```bash
az storage account show --name govmetricstorage --resource-group GovmetricAI
```

#### Check Static Web App Status
```bash
az staticwebapp show --name govmetric-front --resource-group GovmetricAI
```

## 📊 Monitoring and Logs

### Azure Portal Monitoring
1. Go to Azure Portal
2. Navigate to your Static Web App
3. Check "Overview" for status
4. Check "Logs" for any errors

### GitHub Actions Monitoring
1. Go to your GitHub repository
2. Navigate to "Actions" tab
3. Check the latest workflow run
4. Review logs for any issues

## 🔐 Security Considerations

### Environment Variables
- Never commit sensitive data to the repository
- Use Azure Key Vault for production secrets
- Store configuration in Azure Application Settings

### Access Control
- Use Azure AD for authentication
- Implement proper RBAC roles
- Regularly rotate deployment tokens

## 📈 Performance Optimization

### Build Optimization
- The current build includes code splitting
- Consider implementing lazy loading for routes
- Optimize images and assets

### CDN Configuration
- Azure Static Web Apps includes CDN by default
- Consider custom domain with SSL
- Configure caching headers appropriately

## 🎯 Next Steps

### Production Enhancements
1. **Custom Domain**: Configure a custom domain
2. **SSL Certificate**: Ensure HTTPS is enabled
3. **Monitoring**: Set up Application Insights
4. **Backup**: Configure backup strategies

### Development Workflow
1. **Staging Environment**: Set up staging deployment
2. **CI/CD Pipeline**: Enhance GitHub Actions workflow
3. **Testing**: Implement automated testing
4. **Code Quality**: Add linting and formatting checks

---

## 📞 Support

For issues related to:
- **Azure Static Web Apps**: [Azure Documentation](https://docs.microsoft.com/en-us/azure/static-web-apps/)
- **Vite Build**: [Vite Documentation](https://vitejs.dev/)
- **React Application**: [React Documentation](https://reactjs.org/)

---

**Last Updated**: August 15, 2025
**Deployment Method**: Static Web Apps CLI
**Status**: ✅ Production Ready
