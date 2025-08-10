# GitHub Actions Workflows

This directory contains the GitHub Actions workflows for building and deploying the QuestCraft application.

## Deployment Workflow

The `deploy.yml` workflow automatically builds and deploys the application to GitHub Pages whenever changes are pushed to the `main` branch.

### Setting up GitHub Secrets

To enable the application to use the Gemini API, you need to set up a GitHub Secret for the `GEMINI_API_KEY`:

1. Go to your GitHub repository settings
2. Navigate to "Secrets and variables" > "Actions"
3. Click "New repository secret"
4. Add a secret with:
   - Name: `GEMINI_API_KEY`
   - Value: Your actual Gemini API key

### Customizing the Deployment

If you're using a different repository name, you'll need to update the `base` option in `vite.config.ts`:

```javascript
const basePath = isGitHubPages ? '/[your-repository-name]/' : '/';
```

Replace `[your-repository-name]` with your actual GitHub repository name.

### Tailwind CSS

The project now uses a proper Tailwind CSS setup instead of the CDN version. All dependencies are managed through npm, and the build process will correctly compile the CSS.

To customize the Tailwind configuration:
1. Edit `tailwind.config.js` for theme customizations
2. Edit `postcss.config.js` for PostCSS plugin configuration
3. Add custom CSS to `src/index.css` if needed

### Testing Locally

To test the build locally:
```bash
npm run build
npm run preview
```

This will build the project and serve it locally to verify that everything works correctly.