
# QuestCraft: Architecture & Design

This document outlines the architectural decisions, design patterns, and core principles behind the QuestCraft application. It is intended for developers who want to understand, maintain, or contribute to the engine.

## 1. Core Philosophy

The primary goal of QuestCraft is to be a **highly extensible, easy-to-use engine for creating educational "serious games."** This philosophy drives the key design choices:

-   **Configuration over Code:** The entire game experience (rules, board, content) should be defined in a declarative JSON file (`quest.json`). This empowers non-programmers to create their own games.
-   **AI-Powered Creation:** Leverage the power of Generative AI (Google's Gemini) to radically simplify the creation process, turning a simple idea into a fully-fledged game outline.
-   **Zero-Setup Environment:** The application should run entirely in the browser with no build steps or local dependencies required for the end-user, maximizing accessibility.
-   **Component Modularity:** The UI should be composed of logical, reusable React components that are easy to understand and maintain.

## 2. High-Level Architecture

QuestCraft is a **client-side Single-Page Application (SPA)** built with React and TypeScript.

-   **No Backend:** The application has no traditional backend server. All game logic, state management, and rendering happen in the user's browser.
-   **Static File Serving:** The application is served as a collection of static files (`index.html`, `.tsx` components, assets).
-   **External Services:**
    -   **Google Gemini API:** The only "backend" service it communicates with is the Google Gemini API for AI-powered content generation.
    -   **CDN for Dependencies:** All third-party libraries (React, etc.) are loaded directly from a CDN (`esm.sh`) via an `importmap` in `index.html`. This eliminates the need for `node_modules` and a package manager like `npm` or `yarn` for running the application.

## 3. State Management

The application uses React's built-in state management hooks, primarily `useState` and `useCallback`.

-   **Centralized State in `App.tsx`:** The root `App.tsx` component acts as the primary state container. It holds all critical game state, including:
    -   `questConfig`: The loaded JSON object defining the current game.
    -   `players`: An array of player objects with their resources, positions, and statuses.
    -   `gamePhase`: A string enum that dictates the current state of the game loop (e.g., `START`, `ROLLING`, `SCENARIO_CHOICE`). This is the core of the game's state machine.
    -   `view`: A string that controls which high-level component is rendered (`loader`, `setup`, `game`, `maker`).
-   **Top-Down Data Flow:** State is passed down from `App.tsx` to child components via props.
-   **Callback Functions for Updates:** Child components update the central state by calling functions passed down as props (e.g., `handleStartGame`, `handleNextTurn`). The `useCallback` hook is used to memoize these functions for performance.
-   **`sessionStorage` for API Key:** The user's Gemini API key is managed via the `apiKeyService.ts` and stored in `sessionStorage`. This makes it persistent for the session but not permanently stored, striking a balance between convenience and security.

## 4. Component Design

The component structure is designed to be logical and maintainable.

-   **`App.tsx` (The Conductor):** As mentioned, it's the root component that manages everything. It renders the current view based on the application state.
-   **View Components (`QuestLoader`, `Settings`, `QuestMaker`, `GameBoard` area):** These are the high-level screens. `QuestLoader` handles loading/selecting a quest. `Settings` configures a game session. `QuestMaker` is the creation wizard. The main game view is orchestrated directly within `App.tsx`.
-   **Game UI Components (`PlayerDashboard`, `GameBoard`, `ScenarioCard`):** These are the core elements of the gameplay screen. They are "presentational" in that they receive data via props and render the UI accordingly.
-   **Service Components (`RulesModal`, `Footer`):** These provide ancillary functionality like displaying rules or information.
-   **Icon Components (`Icons.tsx`):** A single file exports all SVG icons as React components for easy use and consistency.

## 5. AI Integration (`services/geminiService.ts`)

This service is the bridge to the Gemini API and a critical part of the application's unique functionality.

-   **Structured Output with `responseSchema`:** This is the most important design choice in the service. By defining a strict JSON schema for the AI's response, we dramatically increase the reliability of the output. Instead of getting a block of text that we have to parse, we get a validated JSON object directly from the API. This is essential for both the dynamic scenario generation and the Quest Maker's outline generation.
-   **Externalized Prompts (`/prompts`):** Prompts are not hardcoded in TypeScript. They live in separate `.txt` files. This makes them easy for developers to read, edit, and fine-tune without altering the application logic.
-   **Dynamic Prompt Population:** The service uses a simple `fetchAndPopulatePrompt` helper to load a prompt template and inject runtime context (like the quest's theme or a player's current location) before sending it to the API. This makes the AI's responses highly contextual.
-   **Dynamic API Key:** The service is initialized on-demand using the key from `apiKeyService.ts`. This allows the user to provide their own key at runtime, a critical feature for a public-facing application that doesn't have its own backend key management.

## 6. Game Data Structure (`types.ts` & `quest.json`)

-   **`types.ts` as Single Source of Truth:** All data structures (`Player`, `QuestConfig`, `Scenario`, etc.) are defined with TypeScript interfaces in this single file. This provides strong typing and self-documentation for the entire application.
-   **The `QuestConfig` Object:** This is the heart of the engine's extensibility. The entire game is hydrated from this object. By adding new fields to this configuration and teaching the components how to interpret them, new features can be added without changing the core game loop.
-   **Lowercase Resource Keys:** In `resourceChanges` objects throughout the application, the keys (resource names) are always converted to lowercase (e.g., `"money": -10`). This makes the AI's job easier, as it doesn't have to perfectly match the casing of the resource names defined by the user (e.g., "Money" vs "money"). The application code handles this consistently.
