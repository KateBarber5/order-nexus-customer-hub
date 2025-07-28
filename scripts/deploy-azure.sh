#!/bin/bash

# Azure Web App Deployment Script
# This script helps with local testing and manual Azure deployments

set -e

echo "🚀 Starting Azure Web App deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version)
echo "📦 Node.js version: $NODE_VERSION"

# Install dependencies
echo "📥 Installing dependencies..."
npm ci

# Run linting
echo "🔍 Running linting..."
npm run lint

# Build the application
echo "🏗️ Building application..."
npm run build

# Check if build was successful
if [ -d "dist" ]; then
    echo "✅ Build successful! Files are in the dist/ directory."
    echo "📁 Build contents:"
    ls -la dist/
else
    echo "❌ Build failed! dist/ directory not found."
    exit 1
fi

# Create deployment package
echo "📦 Creating deployment package..."
mkdir -p deploy
cp -r dist/* deploy/

# Create web.config for Azure
echo "⚙️ Creating web.config for Azure..."
cat > deploy/web.config << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="React Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
    <staticContent>
      <mimeMap fileExtension=".json" mimeType="application/json" />
      <mimeMap fileExtension=".woff" mimeType="application/font-woff" />
      <mimeMap fileExtension=".woff2" mimeType="application/font-woff2" />
    </staticContent>
    <httpProtocol>
      <customHeaders>
        <add name="X-Content-Type-Options" value="nosniff" />
        <add name="X-Frame-Options" value="DENY" />
        <add name="X-XSS-Protection" value="1; mode=block" />
        <add name="Referrer-Policy" value="strict-origin-when-cross-origin" />
      </customHeaders>
    </httpProtocol>
  </system.webServer>
</configuration>
EOF

echo "✅ Deployment package created in deploy/ directory"
echo "📁 Deployment package contents:"
ls -la deploy/

echo "🎉 Azure deployment script completed successfully!"
echo ""
echo "Next steps:"
echo "1. Push to main branch to trigger automatic GitHub Actions deployment"
echo "2. Or manually deploy the deploy/ folder to your Azure Web App"
echo "3. Your app will be available at: https://your-app-name.azurewebsites.net"
echo ""
echo "To manually deploy using Azure CLI:"
echo "az webapp deployment source config-zip --resource-group <resource-group> --name <app-name> --src deploy.zip" 