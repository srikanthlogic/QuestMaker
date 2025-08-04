


import { GoogleGenAI, Type } from "@google/genai";
import type { Player, Scenario, BoardLocation, QuestConfig, ResourceDefinition, ChanceCard } from '../types';
import { getApiKey } from './apiKeyService';

/**
 * Initializes and returns a GoogleGenAI instance using the currently stored API key.
 * Throws an error if no API key is found.
 */
const getAi = (): GoogleGenAI => {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("Gemini API key is not set. Please add it in the Settings menu.");
    }
    return new GoogleGenAI({ apiKey });
}

/**
 * Fetches a prompt template from a file and populates it with dynamic values.
 * @param promptPath - The path to the prompt template file.
 * @param replacements - A map of placeholder keys to their replacement values.
 * @returns The populated prompt string.
 */
const fetchAndPopulatePrompt = async (
  promptPath: string,
  replacements: Record<string, string>
): Promise<string> => {
  const response = await fetch(promptPath);
  if (!response.ok) {
    throw new Error(`Failed to fetch prompt: ${promptPath}`);
  }
  let promptText = await response.text();
  for (const key in replacements) {
    promptText = promptText.replace(new RegExp(`{{${key}}}`, "g"), replacements[key]);
  }
  return promptText;
};


// Generates the part of the schema for resource changes dynamically
const generateResourceSchema = (resources: ResourceDefinition[]) => {
  const properties = resources.reduce((acc, resource) => {
    // Use lowercase for keys to be robust
    acc[resource.name.toLowerCase()] = {
      type: Type.INTEGER,
      description: `Change in ${resource.name}. Can be positive, negative, or zero.`
    };
    return acc;
  }, {} as Record<string, object>);

  return {
    type: Type.OBJECT,
    properties,
    required: resources.map(r => r.name.toLowerCase())
  };
};


const generateResponseSchema = (questConfig: QuestConfig) => {
  const isGrounded = questConfig.groundingInReality ?? true;

  const properties: Record<string, any> = {
    title: {
      type: Type.STRING,
      description: "A short, catchy title for the scenario (3-5 words)."
    },
    description: {
      type: Type.STRING,
      description: "A detailed but concise description of the scenario a player faces. It should highlight a specific problem relevant to the quest's theme."
    },
    choices: {
      type: Type.ARRAY,
      description: "Exactly two choices for the player.",
      items: {
        type: Type.OBJECT,
        properties: {
          text: {
            type: Type.STRING,
            description: "The text for the player's choice (10-15 words)."
          },
          outcome: {
            type: Type.OBJECT,
            properties: {
              explanation: {
                type: Type.STRING,
                description: "A brief explanation of what happens as a result of this choice and why it affects the resources."
              },
              resourceChanges: generateResourceSchema(questConfig.resources)
            },
            required: ["explanation", "resourceChanges"]
          }
        },
        required: ["text", "outcome"]
      }
    }
  };

  if (isGrounded) {
    properties.sourceTitle = {
      type: Type.STRING,
      description: "The title of a real-world news article, report, or source that this scenario is based on. Be factual."
    };
    properties.sourceUrl = {
      type: Type.STRING,
      description: "A valid, real URL to the source that grounds this scenario. Be factual."
    };
  }
    
  return {
    type: Type.OBJECT,
    properties,
    required: ["title", "description", "choices"]
  };
};

export const generateScenario = async (player: Player, location: BoardLocation, questConfig: QuestConfig): Promise<Scenario> => {
  const isGrounded = questConfig.groundingInReality ?? true;
  
  const groundingInstructions = isGrounded
    ? "The scenario should be based on a real, documented issue. Provide the title and a valid URL of a news article, report, or study that documents this type of problem. Be factual. If no direct source is available, you may omit 'sourceTitle' and 'sourceUrl'."
    : "The scenario should be a creative, fictional situation that fits the theme. Do not provide a source URL or title.";

  const replacements = {
    quest_name: questConfig.name,
    quest_description: questConfig.description,
    resources: questConfig.resources.map(r => r.name).join(', '),
    player_type: player.type,
    location_name: location.name,
    location_description: location.description,
    positivity: (questConfig.positivity || 0.5).toString(),
    grounding_instructions: groundingInstructions
  };

  const prompt = await fetchAndPopulatePrompt('/prompts/scenario-prompt.txt', replacements);
  
  const responseSchema = generateResponseSchema(questConfig);

  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 1,
        topP: 0.95,
      },
    });

    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);
    
    if (!parsed.title || !parsed.description || !parsed.choices || parsed.choices.length !== 2) {
        throw new Error("Received malformed JSON from API");
    }

    // Add a unique ID for dynamic scenarios
    return { ...parsed, id: `dynamic-${Date.now()}` } as Scenario;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Fallback scenario with dynamic resources
    const fallbackResourceChanges = questConfig.resources.reduce((acc, resource, index) => {
        if (index === 0) acc[resource.name.toLowerCase()] = 0;
        if (index === 1) acc[resource.name.toLowerCase()] = -10;
        else acc[resource.name.toLowerCase()] = 0;
        return acc;
    }, {} as Record<string, number>);

    return {
      id: "fallback-error",
      title: "Unexpected Connection Error",
      description: `Your connection to the digital infrastructure flickered. A common issue. You lose some ${questConfig.resources[1]?.name || 'resources'}.`,
      choices: [
        {
          text: "Wait for the connection to stabilize",
          outcome: {
            explanation: `You spend hours waiting, a common frustration. ${questConfig.resources[1]?.name || 'Resources'} are lost.`,
            resourceChanges: fallbackResourceChanges
          }
        },
        {
          text: "Give up and try another day",
          outcome: {
            explanation: "Frustrated, you decide to cut your losses for the day. You save a little time but gain no ground.",
            resourceChanges: fallbackResourceChanges
          }
        }
      ]
    };
  }
};

