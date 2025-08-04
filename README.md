# QuestMaker

QuestMaker is a lightweight, extensible web app for authoring, validating, and playing interactive learning quests and compliance scenarios. It targets educators, instructional designers, and developer advocates who want to turn complex topics into guided, branching experiences that run entirely in the browser.

Highlights
- Visual, quick-start authoring with a JSON schema: define steps, choices, scoring, and outcomes.
- Pluggable LLM hints: optional AI assistance for feedback and dynamic content via a Gemini provider.
- Built-in validator: schema-validated quests with clear error messages.
- Zero back end: static-host friendly (Vite + React + TypeScript).
- Testable and accessible: Jest + Testing Library + a11y setup.

Status
- Build: GitHub Actions (see .github/workflows)
- Coverage: Jest (see reports via CI)
- License: MIT
- Version: see [CHANGELOG.md](CHANGELOG.md:1)

Quickstart

Prerequisites
- Node.js LTS 18+ (20+ recommended)
- npm 9+ (or pnpm 8+/yarn 3+)
- A modern browser

Install
1) Clone the repo:
   git clone https://github.com/your-org/questmaker.git
   cd questmaker

2) Install dependencies:
   npm ci
   # or: pnpm i --frozen-lockfile
   # or: yarn install --frozen-lockfile

Run the app
- Development:
  npm run dev
  # open the printed URL (default http://localhost:5173)

- Production build and preview:
  npm run build
  npm run preview

Hello world: load a quest
1) Start dev server: npm run dev
2) In the app, click “Load Quest”
3) Select a sample like [quests/aadhaar-quest.json](quests/aadhaar-quest.json:1) or [quests/digital-payments-quest.json](quests/digital-payments-quest.json:1)
4) Play through steps; review score and outcomes

Core usage examples

Author a quest (JSON)
Create quests/my-first-quest.json:
{
  "$schema": "./docs/quest-schema.md",
  "id": "hello-world",
  "title": "Hello World Quest",
  "description": "A minimal branching scenario.",
  "steps": [
    {
      "id": "start",
      "prompt": "Choose your path.",
      "choices": [
        { "id": "a", "label": "Greet the world", "next": "end", "score": 1 },
        { "id": "b", "label": "Stay silent", "next": "end", "score": 0 }
      ]
    },
    { "id": "end", "prompt": "Quest complete!", "terminal": true }
  ]
}

Validate structure
- See schema details in [docs/quest-schema.md](docs/quest-schema.md:1). The app validates each quest on load and shows issues inline.

Load a quest programmatically
- Render root component [components.QuestMaker()](components/QuestMaker.tsx:1)
- Use [components.QuestLoader()](components/QuestLoader.tsx:1) to supply quest JSON
- Browse demos in [pregeneratedScenarios.ts](pregeneratedScenarios.ts:1)

Project structure
- App shell: [index.tsx](index.tsx:1), [App.tsx](App.tsx:1)
- Components: [components/](components/QuestMaker.tsx:1)
  - Player: [components.GameBoard()](components/GameBoard.tsx:1), [components.PlayerDashboard()](components/PlayerDashboard.tsx:1)
  - Docs/Authoring: [components.DocsPage()](components/DocsPage.tsx:1), [components.QuestLoader()](components/QuestLoader.tsx:1)
- Services: [services/](services/pathService.ts:1)
  - Keys: [services.apiKeyService()](services/apiKeyService.ts:1)
  - LLM: [services.geminiService()](services/geminiService.ts:1)
  - Paths: [services.pathService()](services/pathService.ts:1)
- Docs: [docs/README.md](docs/README.md:1), [docs/DEVELOP.md](docs/DEVELOP.md:1), [docs/DESIGN.md](docs/DESIGN.md:1), [docs/quest-schema.md](docs/quest-schema.md:1)
- Quests: [quests/](quests/aadhaar-quest.json:1)
- Tests: [__tests__/](__tests__/services/apiKeyService.test.ts:1), [tests/setup/a11y.ts](tests/setup/a11y.ts:1)
- Config: [vite.config.ts](vite.config.ts:1), [jest.config.ts](jest.config.ts:1), [tsconfig.json](tsconfig.json:1)

Configuration and environment

Environment variables
- Vite exposes env vars with VITE_* prefix.
- Create .env.local (not committed):
  VITE_GOOGLE_GEMINI_API_KEY=your_key_here

- API key handling: [services.apiKeyService()](services/apiKeyService.ts:1)
- Gemini integration: [services.geminiService()](services/geminiService.ts:1)

Secure handling guidance
- Never commit secrets; .env.local is ignored by Git (see [.gitignore](.gitignore:1)).
- Use GitHub Actions secrets for CI and map to env in workflows.

Development setup
- Install deps: npm ci
- Start dev server: npm run dev
- Typecheck and lint (if configured):
  npm run typecheck
  npm run lint

Testing
- Run all tests:
  npm test
  # Jest config: [jest.config.ts](jest.config.ts:1), setup: [jest.setup.ts](jest.setup.ts:1)

- Example targeted suites:
  npm test -- __tests__/components/PlayerDashboard.test.tsx
  npm test -- __tests__/services/geminiService.test.ts

Troubleshooting
- Blank page or red errors:
  - Validate JSON against [docs/quest-schema.md](docs/quest-schema.md:1)
  - Check console and terminal for Vite HMR errors
- LLM not responding:
  - Ensure VITE_GOOGLE_GEMINI_API_KEY is set in .env.local
  - Verify network access and quota; run: npm test -- __tests__/services/geminiService.test.ts
- Jest cannot find mocks:
  - See [tests/__mocks__/googleGenAiMock.ts](tests/__mocks__/googleGenAiMock.ts:1) and [tests/__mocks__/fileMock.js](tests/__mocks__/fileMock.js:1)

Documentation and links
- Docs home: [docs/README.md](docs/README.md:1)
- Introduction (doc mainpage): [docs/INTRODUCTION.md](docs/INTRODUCTION.md:1)
- Design: [docs/DESIGN.md](docs/DESIGN.md:1)
- Developer guide: [docs/DEVELOP.md](docs/DEVELOP.md:1)
- Issue tracker: open GitHub Issues
- Discussions: GitHub Discussions
- Roadmap: see [docs/README.md](docs/README.md:1)
- Changelog: [CHANGELOG.md](CHANGELOG.md:1)

Contributing and conduct
- Contribution guide: [CONTRIBUTING.md](CONTRIBUTING.md:1)
- Code of Conduct: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md:1)

License
- SPDX: MIT
- License file: add LICENSE (MIT) to repo root if not present

Security
- Policy and reporting: [SECURITY.md](SECURITY.md:1)

Acknowledgments
- Built with Vite + React + TypeScript.
- Thanks to Jest and Testing Library maintainers.
- Sample quests inspired by digital safety curricula.

Accessibility and internationalization
- A11y smoke tests setup: [tests/setup/a11y.ts](tests/setup/a11y.ts:1)
- Prefer semantic structure in prompts and provide alt text for media.
- Quests are language-agnostic; author content in any language.

Screenshots
- Add images to docs/images/ and reference them here once available.
- UI references: [components/PlayerDashboard.tsx](components/PlayerDashboard.tsx:1), [components/GameBoard.tsx](components/GameBoard.tsx:1)
