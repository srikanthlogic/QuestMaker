
export enum BoardLocationType {
    START = "START",
    PROPERTY = "PROPERTY",
    CHANCE = "CHANCE",
    COMMUNITY_CHEST = "COMMUNITY_CHEST",
    UTILITY = "UTILITY",
    TAX = "TAX",
    JAIL = "JAIL",
    FREE_PARKING = "FREE_PARKING",
    GO_TO_JAIL = "GO_TO_JAIL",
}

export type LocalizedString = Record<string, string>;

export interface ResourceDefinition {
    name: LocalizedString; 
    icon: 'MoneyIcon' | 'TimeIcon' | 'InfoIcon';
    barColor: string; // Tailwind CSS class e.g., "bg-green-500"
    initialValue: number;
    minimumValue?: number;
    maximumValue?: number;
}

export interface BoardLocation {
    name: LocalizedString;
    description: LocalizedString;
    type: BoardLocationType;
    color?: string; // Tailwind CSS class e.g., "bg-yellow-600"
}

export interface Board {
    jailPosition: number;
    locations: BoardLocation[];
}

export interface ResourceChange {
    name: string; // This remains a simple string, should be the lowercase 'en' name
    value: number;
}

export interface ChanceCard {
    description: LocalizedString;
    resourceChanges: ResourceChange[];
}

export interface FooterSection {
    title: LocalizedString;
    content: LocalizedString;
}

export interface ChoiceOutcome {
    explanation: LocalizedString;
    resourceChanges: ResourceChange[];
}

export interface Choice {
    text: LocalizedString;
    outcome: ChoiceOutcome;
}

export interface ManagedScenario {
    id: string;
    title: LocalizedString;
    description: LocalizedString;
    choices: [Choice, Choice];
    sourceUrl?: string;
    sourceTitle?: LocalizedString;
    custom: boolean;
    enabled: boolean;
}

export type ScenariosByLocation = Record<string, ManagedScenario[]>;

export interface QuestConfig {
    name: LocalizedString;
    description: LocalizedString;
    positivity?: number;
    groundingInReality?: boolean;
    resources: ResourceDefinition[];
    playerColors: string[];
    board: Board;
    chanceCards: ChanceCard[];
    communityChestCards?: ChanceCard[];
    footerSections: FooterSection[];
    pregeneratedScenarios?: ScenariosByLocation;
}

export interface Player {
    id: number;
    name: string;
    color: string;
    position: number;
    resources: Record<string, number>;
    inJail: boolean;
    jailTurns: number;
    isBankrupt: boolean;
}

export type GamePhase = 
    | 'WELCOME'
    | 'DOCS'
    | 'QUEST_MAKER'
    | 'SETUP'
    | 'TURN_START'
    | 'DICE_ROLL'
    | 'PLAYER_MOVE'
    | 'SCENARIO_SOURCE_SELECTION'
    | 'GENERATING_SCENARIO'
    | 'CHANCE_CARD'
    | 'COMMUNITY_CHEST_CARD'
    | 'SCENARIO_CHOICE'
    | 'SCENARIO_OUTCOME'
    | 'TURN_END'
    | 'GAME_OVER';

export interface AIAuditLog {
    id: string;
    timestamp: string;
    mode: 'Quest Maker' | 'Dynamic Scenario (Grounded)' | 'Dynamic Scenario (Fictional)' | 'Pregenerated Scenarios' | 'Enhance Idea';
    prompt: string;
    systemInstruction?: string;
    response: string;
    error?: string | null;
    requestDetails?: Record<string, any>;
}

export interface AppStats {
    totalInputTokens: number;
    totalOutputTokens: number;
    totalCost: number;
    timePlayedInSeconds: number;
}

export type AiProviderId = 'gemini' | 'openai' | 'openrouter' | 'groq' | 'together' | 'custom';

export interface AiProviderSettings {
    providerId: AiProviderId;
    model: string;
    baseUrl?: string;
}

export type LanguageCode = 'en' | 'es' | 'hi' | 'ta';

export interface AppSettings {
    ai: AiProviderSettings;
    language: LanguageCode;
}
