# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/ed077ba9-4d4f-4547-95c6-ea39b91b43e6

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/ed077ba9-4d4f-4547-95c6-ea39b91b43e6) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

### Option 1: Lovable Deployment
Simply open [Lovable](https://lovable.dev/projects/ed077ba9-4d4f-4547-95c6-ea39b91b43e6) and click on Share -> Publish.

### Option 2: Azure Web App Deployment
This project includes GitHub Actions workflows for automated deployment to Azure Web App:

- **Automatic deployment** on push to main branch
- **Static site hosting** optimized for React applications
- **Custom domain support** with SSL certificates
- **Built-in monitoring** with Application Insights

See [AZURE_DEPLOYMENT.md](./AZURE_DEPLOYMENT.md) for detailed setup instructions.

### Quick Start for Azure
1. Create an Azure Web App in Azure Portal
2. Get the publish profile from your Web App
3. Add the required secrets to your GitHub repository
4. Update the workflow file with your Web App name
5. Push to main branch to trigger deployment

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
