# QuestCraft Developer Guide

Welcome, developer! This guide provides instructions for setting up, running, and contributing to the QuestCraft engine.

## Project Overview

QuestCraft is a web-based board game engine built with modern frontend technologies. It is designed to be a single-page application that runs entirely in the browser.

### Core Technologies

-   **Framework:** [React 19](https://react.dev/) (using Hooks)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/) (loaded via CDN)
-   **AI Integration:** [Google Gemini API](https://ai.google.dev/) via the `@google/genai` SDK.
-   **Module System:** ES6 Modules with an `importmap` in `index.html`. This allows us to use packages directly from a CDN (`esm.sh`) without a local `node_modules` folder or a build step like Webpack/Vite.

## Getting Started

Because this project uses an `importmap` and loads all dependencies from a CDN, there is **no `npm install` step required**.

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/your-repo/questcraft.git
    cd questcraft
    ```

2.  **Set Up Environment Variables:**
    The application requires a Google Gemini API key to function. You must provide this key as an environment variable.
    - Create a mechanism to serve the `index.html` file while setting the `API_KEY` environment variable. The application code `process.env.API_KEY` will expect this variable to be available in its execution context.
    - **Note:** The `API_KEY` is a secret and should not be committed to version control.

3.  **Run the Application:**
    You can run the application by serving `index.html` from a local web server. A simple way to do this is with Python:
    ```bash
    # For Python 3
    python -m http.server
    ```
    Then, open your browser and navigate to `http://localhost:8000`. You will need to ensure your `API_KEY` is properly injected into the environment where the JavaScript runs.

## Project Structure

```
/
├── index.html              # Main entry point, contains the importmap and root div.
├── index.tsx               # Renders the main React App component.
├── App.tsx                 # Root component, manages game state and views.
├── metadata.json           # App metadata.
├── README.md               # Points to the main documentation.
|
├── components/             # Reusable React components.
│   ├── GameBoard.tsx
│   ├── PlayerDashboard.tsx
│   ├── ScenarioCard.tsx
│   └── ...
|
├── services/               # Modules for external services (e.g., Gemini API).
│   └── geminiService.ts
|
├── prompts/                # Text files for AI prompts.
│   ├── scenario-prompt.txt
│   └── quest-outline-prompt.txt
|
├── quests/                 # Default quest.json configuration files.
│   ├── aadhaar-quest.json
│   └── ...
|
├── docs/                   # All project documentation.
│   ├── README.md           # Main project overview.
│   ├── DEVELOP.md          # This guide for developers.
│   ├── QUEST-MAKER.md      # Guide for creating quests.
│   └── quest-schema.md     # Schema for quest.json files.
|
└── types.ts                # Core TypeScript type definitions.
└── constants.ts            # Game-wide constants (e.g., GamePhaseEnum).
```

### Key Components & Logic

-   **`App.tsx`:** The "brain" of the application. It's a state machine that controls the current view (`loader`, `setup`, `game`) and the current game phase (`START`, `ROLLING`, `SCENARIO_CHOICE`, etc.). All top-level game state (players, positions, etc.) is managed here.
-   **`services/geminiService.ts`:** This file contains all the logic for interacting with the Google Gemini API. It has functions for generating dynamic scenarios and for generating entire quest outlines in the Quest Maker. Note the use of `responseSchema` to enforce structured JSON output from the model.
-   **`types.ts`:** The single source of truth for all data structures used in the game, such as `Player`, `QuestConfig`, and `Scenario`.
-   **`quests/*.json`:** These files are the heart of each game's content. The app fetches them to initialize a new game session.

### AI Prompts

The prompts sent to the Google Gemini API are stored as plain text files in the `/prompts` directory. This makes them easy to read and modify without digging into the TypeScript code.

-   `scenario-prompt.txt`: The template for generating an in-game scenario.
-   `quest-outline-prompt.txt`: The template for generating a new quest outline in the Quest Maker.

These files use a simple `{{placeholder}}` syntax. The `geminiService.ts` fetches these files, replaces the placeholders with dynamic game data (like player type or quest name), and then sends the completed prompt to the AI. Modifying these prompts is the best way to change the tone, style, and structure of the AI-generated content.

## Contribution Guidelines

We welcome contributions! Please follow these steps:

1.  **Fork the repository.**
2.  **Create a new branch** for your feature or bug fix: `git checkout -b feature/my-new-feature` or `bugfix/issue-name`.
3.  **Make your changes.** Ensure your code is clean, well-commented, and follows the existing style.
4.  **Test your changes** thoroughly by playing through the game.
5.  **Commit your changes** with a clear and descriptive commit message.
6.  **Push to your fork** and **submit a pull request** to the main repository.