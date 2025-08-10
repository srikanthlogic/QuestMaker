

import { GoogleGenAI, Type } from "@google/genai";
import type { UsageMetadata } from '@google/genai';
import type { QuestConfig, Player, BoardLocation, ManagedScenario } from '../types';
import { auditLogService } from './auditLogService';
import { statsService } from './statsService';

// --- Helper to load and prepare prompts ---
const promptCache = new Map<string, string>();

const loadPrompt = async (path: string, replacements: Record<string, string | number> = {}): Promise<string> => {
    let template = promptCache.get(path);
    if (!template) {
        try {
            const response = await fetch(path);
            if (!response.ok) throw new Error(`Failed to fetch prompt: ${path}`);
            template = await response.text();
            promptCache.set(path, template);
        } catch (error) {
            console.error(error);
            // Fallback to a very basic prompt if fetch fails
            return `Generate content based on the user's request.`;
        }
    }

    // Replace placeholders like {key} with values from the replacements object
    return Object.entries(replacements).reduce((prompt, [key, value]) => {
        return prompt.replace(new RegExp(`{${key}}`, 'g'), String(value));
    }, template);
};


// --- Schemas for AI Responses ---

const resourceChangeSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "The lowercase name of the resource to change." },
        value: { type: Type.INTEGER, description: "The amount to change the resource by (can be negative)." },
    },
    required: ['name', 'value']
};

const resourceDefinitionSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "Display name of the resource, e.g., 'Money' or 'Credibility'." },
        icon: { type: Type.STRING, description: "The name of the icon component. Must be one of: 'MoneyIcon', 'TimeIcon', 'InfoIcon'." },
        barColor: { type: Type.STRING, description: "A Tailwind CSS background color class for the resource bar, e.g., 'bg-green-500'." },
        initialValue: { type: Type.INTEGER, description: "The starting value for this resource for all players, e.g., 100." },
        minimumValue: { type: Type.INTEGER, description: "The value at which a player goes bankrupt if this resource drops to it. Often 0." },
        maximumValue: { type: Type.INTEGER, description: "The maximum possible value for this resource." },
    },
    required: ['name', 'icon', 'barColor', 'initialValue']
};

const boardLocationSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "The name of the space, e.g., 'Local Market' or 'Server Outage'." },
        description: { type: Type.STRING, description: "A short description used by the AI to generate relevant scenarios." },
        type: { type: Type.STRING, description: "The type of space. Must be one of: 'START', 'PROPERTY', 'CHANCE', 'COMMUNITY_CHEST', 'UTILITY', 'TAX', 'JAIL', 'FREE_PARKING', 'GO_TO_JAIL'." },
        color: { type: Type.STRING, description: "For 'PROPERTY' spaces, a Tailwind CSS background color class for the color bar, e.g., 'bg-yellow-600'." },
    },
    required: ['name', 'description', 'type']
};

const chanceCardSchema = {
    type: Type.OBJECT,
    properties: {
        description: { type: Type.STRING, description: "The text displayed on the card." },
        resourceChanges: {
            type: Type.ARRAY,
            description: "An array of objects representing resource changes.",
            items: resourceChangeSchema,
        },
    },
    required: ['description', 'resourceChanges']
};

const footerSectionSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "The text for the button in the footer, e.g., 'Rules'." },
        content: { type: Type.STRING, description: "The content to display in the modal. Can contain simple HTML like `<ul>`, `<li>`, `<strong>`." },
    },
    required: ['title', 'content']
};

const questConfigSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "The creative and thematic title of the quest." },
        description: { type: Type.STRING, description: "A short, one-sentence tagline describing the quest's theme." },
        positivity: { type: Type.NUMBER, description: "A value from 0.0 (very challenging/dystopian) to 1.0 (very optimistic/hopeful). Defaults to 0.5." },
        groundingInReality: { type: Type.BOOLEAN, description: "Set to true if the quest is based on real-world events. This will influence scenario generation." },
        resources: {
            type: Type.ARRAY,
            description: "An array of 2-4 core resources players manage.",
            items: resourceDefinitionSchema,
        },
        playerColors: {
            type: Type.ARRAY,
            description: "An array of four Tailwind CSS text color classes for player tokens, e.g., 'text-red-600'.",
            items: { type: Type.STRING }
        },
        board: {
            type: Type.OBJECT,
            properties: {
                jailPosition: { type: Type.INTEGER, description: "The index of the 'JAIL' space in the locations array." },
                locations: {
                    type: Type.ARRAY,
                    description: "An array of location objects that make up the board spaces.",
                    items: boardLocationSchema,
                }
            },
            required: ['jailPosition', 'locations']
        },
        chanceCards: {
            type: Type.ARRAY,
            description: "An array of 'Chance' cards.",
            items: chanceCardSchema
        },
        communityChestCards: {
            type: Type.ARRAY,
            description: "An optional array of 'Community Chest' style cards.",
            items: chanceCardSchema
        },
        footerSections: {
            type: Type.ARRAY,
            description: "Content for informational modals in the game footer. Must include 'Rules' and 'About' sections.",
            items: footerSectionSchema
        }
    },
    required: ['name', 'description', 'resources', 'playerColors', 'board', 'chanceCards', 'footerSections']
};

const dynamicScenarioSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A short, catchy title for the scenario." },
        description: { type: Type.STRING, description: "A paragraph describing the situation the player is in." },
        choices: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                required: ["text", "outcome"],
                properties: {
                    text: { type: Type.STRING, description: "The text for the choice button." },
                    outcome: {
                        type: Type.OBJECT,
                        required: ["explanation", "resourceChanges"],
                        properties: {
                            explanation: { type: Type.STRING, description: "Text explaining the outcome of the choice." },
                            resourceChanges: {
                                type: Type.ARRAY,
                                description: "An array of objects representing resource changes.",
                                items: resourceChangeSchema
                            }
                        }
                    }
                }
            }
        },
        sourceUrl: { type: Type.STRING, description: "Optional: The URL of a source article or reference for this event." },
        sourceTitle: { type: Type.STRING, description: "Optional: The title of the source article." }
    },
    required: ["title", "description", "choices"]
};

const scenarioArraySchema = {
    type: Type.OBJECT,
    properties: {
        scenarios: {
            type: Type.ARRAY,
            description: "An array of generated scenarios.",
            items: dynamicScenarioSchema
        }
    },
    required: ["scenarios"]
}


// --- API Functions ---

export const generateQuestOutline = async (
    idea: string,
    numLocations: number,
    positivity: number,
    groundingInReality: boolean
): Promise<QuestConfig> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const systemInstruction = await loadPrompt('prompts/quest-outline-system.txt', {
        numLocations,
        positivity,
        groundingInReality: String(groundingInReality)
    });
    const userPrompt = `Generate a quest based on this idea: "${idea}"`;

    const logDetails = {
        mode: 'Quest Maker' as const,
        prompt: userPrompt,
        systemInstruction,
        requestDetails: { idea, numLocations, positivity, groundingInReality },
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userPrompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: questConfigSchema,
            }
        });

        const text = response.text;
        if (!text) {
            throw new Error("The API returned an empty response. This may be due to the safety policy.");
        }
        
        statsService.updateTokens(response.usageMetadata);
        auditLogService.addLog({ ...logDetails, response: text, error: null });

        const json = JSON.parse(text);

        // Enforce user-defined settings as a safeguard
        json.positivity = positivity;
        json.groundingInReality = groundingInReality;

        if (json.board && Array.isArray(json.board.locations)) {
            const jailIndex = json.board.locations.findIndex((loc: any) => loc.type === 'JAIL');
            if (jailIndex !== -1) {
                json.board.jailPosition = jailIndex;
            } else {
                // If AI forgot to add a jail, add one.
                const jailSpotIndex = Math.floor(json.board.locations.length / 2);
                json.board.locations[jailSpotIndex] = { name: "Jail", description: "In jail or just visiting", type: "JAIL" };
                json.board.jailPosition = jailSpotIndex;
            }
        }

        return json as QuestConfig;
    } catch (e: any) {
        auditLogService.addLog({ ...logDetails, response: '', error: e.message });
        throw e;
    }
};

