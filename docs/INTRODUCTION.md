---
title: QuestMaker Introduction
description: Main page for QuestMaker documentation
---

# Introduction

QuestMaker turns complex training topics into playable, branching quests that run in the browser. It helps educators, instructional designers, and developer advocates create hands-on, scenario-based learning with minimal setup.

Problem space
- Traditional docs and slides struggle to teach decision-driven skills.
- Interactive tutorials often need a backend or custom engine.
- Teams need validation, testability, and simple static hosting.

Goals
- Simple authoring: JSON-based structure with a clear schema.
- Valid by default: schema-validated scenarios with helpful errors.
- Portable: no server required; deploy anywhere static files can be served.
- Testable and accessible: integrate with unit tests and a11y checks.

Scope
- Authoring, validating, and playing quests client-side.
- Optional LLM hints/feedback via pluggable services.
- Extensible components and services for custom UIs and providers.

Supported platforms
- Browsers: latest Chrome/Edge, Firefox, Safari.
- OS: any OS capable of running a modern browser.
- Node.js: 18+ for development commands and tests.

Architecture overview

High-level design
- Frontend app: Vite + React + TypeScript
- Components: UI for loading, playing, and inspecting quests
- Services: API keys, LLM provider, path helpers
- Quests: JSON assets validated at load time
- Tests: Jest + Testing Library with a11y helpers

Data flow
1. User selects or provides a quest JSON
2. Quest is validated against schema rules
3. Components render prompts, choices, and update state/score
4. Optional LLM hint calls (if key configured) enrich feedback
5. Final outcomes and scores are displayed

Core abstractions
- Quest: metadata, steps, choices, outcomes
- Step: prompt, choices, next pointers, terminal flag
- Player state: current step, score, history
- Services:
  - API Key: secure env loading [services.apiKeyService()](../services/apiKeyService.ts:1)
  - LLM Provider: Gemini integration [services.geminiService()](../services/geminiService.ts:1)
  - Path helpers [services.pathService()](../services/pathService.ts:1)
- UI Components:
  - App shell [components.QuestMaker()](../components/QuestMaker.tsx:1)
  - Loader [components.QuestLoader()](../components/QuestLoader.tsx:1)
  - Dashboard [components.PlayerDashboard()](../components/PlayerDashboard.tsx:1)
  - Game board [components.GameBoard()](../components/GameBoard.tsx:1)

Design principles
- Declarative data model: predictable, serializable quests
- Explicit boundaries: services encapsulate external concerns
- Accessibility-first: testable and inclusive UI
- Docs as code: examples live with source

Features
- JSON quest authoring with schema guidance
- Built-in quest validation on load
- Pluggable LLM assistance (Gemini)
- React components for play and preview
- Jest-based test harness and a11y setup

Non-goals
- Building a server-based authoring suite
- Persisting user data server-side
- Opinionated content pipelines

Installation and getting started
- Install dependencies:
  npm ci

- Run development server:
  npm run dev

- Load a sample quest:
  Use the UI loader and select [../quests/aadhaar-quest.json](../quests/aadhaar-quest.json:1) or [../quests/digital-payments-quest.json](../quests/digital-payments-quest.json:1)

Documentation map
- Tutorials: authoring your first quest [docs.QUEST-MAKER](./QUEST-MAKER.md:1)
- How-to guides:
  - Configure API keys [services.apiKeyService()](../services/apiKeyService.ts:1)
  - Use Gemini provider [services.geminiService()](../services/geminiService.ts:1)
  - Add new quest files [quests/](../quests/aadhaar-quest.json:1)
- Reference:
  - Components: [components/](../components/QuestMaker.tsx:1)
  - Types: [types.ts](../types.ts:1), [constants.ts](../constants.ts:1)
  - Config: [vite.config.ts](../vite.config.ts:1), [jest.config.ts](../jest.config.ts:1), [tsconfig.json](../tsconfig.json:1)
- API docs: In-source TypeScript types and comments; see [types.ts](../types.ts:1) and service signatures.
- Examples: [pregeneratedScenarios.ts](../pregeneratedScenarios.ts:1), [quests/](../quests/aadhaar-quest.json:1)
- FAQ: See [docs/README.md](./README.md:1)

Versioning and compatibility
- Versioning: SemVer (MAJOR.MINOR.PATCH)
- Compatibility:
  - Node 18+ for dev and CI
  - Browser: last 2 major versions of modern browsers
- Release cadence: minor releases monthly, patches as needed
- Changelog: [../CHANGELOG.md](../CHANGELOG.md:1)

Security policy
- See [../SECURITY.md](../SECURITY.md:1) for reporting and handling vulnerabilities.
- Do not include secrets in quests or commits; use .env.local for local dev.
- In CI, store API keys in repository secrets and map to VITE_* env vars.

Performance considerations
- Static build uses Vite code-splitting.
- Keep quests small and modular; consider lazy-loading large assets.
- Memoize heavy UI state where appropriate.
- Use production build (npm run build) for realistic performance.

Benchmarks
- For small-to-medium quests (≤ 200 steps), initial load is typically < 50ms on modern desktops; validate with Lighthouse for your deployment.

Community and support
- Issues: GitHub Issues
- Discussions: GitHub Discussions
- Development guide: [./DEVELOP.md](./DEVELOP.md:1)
- Code of Conduct: [../CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md:1)
- Contributing guide: [../CONTRIBUTING.md](../CONTRIBUTING.md:1)

Citation or academic usage
If you use QuestMaker in academic work, cite the repository URL and version (from [../CHANGELOG.md](../CHANGELOG.md:1)).

Next steps
- Read the quickstart in [../README.md](../README.md:1)
- Explore the schema in [./quest-schema.md](./quest-schema.md:1)
- Try and modify a sample quest in [../quests/](../quests/aadhaar-quest.json:1)

Notes for doc engines
This page is designed to serve as a main landing page for static site generators and doc tools. Sphinx/Doxygen users can include it via toctree/mainpage directives as appropriate for your build.