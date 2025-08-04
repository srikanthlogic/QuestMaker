# QuestCraft Maker Guide

Welcome, Quest Maker! This guide will walk you through creating your very own interactive board game using the QuestCraft engine. You don't need to be a programmer to create a compelling and educational game.

There are two ways to create a quest: using the **Quest Maker Wizard** or by **manually creating a JSON file**. We highly recommend the wizard for all users.

## Method 1: The Quest Maker Wizard (Recommended)

The Quest Maker is an AI-powered, step-by-step tool that builds the entire game for you based on your ideas.

### Step 1: Launch the Wizard

From the main QuestCraft home screen, click the **"Launch Quest Maker"** button. This will take you to the creator interface.

### Step 2: Refine Your Idea with AI

This is the most important step!
1.  In the text box, describe the game you want to create. Be as descriptive as possible.
    -   **Good Example:** "A game about the challenges of freelance work. Players have to balance finding new clients (Money), managing their health and stress (Well-being), and learning new skills to stay relevant (Skills)."
    -   **Bad Example:** "A game about work."
2.  Click the **"Generate Outline"** button.
3.  The Gemini AI will process your idea and generate a complete outline, including a name, description, player resources, thematic board spaces, and chance cards.
4.  Review the AI's suggestion. If you like it, click **"Next"** to proceed. You'll be able to edit every detail in the following steps.

### Step 3: Edit the Details

The wizard will now guide you through several screens where you can review and edit every aspect of the AI's generated quest:

-   **Basics:** Change the name, description, and "positivity" score (which influences how hard the game feels).
-   **Resources:** Add, remove, or edit the player resources. You can change their names, icons, and starting values.
-   **Board:** Customize the names, descriptions, types, and colors of each space on the board.
-   **Chance / Community Chest:** Write or edit the text and effects of all the chance cards.
-   **Footer:** Edit the content for the "Rules" and "About" sections.

### Step 4: Finish and Play!

On the final screen, you'll see the complete `quest.json` file that the wizard has created. You have two options:

1.  **Download quest.json:** Save the file to your computer. This is great for sharing your quest with others or for editing it manually later.
2.  **Load & Play:** Immediately start a new game with the quest you just created!

## Method 2: Manual JSON Creation (Advanced)

For those who prefer to work with the raw data, you can create or edit a `quest.json` file directly.

1.  **Understand the Schema:** The quest file has a very specific structure. Please read our **[Quest Schema Documentation](./quest-schema.md)** to understand every field and its purpose.
2.  **Create or Edit a File:** The easiest way to start is to download the `quest.json` file from one of the existing quests (like Aadhaar Quest) or one you've made with the wizard, and then edit it in a text editor like VS Code.
3.  **Load Your Quest:** On the QuestCraft home screen, there is a "Load from JSON" text area. Paste the entire contents of your custom `quest.json` file into this box. If the JSON is valid, the app will immediately take you to the game setup screen for your new quest.

## Sharing Your Quest

Once you've created a `quest.json` file, you can easily share it with others! Just send them the file, and they can load it into their copy of QuestCraft using the "Load from JSON" paste box. Happy creating!