# Azure Web App Deployment Guide

This guide explains how to deploy your React application to Azure Web App using GitHub Actions.

## Prerequisites

1. **Azure Account**: You need an active Azure subscription
2. **Azure Web App**: Create a Web App in Azure Portal
3. **GitHub Repository**: Your code should be in a GitHub repository
4. **GitHub Secrets**: Set up secrets for Azure credentials

## Step 1: Create Azure Web App

### Option A: Using Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource"
3. Search for "Web App" and select it
4. Fill in the required information:
   - **Resource Group**: Create new or use existing
   - **Name**: Your app name (e.g., `order-nexus-customer-hub`)
   - **Publish**: Code
   - **Runtime stack**: Node 18 LTS
   - **Operating System**: Linux (recommended for Node.js apps)
   - **Region**: Choose closest to your users
   - **App Service Plan**: Choose appropriate plan (Free tier available)
5. Click "Review + create" then "Create"

### Option B: Using Azure CLI

```bash
# Login to Azure
az login

# Create resource group
az group create --name myResourceGroup --location eastus

# Create App Service plan
az appservice plan create --name myAppServicePlan --resource-group myResourceGroup --sku B1 --is-linux

# Create Web App
az webapp create --resource-group myResourceGroup --plan myAppServicePlan --name your-app-name --runtime "NODE|18-lts"
```

## Step 2: Get Publish Profile

1. Go to your Azure Web App in the Azure Portal
2. Click "Get publish profile" in the Overview section
3. Download the `.PublishSettings` file
4. Open the file and copy the `publishUrl`, `userName`, and `userPWD` values

## Step 3: Configure GitHub Secrets

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add the following secrets:

### Required Secrets:

```
AZURE_WEBAPP_PUBLISH_PROFILE=<content-of-publish-profile-file>
VITE_API_BASE_URL=https://govmetricai-h0h4crd6a6gregbm.eastus-01.azurewebsites.net
```

### Optional Secrets (for advanced scenarios):

```
AZURE_SUBSCRIPTION_ID=your-subscription-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
AZURE_TENANT_ID=your-tenant-id
```

## Step 4: Configure the Workflow

1. Update the workflow file `.github/workflows/azure-static-deploy.yml`
2. Change the `AZURE_WEBAPP_NAME` environment variable to match your Azure Web App name:

```yaml
env:
  AZURE_WEBAPP_NAME: your-actual-app-name  # Replace with your Azure Web App name
```

## Step 5: Deploy

1. Commit and push your changes to the main branch
2. Go to the Actions tab in your GitHub repository
3. Monitor the deployment progress
4. Once complete, your app will be available at: `https://your-app-name.azurewebsites.net`

## Configuration Files

### web.config (Auto-generated)

The workflow automatically creates a `web.config` file with:

- **URL Rewriting**: Handles React Router routes
- **MIME Types**: Proper file type handling
- **Security Headers**: XSS protection, content type options, etc.

### Environment Variables

Your application uses these environment variables:

- `VITE_API_BASE_URL`: Your API base URL

## Customization

### Adding Custom Environment Variables

1. Add them to your GitHub secrets
2. Update the workflow file:

```yaml
- name: Build application
  run: npm run build
  env:
    VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
    VITE_OTHER_VAR: ${{ secrets.VITE_OTHER_VAR }}
```

### Custom Build Commands

Modify the workflow to add custom build steps:

```yaml
- name: Build application
  run: |
    npm run build
    # Add additional build steps here
```

### Custom Domain

1. Go to your Azure Web App → Custom domains
2. Add your custom domain
3. Configure DNS records as instructed

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check the Actions tab for detailed logs
   - Verify all secrets are properly set
   - Test build locally with `npm run build`

2. **Deployment Failures**
   - Verify the publish profile is correct
   - Check Azure Web App name matches
   - Ensure Web App is running and accessible

3. **Routing Issues**
   - The `web.config` file handles React Router
   - Verify the rewrite rules are working
   - Check browser console for errors

### Debugging Steps

1. **Check GitHub Actions Logs**
   - Go to Actions tab in your repository
   - Click on the failed workflow
   - Review each step's logs

2. **Test Locally**
   ```bash
   npm run build
   # Check if dist/ folder is created properly
   ```

3. **Verify Azure Web App**
   - Check if the Web App is running
   - Verify the deployment slot is active
   - Check application logs in Azure Portal

## Security Considerations

1. **Secrets Management**
   - Never commit secrets to your repository
   - Use GitHub secrets for all sensitive data
   - Rotate publish profiles regularly

2. **Environment Variables**
   - Use different values for different environments
   - Keep production secrets secure
   - Use Azure Key Vault for sensitive data

3. **HTTPS**
   - Azure Web Apps provide HTTPS by default
   - Configure custom domains with SSL certificates

## Cost Optimization

1. **App Service Plans**
   - Start with Free tier for development
   - Scale up based on traffic needs
   - Use Basic or Standard plans for production

2. **Resource Management**
   - Monitor usage in Azure Portal
   - Set up alerts for cost thresholds
   - Use Azure Cost Management

## Monitoring and Logging

1. **Application Insights**
   - Enable Application Insights in your Web App
   - Monitor performance and errors
   - Set up alerts for issues

2. **Azure Monitor**
   - Monitor Web App metrics
   - Set up diagnostic settings
   - Configure log analytics

## Support

If you encounter issues:

1. Check the [Azure Web Apps documentation](https://docs.microsoft.com/en-us/azure/app-service/)
2. Review [GitHub Actions documentation](https://docs.github.com/en/actions)
3. Check Azure Portal for Web App logs and metrics
4. Verify all prerequisites are met

## Next Steps

After successful deployment:

1. **Set up monitoring** with Application Insights
2. **Configure custom domain** if needed
3. **Set up staging environments** for testing
4. **Implement CI/CD pipelines** for other environments
5. **Configure backup and disaster recovery** 