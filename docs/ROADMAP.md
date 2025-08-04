# QuestMaker Roadmap

Owner: Core Maintainers  
Last Reviewed: 2025-08-04  
Version: v0.1.0-roadmap

Summary
- [1. Current Features](#1-current-features)
- [2. Proposed Features (Backlog)](#2-proposed-features-backlog)
- [3. Competitive Comparison](#3-competitive-comparison)
- [4. Milestones and Timeline](#4-milestones-and-timeline)
- [5. Strategy and Principles](#5-strategy-and-principles)
- [6. Risks and Assumptions](#6-risks-and-assumptions)
- [7. Contribution Guidance](#7-contribution-guidance)
- [8. Changelog Linkage](#8-changelog-linkage)

Labels and Status
- Status: planned | in-progress | done | beta | deprecated
- Version tags: vMAJOR.MINOR (planned target) or "TBD"

Related Docs
- Intro and concepts: [`docs/INTRODUCTION.md`](docs/INTRODUCTION.md)
- Design: [`docs/DESIGN.md`](docs/DESIGN.md)
- Development guide: [`docs/DEVELOP.md`](docs/DEVELOP.md)
- Quest format and schema: [`docs/QUEST-MAKER.md`](docs/QUEST-MAKER.md), [`docs/quest-schema.md`](docs/quest-schema.md)
- Component docs view: [`components/DocsPage.tsx`](components/DocsPage.tsx)
- Changelog: [`CHANGELOG.md`](CHANGELOG.md)

Issue/Discussion References
- Search issues/PRs by label: roadmap, enhancement, milestone

---

## 1) Current Features

Application Core
- Player Experience (Status: beta)
  - Dashboard UI (Status: beta) — Progress tracking, scores, and a11y-focused components. See [`components/PlayerDashboard.tsx`](components/PlayerDashboard.tsx) and tests in [`__tests__/components/PlayerDashboard.test.tsx`](__tests__/components/PlayerDashboard.test.tsx).
  - Game Board and Scenario Cards (Status: beta) — Scenario browsing and selection. See [`components/GameBoard.tsx`](components/GameBoard.tsx) and [`components/ScenarioCard.tsx`](components/ScenarioCard.tsx).
  - Rules and Settings (Status: beta) — In-app rules modal and configurable options. See [`components/RulesModal.tsx`](components/RulesModal.tsx), [`components/Settings.tsx`](components/Settings.tsx).
  - Quest Loading (Status: beta) — Load, parse, and validate quest JSON assets. See [`components/QuestLoader.tsx`](components/QuestLoader.tsx), [`quests/`](quests/).

Quest System
- Quest Schema Definition (Status: stable)
  - Formalized schema and documentation for authoring quests. See [`docs/quest-schema.md`](docs/quest-schema.md) and sample quests in [`quests/`](quests/).
- Pregenerated Scenarios (Status: beta)
  - Included curated scenarios for out-of-the-box gameplay. See [`pregeneratedScenarios.ts`](pregeneratedScenarios.ts) and [`quests/*.json`](quests/).

AI Integration
- Google Gemini Service Abstraction (Status: beta)
  - Encapsulated calls to Google GenAI; mockable and tested. See [`services/geminiService.ts`](services/geminiService.ts), [`tests/__mocks__/googleGenAiMock.ts`](tests/__mocks__/googleGenAiMock.ts), and unit tests in [`__tests__/services/geminiService.test.ts`](__tests__/services/geminiService.test.ts).
- API Key Management (Status: beta)
  - Local storage retrieval, validation, and test coverage. See [`services/apiKeyService.ts`](services/apiKeyService.ts) with tests in [`__tests__/services/apiKeyService.test.ts`](__tests__/services/apiKeyService.test.ts).

Docs and Tooling
- Documentation Site Pages (Status: beta)
  - Intro, design, develop, and readme docs. See [`docs/INTRODUCTION.md`](docs/INTRODUCTION.md), [`docs/DESIGN.md`](docs/DESIGN.md), [`docs/DEVELOP.md`](docs/DEVELOP.md), [`docs/README.md`](docs/README.md).
- CI and Preview (Status: beta)
  - CI tests and PR preview workflows. See [`.github/workflows/ci-tests.yml`](.github/workflows/ci-tests.yml) and [`.github/workflows/pr-preview.yml`](.github/workflows/pr-preview.yml).
- Testing and A11y Setup (Status: beta)
  - Jest, a11y utilities, and mocks. See [`jest.config.ts`](jest.config.ts), [`tests/setup/a11y.ts`](tests/setup/a11y.ts), [`tests/__mocks__/fileMock.js`](tests/__mocks__/fileMock.js).

Security and Community
- Security Policy (Status: stable)
  - See [`SECURITY.md`](SECURITY.md).
- Contribution Guidelines and Code of Conduct (Status: stable)
  - See [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).

---

## 2) Proposed Features (Backlog)

Prioritization factors: user value, strategic alignment, technical feasibility, risk, and effort.

P1 — Authoring UX and Validation
- In-App Quest Editor (Status: planned, Target: v0.2)
  - Rationale: Reduce friction for creators by enabling WYSIWYG quest authoring.
  - Impact: High (content growth), Effort: High, Dependencies: Quest schema vNext, JSON validation in-browser.
  - Links: [`docs/quest-schema.md`](docs/quest-schema.md)
- Live Schema Validation and Linting (Status: planned, Target: v0.2)
  - Rationale: Prevent invalid quest states; improve author confidence.
  - Impact: High, Effort: Medium, Dependencies: In-App Editor.

P1 — Gameplay Depth
- Branching Logic and Outcomes (Status: planned, Target: v0.3)
  - Rationale: Increase replayability with stateful branches.
  - Impact: High, Effort: High, Dependencies: State management, persistence layer.
- Scoring Models v2 (Status: planned, Target: v0.3)
  - Rationale: More nuanced scoring and badges.
  - Impact: Medium, Effort: Medium, Dependencies: Telemetry events.

P2 — AI Enhancements
- AI-Assisted Authoring Prompts v2 (Status: planned, Target: v0.2)
  - Rationale: Improve quality and speed of content creation.
  - Impact: Medium, Effort: Medium, Dependencies: Stable AI key management, prompt library updates in [`prompts/`](prompts/).
- Multi-Provider AI Abstraction (Status: planned, Target: v0.4)
  - Rationale: Vendor portability, cost/perf optimization.
  - Impact: High, Effort: High, Dependencies: Adapter interface over [`services/geminiService.ts`](services/geminiService.ts).

P2 — Platform and Distribution
- Export/Import Formats (Status: planned, Target: v0.2)
  - Rationale: Share and version quests easily.
  - Impact: Medium, Effort: Medium, Dependencies: Schema stability, file I/O UX.
- Public Quest Gallery (Status: planned, Target: v0.4)
  - Rationale: Community discovery and sharing.
  - Impact: High, Effort: High, Dependencies: Hosting, moderation, metadata.

P3 — Quality and Ops
- Telemetry and Analytics (Status: planned, Target: v0.3)
  - Rationale: Data-driven improvements, difficulty tuning.
  - Impact: Medium, Effort: Medium, Dependencies: Consent and privacy controls.
- Offline Mode (Status: planned, Target: v0.5)
  - Rationale: Classroom and low-connectivity usage.
  - Impact: Medium, Effort: High, Dependencies: Storage strategy, asset bundling.

Dependencies, Blockers, Prerequisites
- State management architecture for branching and persistence (pre-req for P1 Gameplay Depth).
- Formal plugin/provider abstraction for AI (pre-req for Multi-Provider).
- Privacy, consent, and storage policies for Telemetry.
- UX design for Editor and Validation flows.

---

## 3) Competitive Comparison

Scope: Learning quest builders, educational scenario tools, and interactive narrative/game tooling.

Comparison Matrix (parity today vs. target)
- Content Authoring
  - Today: JSON-based, external editing (parity below market leaders).
  - Target: In-app editor with live validation (meets parity).
- Gameplay Depth
  - Today: Linear scenarios with scoring (basic parity).
  - Target: Branching, outcomes, badges (competitive parity+).
- AI Assistance
  - Today: Prompt library and Gemini service (basic parity).
  - Target: Multi-provider and assistive authoring v2 (parity+).
- Community Distribution
  - Today: Bundled quests (below parity).
  - Target: Gallery, import/export (parity).
- A11y and Testing
  - Today: Jest+a11y setup with tests (parity).
  - Target: Scenario-level a11y checks and coverage dashboards (parity+).

Notes and Sources
- Benchmarked against open-source quest/narrative tools and classroom scenario builders (docs, feature lists, and public demos as of 2025-08).
- Internal evaluation captured in design notes; see [`docs/DESIGN.md`](docs/DESIGN.md).

---

## 4) Milestones and Timeline

Near-Term (0–3 months)
- v0.2
  - In-App Quest Editor (MVP)
  - Live Schema Validation and Linting
  - Export/Import for quests
  - Success criteria: Author can create, validate, and export a new quest without leaving the app.

Mid-Term (3–6 months)
- v0.3
  - Branching Logic and Outcomes
  - Scoring Models v2
  - Telemetry foundations and privacy controls
  - Success criteria: Branch-based quests playable end-to-end with metrics captured (opt-in).

Long-Term (6–12 months)
- v0.4–v0.5
  - Multi-Provider AI Abstraction
  - Public Quest Gallery
  - Offline Mode
  - Success criteria: Providers can be swapped via config; quests discoverable in gallery; playable offline.

Versioning Plan
- 0.x for rapid iteration (feature-driven).
- Stabilize schema for 1.0 once editor, branching, and provider abstraction reach maturity and docs are complete.

---

## 5) Strategy and Principles

Product Vision
- Empower creators to design engaging educational quests quickly, validate quality, and share broadly.

North-Star Metrics
- Time-to-first-published quest (TTFPQ).
- Number of published quests/month.
- Player completion and satisfaction scores.

Prioritization Criteria
- User Impact: Does this reduce author/player friction or unlock value?
- Feasibility: Can we deliver with high confidence this cycle?
- Strategic Alignment: Does it move us toward editor + branching + distribution?
- Quality and Safety: A11y, reliability, and privacy-first.

Design Principles
- Schema-first: clear, documented, and validated.
- Testable-by-default: unit and a11y tests for core surfaces.
- Pluggable services: provider abstractions and modular architecture.
- Progressive enhancement: graceful fallbacks for offline and low-connectivity.

---

## 6) Risks and Assumptions

Key Risks
- AI Provider Volatility — Pricing, quotas, or API changes.
  - Mitigation: Abstraction layer and fallbacks; robust mocks and tests.
- Authoring Complexity — Editor UX may be complex to implement.
  - Mitigation: MVP first; incremental validation; user testing.
- Data Privacy/Compliance — Telemetry and gallery features require careful handling.
  - Mitigation: Opt-in, anonymization, policy docs, and security review.
- Scope Creep — Branching and scoring systems can expand unpredictably.
  - Mitigation: Clear acceptance criteria and milestone gates.

Assumptions
- Contributors can run the project locally with current toolchain.
- Community interest in authoring and sharing quests will grow with lower friction.

---

## 7) Contribution Guidance

How to Propose Features
- Open an enhancement issue with "roadmap" label.
- Include: problem statement, user stories, acceptance criteria, rough design, and dependencies.

How to Provide Feedback
- Comment on related issues or open a discussion thread.
- Reference sections of this roadmap and docs where relevant.

How to Track Changes
- Follow milestones and labels on issues/PRs.
- Roadmap updates are versioned in Git and summarized in the changelog.

Useful References
- Contribution guide: [`CONTRIBUTING.md`](CONTRIBUTING.md)
- Security policy: [`SECURITY.md`](SECURITY.md)
- Code of Conduct: [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md)

---

## 8) Changelog Linkage

Mapping Policy
- Each shipped roadmap item should link to entries in [`CHANGELOG.md`](CHANGELOG.md) under the release it landed in.
- Use semantic, user-facing descriptions, and reference the related issues/PRs.
- When a roadmap item spans multiple releases, annotate partial deliveries per version.

Release Notes
- Summarize user-impacting changes first (features, fixes), then developer notes (breaking changes, migrations).
- Keep consistent labels: Features, Improvements, Fixes, Docs, Chore.

Maintenance
- Roadmap is reviewed monthly or at each release boundary.
- Update "Last Reviewed" date and adjust milestones and statuses accordingly.