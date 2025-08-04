# QuestCraft

QuestCraft is a generic, interactive board game engine designed to create and play educational, "serious games" similar in style to Monopoly. Players navigate a game board, encounter scenarios, make choices with real consequences, and manage resources. The engine is powered by React, TypeScript, and Google's Gemini API for dynamic content generation.

## ❗️ Important: Gemini API Key

Many of QuestCraft's core features, including the **Quest Maker** and **on-the-fly scenario generation**, are powered by the Google Gemini API. To use these features, you must provide your own Gemini API key.

-   **How to add your key:**
    1.  Load any existing quest (e.g., "Aadhaar Quest").
    2.  This will take you to the "Game Settings" screen.
    3.  Find the "Gemini API Key" section, paste your key, and click "Save".
-   **Security:** Your key is stored securely in your browser's `sessionStorage` and is **never** sent to any server other than Google's API. It is cleared when you close the tab.

## Features

-   **Interactive Gameplay:** A classic roll-and-move board game experience.
-   **Dynamic Scenarios:** Landing on property spaces can generate unique, AI-powered scenarios tailored to the game's theme.
-   **Resource Management:** Players must balance multiple resources (e.g., money, time, security) to stay in the game.
-   **Highly Customizable:** The entire game—from board spaces and player resources to chance cards and educational content—is defined by a single JSON configuration file.
-   **Built-in Quest Maker:** An AI-powered, step-by-step wizard allows anyone to create a new game quest from a simple idea.
-   **Pregenerated & Custom Content:** Quests can include pre-written scenarios for a controlled experience, which can be enabled, disabled, or supplemented with new user-created scenarios.
-   **In-Game Rules:** Access the rules of the current quest at any time via the "Rules" button in the game header.

## Included Quests

QuestCraft comes with two pre-built quests to demonstrate its capabilities:

1.  **Aadhaar Quest:** An interactive journey to understand the challenges and opportunities in India's massive biometric identity system.
2.  **Digital Payments Quest:** Explore the world of UPI, online scams, and digital finance in India.

## How to Play

1.  Open the application.
2.  From the **Quest Loader** screen, select one of the pre-built quests.
3.  On the **Game Settings** screen, add your Gemini API key (see above).
4.  Configure your game (number of players, names, etc.).
5.  Click "Start Game" and begin your journey!

## Creating Your Own Quest

You can create your own unique game experiences using QuestCraft. There are two primary ways to do this:

1.  **The Quest Maker Wizard (Recommended):** Use the built-in, AI-powered tool to generate a complete quest configuration from a simple text description. This requires a Gemini API key. See the **[Quest Maker Guide](./QUEST-MAKER.md)** for detailed instructions.
2.  **Manual JSON Creation:** For advanced users, you can write your own `quest.json` file from scratch or by modifying an existing one. Refer to the **[Quest Schema Documentation](./quest-schema.md)** for the full specification.

## For Developers

Interested in contributing to the QuestCraft engine itself? Check out our **[Developer Guide](./DEVELOP.md)** for instructions on setting up the project, understanding the architecture, and contributing.

## Technology

-   **Frontend:** React, TypeScript, Tailwind CSS
-   **AI Engine:** Google Gemini API (`@google/genai`)
-   **Dependencies:** Served via ESM from `esm.sh` (no local `node_modules` required).

---

Powered by Google Gemini.