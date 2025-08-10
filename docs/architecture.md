# QuestCraft: Architecture & Design

This document outlines the architectural decisions, design patterns, and core principles behind the QuestCraft application.

## 1. Core Philosophy

-   **Configuration Over Code:** The entire game experience should be defined in a declarative JSON file (`quest.json`). This separates the game *content* from the game *engine*, making it easy for non-developers to create quests.
-   **AI-Powered Creation:** Radically simplify the content creation process by leveraging the power of generative AI models like Google's Gemini and those compatible with the OpenAI API. This lowers the barrier to entry for creating rich, educational games.
-   **Zero-Setup & Serverless:** The application must run entirely in the browser and be hostable on any static file server. This ensures maximum portability and ease of use.

## 2. High-Level Architecture

QuestCraft is a **client-side Single-Page Application (SPA)** built with modern web technologies.

-   **Framework:** **React** with **TypeScript** for a robust and scalable component-based UI.
-   **Dependencies:** Uses an `importmap` in `index.html` to load libraries like React and `@google/genai` directly from a CDN (esm.sh). OpenAI-compatible API calls are made using the native `fetch` API.
-   **Styling:** **Tailwind CSS** is used for utility-first styling, loaded via its CDN script for simplicity.

### Data Flow

The application follows a simple, unidirectional data flow:

**Creation Flow:**
`User Idea` -> `QuestMakerWizard.tsx` -> `aiService.ts` -> **Generative AI API (Gemini, OpenRouter, etc.)** -> `quest.json` (as state)

**Gameplay Flow:**
`quest.json` (as state) -> `App.tsx` -> `GameBoard.tsx` / `PlayerDashboard.tsx` / `ActionPanel.tsx` -> User Interaction -> State Update in `App.tsx`

## 3. Key Components & Services

-   **`App.tsx`**: The root component and primary state container. It manages the overall game state (`gamePhase`, `players`, `questConfig`, etc.) using React hooks like `useState` and `useCallback`. It acts as the central "brain" of the game, orchestrating state changes and passing data down to child components.

-   **`services/aiService.ts`**: This service is the central hub for all AI interactions. It is responsible for:
    -   Reading the user's provider settings (Gemini, OpenRouter, etc.) from `settingsService`.
    -   Selecting the correct API implementation (the native `@google/genai` SDK for Gemini, or a `fetch`-based client for OpenAI-compatible APIs).
    -   Preparing the prompts and request bodies appropriate for the selected provider.
    -   Normalizing the response from different APIs into a consistent format for the application.
    -   Implementing robust retry logic with exponential backoff to handle rate limits and transient network errors.
    -   Integrating with the `auditLogService` to log every request and response.
    -   **Grounding in Reality:** This feature is now provider-agnostic. The service checks if the quest is "grounded" and selects the appropriate prompt.
        -   For **Gemini**, it uses a prompt that invokes the **built-in Google Search tool**.
        -   For **OpenAI-compatible providers (like OpenRouter)**, it sends a prompt instructing the model to use its **own web search capabilities**. This relies on the user having selected a search-enabled model (e.g., `perplexity/llama-3-sonar-large-32k-online`) in the settings.

-   **`services/settingsService.ts`**: A service to manage application settings, primarily the user's selected AI provider, API keys, and models. It uses `localStorage` for persistence.

-   **`services/auditLogService.ts`**: A simple service that handles reading from and writing to `localStorage`. It provides a centralized way to manage the AI interaction logs, including adding new entries and clearing the log.

-   **`prompts/`**: This directory contains plain text files for all the major prompts sent to the AI providers.
    -   **Why?** Externalizing prompts from the code allows developers to easily customize and tune the AI's behavior, tone, and instructions without needing to modify the application's logic. This is a key part of making the engine adaptable.
    -   The `aiService` loads these files at runtime and injects dynamic values (like quest themes or location names) before sending them to the API.
    -   Separate files exist for different providers and features (e.g., `...-grounded-openai.txt`) to account for differences in how APIs handle instructions and tool use.

-   **`components/`**: The directory contains all the React components.
    -   **`GameBoard.tsx`**: Renders the visual game board and player tokens.
    -   **`PlayerDashboard.tsx` / `ActionPanel.tsx`**: These components form the main three-column UI, separating player status from interactive game events.
    -   **`QuestMakerWizard.tsx`**: A multi-step modal that guides the user through the AI-powered quest creation process.
    -   **`SettingsDrawer.tsx`**: Provides access to application-level actions, such as configuring the AI Provider (including a dynamic model chooser for OpenRouter), managing custom quests, viewing the AI Audit Log, and resetting all application data.
    -   **`AIAuditLogDrawer.tsx`**: A drawer component that displays the formatted logs from the `auditLogService`. It allows users to inspect the details of each API call.
    -   **`DocsPage.tsx`**: A dedicated, GitBook-style page for all documentation.

## 4. State Management

State management is kept simple and local, primarily using `React.useState` and `React.useCallback` within the `App.tsx` component. There is no global state manager like Redux or Zustand, as the application's complexity does not currently warrant it. State is passed down through props (prop-drilling), which is sufficient for the current architecture.