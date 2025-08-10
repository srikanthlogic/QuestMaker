# Privacy & Data Safety

At QuestCraft, we are deeply committed to your privacy and the security of your data. This page explains what data the application handles, where it's stored, and how you can control it.

## Client-Side Architecture

The most important thing to understand about QuestCraft is that it is a **100% client-side application**. This means:

-   **No Servers:** We do not operate any backend servers to run the game or store your data. The entire application runs directly in your web browser.
-   **No Data Collection:** We do not collect, track, or store any of your personal information or gameplay data on our servers. What happens in your browser stays in your browser.

## Data Stored in Your Browser (`localStorage`)

To provide a seamless experience, QuestCraft uses your browser's `localStorage`. This is a standard web feature that allows websites to store data on your own computer. Here is a complete list of what we store:

1.  **AI Provider Settings (`questcraft-ai-settings`):**
    *   **What it is:** Your selected AI provider (e.g., Google Gemini), your API key, and the model name you've configured.
    *   **How it's used:** Your API key is required to make requests to the AI service you choose (e.g., Google or OpenAI). It is sent **directly from your browser to the provider's API endpoint** and is never transmitted to or through any server owned by us.
    *   **Security:** While stored in your browser's `localStorage`, it's important to use API keys with appropriate permissions and to be on a secure computer.

2.  **Custom Quests (`questcraft-custom-quests`):**
    *   **What it is:** The full JSON configuration for any quests you create with the Quest Maker or load manually.
    *   **How it's used:** This allows you to save your creations and play them later without needing to generate them again or paste the JSON every time.

3.  **AI Audit Log (`questcraft-ai-audit-log`):**
    *   **What it is:** A log of all requests sent to the AI provider, including the prompts, the AI's responses, and any errors.
    *   **How it's used:** This provides transparency and helps you debug the AI's behavior.

4.  **Usage Statistics (`questcraft-usage-stats`):**
    *   **What it is:** An aggregated, anonymous count of token usage, estimated cost, and time played.
    *   **How it's used:** This helps you keep track of your API usage.

## How to Control Your Data

You have complete control over the data stored in your browser.

-   **Viewing & Clearing Logs:** You can view the AI Audit Log from the **Settings** menu and clear all logs from there.
-   **Deleting Custom Quests:** You can manage and delete your saved custom quests from the **Settings** menu.
-   **Complete Reset:** The **"Reset Application & Clear All Data"** button in the **Settings** menu will completely wipe all of the above data from your browser's `localStorage`, returning the app to its default state.

Your privacy is paramount. By running entirely on the client side, we aim to give you both a powerful tool and complete control over your information.
