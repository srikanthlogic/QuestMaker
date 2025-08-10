import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    // GitHub Pages requires a base path when deploying to a subdirectory
    // Set GITHUB_PAGES=true when building for GitHub Pages
    const isGitHubPages = process.env.GITHUB_PAGES === 'true';
    // Replace 'questcraft' with your actual repository name
    const basePath = isGitHubPages ? '/QuestMaker/' : '/';
    
    return {
      base: basePath,
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