export const generatePregeneratedScenarios = async (
    questConfig: Omit<QuestConfig, 'pregeneratedScenarios'>,
    location: BoardLocation,
    numScenarios: number,
): Promise<ManagedScenario[]> => {
    if (numScenarios <= 0) return [];
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const resourceNames = questConfig.resources.map(r => r.name.en.toLowerCase()).join(', ');
    const isGrounded = !!questConfig.groundingInReality;
    
    const promptPath = isGrounded
        ? 'prompts/pregenerated-scenarios-grounded.txt'
        : 'prompts/pregenerated-scenarios-fictional.txt';

    const prompt = await loadPrompt(promptPath, {
        questDescription: questConfig.description.en,
        locationName: location.name.en,
        locationDescription: location.description.en,
        resourceNames: resourceNames,
        numScenarios: numScenarios
    });

    const logDetails = {
        mode: 'Pregenerated Scenarios' as const,
        prompt,
        requestDetails: { 
            questName: questConfig.name.en,
            location: location.name.en,
            numScenarios,
            grounded: isGrounded
        },
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: isGrounded 
                ? { tools: [{ googleSearch: {} }] } 
                : { responseMimeType: "application/json", responseSchema: scenarioArraySchema },
        });

        const text = response.text;
         if (!text) {
            throw new Error("The API returned an empty response. This may be due to the safety policy.");
        }
        
        statsService.updateTokens(response.usageMetadata);
        auditLogService.addLog({ ...logDetails, response: text, error: null });

        let jsonText = text;
        if (isGrounded) {
            const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
            if (!jsonMatch || !jsonMatch[1]) {
                 try {
                    // Fallback: see if the whole response is a parsable JSON
                    JSON.parse(text);
                } catch(e) {
                    throw new Error("AI did not return a valid JSON object in the expected format.");
                }
            } else {
                jsonText = jsonMatch[1];
            }
        }

        const parsed = JSON.parse(jsonText);
        const scenarios: Omit<ManagedScenario, 'id'|'custom'|'enabled'>[] = parsed.scenarios || [];
        
        return scenarios.map((s, i) => ({
            ...s,
            id: `${location.name.en.toLowerCase().replace(/\s+/g, '-')}-${i}`,
            custom: false, 
            enabled: true,
        }));
    } catch (e: any) {
        auditLogService.addLog({ ...logDetails, response: '', error: e.message });
        throw e;
    }
};


export const generateDynamicScenario = async (questConfig: QuestConfig, player: Player, location: BoardLocation): Promise<ManagedScenario> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const resourceNames = questConfig.resources.map(r => r.name.en.toLowerCase()).join(', ');
    const promptReplacements = {
        questDescription: questConfig.description.en,
        locationName: location.name.en,
        locationDescription: location.description.en,
        resourceNames: resourceNames
    };

    if (questConfig.groundingInReality) {
        const prompt = await loadPrompt('prompts/dynamic-scenario-grounded.txt', promptReplacements);

        const logDetails = {
            mode: 'Dynamic Scenario (Grounded)' as const,
            prompt,
            requestDetails: { questName: questConfig.name.en, location: location.name.en },
        };

        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    tools: [{googleSearch: {}}],
                },
            });
            
            const text = response.text;
             if (!text) {
                throw new Error("The API returned an empty response. This may be due to the safety policy.");
            }

            statsService.updateTokens(response.usageMetadata);
            auditLogService.addLog({ ...logDetails, response: text, error: null });
            
            const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
            if (!jsonMatch || !jsonMatch[1]) {
                throw new Error("AI did not return a valid JSON object in the expected format.");
            }
            
            const scenarioData = JSON.parse(jsonMatch[1]);
            const source = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.[0]?.web;

            return {
                ...scenarioData,
                id: `dynamic-${Date.now()}`,
                sourceUrl: source?.uri,
                sourceTitle: source?.title || "Grounded in a real-world event",
                custom: true,
                enabled: true,
            };
        } catch(e: any) {
            auditLogService.addLog({ ...logDetails, response: '', error: e.message });
            throw e;
        }

    } else {
        const prompt = await loadPrompt('prompts/dynamic-scenario-fictional.txt', promptReplacements);

        const logDetails = {
            mode: 'Dynamic Scenario (Fictional)' as const,
            prompt,
            requestDetails: { questName: questConfig.name.en, location: location.name.en },
        };

        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: dynamicScenarioSchema,
                }
            });

            const text = response.text;
            if (!text) {
                throw new Error("The API returned an empty response. This may be due to the safety policy.");
            }
            
            statsService.updateTokens(response.usageMetadata);
            auditLogService.addLog({ ...logDetails, response: text, error: null });

            const scenarioData = JSON.parse(text);
            return {
                ...scenarioData,
                id: `dynamic-${Date.now()}`,
                custom: true,
                enabled: true,
            };
        } catch(e: any) {
            auditLogService.addLog({ ...logDetails, response: '', error: e.message });
            throw e;
        }
    }
};