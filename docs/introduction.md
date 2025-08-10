# Welcome to QuestCraft!

QuestCraft is an interactive board game engine powered by generative AI. It transforms educational topics, training materials, or any creative idea into a playable, Monopoly-style board game that runs entirely in your browser.

Our goal is to make learning and content creation more engaging and hands-on through the power of play and generative AI.

## The Problem We Solve

Traditional learning methods often fall short when teaching complex, decision-driven skills.
-   **Static Content:** Slideshows and documents are passive and can't simulate real-world consequences.
-   **High Barrier to Entry:** Creating interactive tutorials usually requires custom code, backend servers, and significant development time.
-   **Lack of Engagement:** Learners can quickly become disengaged with non-interactive content.

QuestCraft tackles these challenges by providing a zero-setup, highly engaging platform for scenario-based learning.

## Core Concepts

-   **The Quest:** Every game is a "Quest" defined by a single `quest.json` file. This file contains everything: the board layout, player resources, story elements, and rules.
-   **The Game Engine:** A client-side application built with React that interprets a `quest.json` file and renders a fully playable game.
-   **The Quest Maker:** An AI-powered wizard that uses generative AI (supporting Google Gemini, OpenAI, and more) to generate a complete `quest.json` file from a simple text description of your idea.

## Key Features

-   **AI-Powered Creation:** Generate entire games from a single prompt using your preferred AI provider.
-   **Dynamic Scenarios:** Use Google Search grounding (with the Gemini provider) to create challenges based on real-world, up-to-the-minute events.
-   **Customizable:** Load pre-made quests, create your own with AI, or write the JSON by hand for full control.
-   **Serverless:** Runs entirely in the browser. No backend, no databases, no complex setup. Just open `index.html`.
-   **AI Audit Log:** Review all interactions with the AI, providing transparency for both developers and players.
