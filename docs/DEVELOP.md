# QuestCraft Developer Guide

Welcome, developer! This guide provides instructions for setting up, running, testing, and contributing to the QuestCraft engine.

## Project Overview

QuestCraft is a web-based board game engine built with modern frontend technologies. It is designed to be a single-page application that runs entirely in the browser.

### Core Technologies

-   Framework: React 19 (Hooks)
-   Language: TypeScript
-   Styling: Tailwind CSS
-   AI Integration: Google Gemini API via `@google/genai`
-   Tooling: Vite (dev/build/preview)
-   Testing: Jest + Testing Library + jsdom
-   Module Resolution: Vite aliases (`@` -> project root)

## Getting Started (Local Development)

1. Clone and install:
   ```bash
   git clone https://github.com/your-repo/questcraft.git
   cd questcraft
   npm install
   ```

2. Environment variables:
   - The app can read the Gemini API key at runtime from the browser (preferred for users) or from a local `.env` file during development.
   - Create `.env` in the repo root:
     ```
     GEMINI_API_KEY=your-gemini-key
     ```
     Vite injects it as `process.env.GEMINI_API_KEY` (and we alias it to `process.env.API_KEY`) via [`vite.config.ts:define()`](vite.config.ts:7).

   - At runtime, users can also provide a key via the in-app Settings screen. It is stored in `sessionStorage` under `questcraft_gemini_api_key` by [`services/apiKeyService.ts.getApiKey()`](services/apiKeyService.ts:24).

3. Run the dev server:
   ```bash
   npm run dev
   ```
   Open the URL printed by Vite (typically http://localhost:5173). For AI features, either set `.env` as above or paste the key in Settings.

4. Build and preview:
   ```bash
   npm run build
   npm run preview
   ```

## Scripts

- `npm run dev` — start Vite dev server
- `npm run build` — production build
- `npm run preview` — preview the production build
- `npm run test` — run Jest tests
- `npm run test:watch` — watch mode
- `npm run test:coverage` — coverage report
- `npm run ci:test` — CI-friendly test command

## Testing

- Test runner: Jest (jsdom environment)
- Libraries: @testing-library/react, @testing-library/user-event, jest-axe for a11y checks
- Configuration:
  - Jest config: [`jest.config.ts`](jest.config.ts)
  - Global setup: [`jest.setup.ts`](jest.setup.ts)
  - A11y helpers: [`tests/setup/a11y.ts`](tests/setup/a11y.ts)
- Run tests:
  ```bash
  npm test
  npm run test:watch
  npm run test:coverage
  ```

## Architecture Notes

- Central state and game loop: [`App.tsx`](App.tsx)
- Service to call Gemini and manage prompts/schemas: [`services/geminiService.ts`](services/geminiService.ts)
- API key persistence for the session: [`services/apiKeyService.ts`](services/apiKeyService.ts)
- Types shared across the app: [`types.ts`](types.ts)
- Prompt templates: `/prompts/*.txt`

Prompts use `{{placeholder}}` syntax and are fetched at runtime. See the functions in [`services/geminiService.ts.generateScenario()`](services/geminiService.ts:118) and [`services/geminiService.ts.generateQuestOutline()`](services/geminiService.ts:197) for how templates and response schemas are used.

## Project Structure

```
/
├── index.html
├── index.tsx
├── App.tsx
├── metadata.json
├── components/
├── services/
├── prompts/
├── quests/
├── docs/
├── types.ts
├── constants.ts
├── vite.config.ts
└── package.json
```

## Security & Keys

- User-provided keys are stored in `sessionStorage` only and cleared when the tab closes. They are never sent to your servers.
- During local development, you may set `GEMINI_API_KEY` in `.env`. Vite injects it into the client bundle at build/dev time using `define` in [`vite.config.ts`](vite.config.ts:7).
- The key lookup order in code is: `sessionStorage` first, then `process.env.API_KEY` as a fallback. See [`services/apiKeyService.ts.getApiKey()`](services/apiKeyService.ts:24).

## Contribution Guidelines

We welcome contributions! Please follow these steps:

1.  Fork the repository.
2.  Create a feature branch: `git checkout -b feature/short-description`.
3.  Make your changes with tests where appropriate.
4.  Run the test suite locally and ensure coverage is reasonable.
5.  Commit with a clear message and push your branch.
6.  Open a Pull Request. Describe the change, reasoning, and any UI or API impacts.

For quest authors, see the user docs:
- Quest Maker: [`docs/QUEST-MAKER.md`](docs/QUEST-MAKER.md)
- Quest Schema: [`docs/quest-schema.md`](docs/quest-schema.md)