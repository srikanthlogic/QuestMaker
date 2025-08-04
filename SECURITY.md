# Security Policy

We take the security of QuestCraft seriously. This document explains how to report vulnerabilities and our general approach to security.

## Supported Versions

This is an active, evolving project. The latest commit on the `main` branch is considered the supported version.

## Reporting a Vulnerability

If you believe you have found a security vulnerability, please do NOT open a public issue.

Instead, report it responsibly via:
- Email: security@example.com (replace with a real contact)
- Or open a private security advisory on GitHub if available

Please include the following details to help us triage quickly:
- A clear description of the issue and potential impact
- Steps to reproduce (PoC if possible)
- Affected versions/commits
- Any relevant logs, configurations, or environment info

We aim to acknowledge reports within 72 hours and provide an initial assessment or next steps.

## Scope and Threat Model

QuestCraft is a client‑side SPA with no backend. Typical security considerations include:
- Protection of user‑provided API keys (stored in `sessionStorage`)
- Avoiding XSS in rendered markdown and quest content (we sanitize with DOMPurify)
- Safe handling of external URLs included in quest data
- Ensuring AI‑generated content is safely displayed and does not execute scripts

## Handling of API Keys

- The Gemini API key is user‑provided and stored in the browser’s `sessionStorage`, never sent to our servers.
- During local development, a `.env` `GEMINI_API_KEY` may be used for convenience. This is bundled by Vite at build time. Do not commit secrets.

## Mitigations in Place

- Markdown is sanitized using DOMPurify before insertion into the DOM ([`components/DocsPage.tsx`](components/DocsPage.tsx:38)).
- External links open normally; internal links are intercepted and routed ([`components/DocsPage.tsx`](components/DocsPage.tsx:50)).
- API key accessors use `sessionStorage` first, then fall back to environment value ([`services/apiKeyService.ts.getApiKey()`](services/apiKeyService.ts:24)).

## Responsible Disclosure

We appreciate responsible disclosure. Please give us reasonable time to investigate and remediate before any public disclosure. We will credit reporters in release notes when appropriate.

## Dependencies

We rely on notable third‑party libraries (React, Vite, DOMPurify, marked, etc.). Keep dependencies updated and monitor advisories. If you identify a vulnerable dependency path, include the advisory link and version constraints in your report.

## Contact

security@example.com (replace with a monitored contact address)