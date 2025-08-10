# GitHub CI/CD Setup Plan for QuestCraft

## Overview
This document outlines the plan for setting up GitHub CI/CD to build and deploy the QuestCraft application to GitHub Pages.

## Directory Structure
We need to create the following directory and file:
```
.github/
└── workflows/
    └── deploy.yml
```

## Workflow Configuration
The GitHub Actions workflow will include:

1. **Trigger Events**:
   - Pushes to the `main` branch
   - Manual triggering from the Actions tab

2. **Build Process**:
   - Checkout the code
   - Setup Node.js environment (version 20)
   - Install dependencies with npm
   - Build the application using `npm run build`

3. **Deployment to GitHub Pages**:
   - Configure GitHub Pages deployment
   - Upload build artifacts
   - Deploy to GitHub Pages

4. **Environment Variables**:
   - Handle `GEMINI_API_KEY` through GitHub Secrets

## Implementation Steps

### Step 1: Create Workflow Directory Structure
Create `.github/workflows/` directory in the project root.

### Step 2: Create Deploy Workflow File
Create `.github/workflows/deploy.yml` with the following configuration:

```yaml
name: Deploy to GitHub Pages

on:
  # Runs on pushes targeting the default branch
  push:
    branches: ['main']

  # Allows you to run this workflow manually from the Actions tab
  workflow_dispatch:

# Sets permissions of the GITHUB_TOKEN to allow deployment to GitHub Pages
permissions:
  contents: read
  pages: write
  id-token: write

# Allow only one concurrent deployment, skipping runs queued between the run in-progress and latest queued.
# However, do NOT cancel in-progress runs as we want to allow these production deployments to complete.
concurrency:
  group: 'pages'
  cancel-in-progress: false

jobs:
  # Build job
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  # Deployment job
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### Step 3: Configure Vite for GitHub Pages
Since GitHub Pages serves projects from a subdirectory (https://[username].github.io/[repository]), we need to configure Vite to handle this correctly.

We'll need to update `vite.config.ts` to include a `base` option:

```javascript
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: process.env.GITHUB_PAGES ? '/[repository-name]/' : '/',
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
```

Note: Replace `[repository-name]` with your actual GitHub repository name.

### Step 4: Set Up GitHub Secrets
To handle the `GEMINI_API_KEY` environment variable:

1. Go to your GitHub repository settings
2. Navigate to "Secrets and variables" > "Actions"
3. Click "New repository secret"
4. Add a secret named `GEMINI_API_KEY` with your actual API key value

### Step 5: Enable GitHub Pages
1. Go to your GitHub repository settings
2. Scroll down to the "Pages" section
3. Under "Build and deployment":
   - Source: Deploy from a branch
   - Branch: Select "gh-pages" and "/ (root)"
4. Click "Save"

## Additional Considerations

### Environment Variables in Deployment
Since the application uses a GEMINI_API_KEY, we need to consider that this key will be used client-side. For security:
1. Ensure the key has minimal permissions
2. Consider using a proxy server for API calls in production
3. Monitor usage of the API key

### Tailwind CSS
The application now uses a proper Tailwind CSS setup instead of the CDN version:
- Tailwind CSS is installed as a dev dependency
- Custom configuration is in `tailwind.config.js`
- PostCSS configuration is in `postcss.config.js`
- Main CSS file is `src/index.css`

This setup provides better performance and more reliable styling for production.

### Custom Domain (Optional)
If you plan to use a custom domain:
1. Add a `CNAME` file to the `public` directory with your domain
2. Configure DNS settings with your domain provider

## Testing the Workflow
After implementation:
1. Commit and push the workflow file to the `main` branch
2. Go to the "Actions" tab in your GitHub repository
3. Verify that the workflow runs successfully
4. Check the "Pages" section in settings to confirm deployment