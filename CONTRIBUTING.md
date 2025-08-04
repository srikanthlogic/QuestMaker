# Contributing to QuestCraft

Thanks for your interest in contributing! This document explains how to get set up, propose changes, and follow our standards.

## Getting Started

1) Fork and clone the repository
2) Install dependencies
```bash
npm install
```
3) Run locally
```bash
npm run dev
```
4) Run tests
```bash
npm test
```

For full developer setup, scripts, testing, and architecture notes, see the Developer Guide at [`docs/DEVELOP.md`](docs/DEVELOP.md).

## Branching and Commits

- Create feature branches from `main`: `feat/<short-title>`, `fix/<short-title>`, or `docs/<short-title>`.
- Write clear, descriptive commit messages. Use imperative mood: “Add”, “Fix”, “Refactor”.

## Coding Standards

- TypeScript + React best practices.
- Prefer functional components and hooks.
- Keep components presentational where possible and colocate logic in services.
- Follow existing formatting. If adding ESLint/Prettier, apply consistently.

## Tests

- Add/adjust tests for any behavior change.
- Use Jest and Testing Library (see config in [`jest.config.ts`](jest.config.ts) and setup in [`jest.setup.ts`](jest.setup.ts)).
- Ensure `npm run test:coverage` passes in CI.

## Documentation

- The root [`README.md`](README.md) is the canonical overview.
- In-depth docs live in `docs/`:
  - Architecture: [`docs/DESIGN.md`](docs/DESIGN.md)
  - Developer Guide: [`docs/DEVELOP.md`](docs/DEVELOP.md)
  - Quest Maker Guide: [`docs/QUEST-MAKER.md`](docs/QUEST-MAKER.md)
  - Schema Reference: [`docs/quest-schema.md`](docs/quest-schema.md)
- Update docs when adding features or changing behavior. Prefer a single source of truth and link to it from related pages.

## Pull Requests

1) Ensure your branch is up to date with `main`.
2) Confirm tests pass locally: `npm test`.
3) Open a PR with:
   - Summary of the change and rationale
   - Screenshots/GIFs for UI changes
   - Notes on docs/testing impacts
4) PR Preview workflow will build your changes. Check the link on the PR for render verification.

## Reporting Issues

- Provide clear steps to reproduce, expected vs actual, environment details, and logs/screenshots if applicable.
- For security vulnerabilities, do not open a public issue; see [`SECURITY.md`](SECURITY.md) for responsible disclosure.

## Code of Conduct

Please read and follow our [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).