export const generateQuestOutline = async (userInput: string): Promise<Partial<QuestConfig> & { summary: string, boardLocationIdeas: {name: string, description: string}[], boardSize: number }> => {
    const ai = getAi();
    const prompt = await fetchAndPopulatePrompt('/prompts/quest-outline-prompt.txt', { user_input: userInput });

    const resourceSchema = {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        icon: { type: Type.STRING, enum: ['MoneyIcon', 'TimeIcon', 'InfoIcon'] },
        barColor: { type: Type.STRING, description: "A Tailwind CSS class, e.g., 'bg-green-500'" },
        initialValue: { type: Type.INTEGER }
      },
      required: ['name', 'icon', 'barColor', 'initialValue']
    };

    const chanceCardSchema = {
        type: Type.OBJECT,
        properties: {
            description: { type: Type.STRING },
            resourceChanges: {
                type: Type.ARRAY,
                description: "An array of resource changes. Each object must have a 'name' and 'value'.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING, description: "The lowercase name of the resource to change." },
                        value: { type: Type.INTEGER, description: "The amount to change the resource by (can be negative)." }
                    },
                    required: ['name', 'value']
                }
            }
        },
        required: ['description', 'resourceChanges']
    };

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING, description: "A short, encouraging summary of the generated quest idea for the user." },
        name: { type: Type.STRING, description: "A catchy, thematic name for the quest." },
        description: { type: Type.STRING, description: "A one-sentence description of the quest's theme." },
        groundingInReality: { type: Type.BOOLEAN, description: "Set to true if scenarios should be based on real-world events, false for fantasy/fictional scenarios." },
        positivity: { type: Type.NUMBER, description: "A score from 0.0 (challenging) to 1.0 (positive) reflecting the game's tone." },
        resources: { type: Type.ARRAY, items: resourceSchema },
        chanceCards: { type: Type.ARRAY, items: chanceCardSchema },
        communityChestCards: { type: Type.ARRAY, items: chanceCardSchema },
        boardSize: { 
            type: Type.INTEGER, 
            enum: [20, 24, 28, 32, 36, 40], 
            description: "A suitable board size for the quest. Must be one of: 20, 24, 28, 32, 36, 40."
        },
        boardLocationIdeas: {
            type: Type.ARRAY,
            description: "An array of objects for the board's PROPERTY and UTILITY spaces. The number of ideas should equal `boardSize - 4`.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING }
                },
                required: ['name', 'description']
            }
        },
        footerSections: {
            type: Type.ARRAY,
            description: "An array of 2-3 sections for the game's footer, explaining rules, tips, or background.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    content: { type: Type.STRING, description: "Content for the section. Can contain simple HTML like <strong>, <ul>, <li>." }
                },
                required: ['title', 'content']
            }
        }
      },
      required: ['summary', 'name', 'description', 'groundingInReality', 'positivity', 'resources', 'chanceCards', 'boardLocationIdeas', 'footerSections', 'boardSize']
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.7,
            }
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);
        
        const processCards = (cards: any) => {
            if (cards && Array.isArray(cards)) {
                return cards.map((card: any) => {
                    if (card.resourceChanges && Array.isArray(card.resourceChanges)) {
                        const newResourceChanges = card.resourceChanges.reduce((acc: Record<string, number>, change: { name: string, value: number }) => {
                            if (change.name) {
                                acc[change.name.toLowerCase()] = change.value;
                            }
                            return acc;
                        }, {});
                        return { ...card, resourceChanges: newResourceChanges };
                    }
                    return card;
                });
            }
            return cards;
        };

        parsedJson.chanceCards = processCards(parsedJson.chanceCards);
        parsedJson.communityChestCards = processCards(parsedJson.communityChestCards);
        
        return parsedJson;

    } catch (error) {
        console.error("Error generating quest outline:", error);
        throw new Error("The AI failed to generate a quest outline. It might be too busy or the request was too complex. Please try refining your idea or try again later.");
    }
};