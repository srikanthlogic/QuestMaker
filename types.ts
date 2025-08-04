import { GamePhaseEnum } from './constants';

export type Resources = Record<string, number>;

export interface Player {
  id: number;
  name: string;
  type: 'Citizen' | 'Government Official' | 'NGO Worker' | 'Tech Entrepreneur';
  resources: Resources;
  position: number;
  status: 'active' | 'bankrupt';
  color: string;
}

export const BoardLocationTypeEnum = {
  START: 'START',
  PROPERTY: 'PROPERTY',
  CHANCE: 'CHANCE',
  COMMUNITY_CHEST: 'COMMUNITY_CHEST',
  UTILITY: 'UTILITY',
  TAX: 'TAX',
  JAIL: 'JAIL',
  FREE_PARKING: 'FREE_PARKING',
  GO_TO_JAIL: 'GO_TO_JAIL',
} as const;

export type BoardLocationType = typeof BoardLocationTypeEnum[keyof typeof BoardLocationTypeEnum];

export interface BoardLocation {
  name: string;
  description: string;
  type: BoardLocationType;
  color?: string; // For property color bar
}

export type ResourceChanges = Record<string, number>;

export interface ChoiceOutcome {
  explanation: string;
  resourceChanges: ResourceChanges;
}

export interface Choice {
  text: string;
  outcome: ChoiceOutcome;
}

export interface Scenario {
  id: string; // Unique ID for management
  title: string;
  description: string;
  choices: [Choice, Choice];
  sourceUrl?: string;
  sourceTitle?: string;
  custom?: boolean; // Flag for user-added scenarios
}

// For scenario management UI
export interface ManagedScenario extends Scenario {
    enabled: boolean;
}

export type ScenariosByLocation = Record<string, ManagedScenario[]>;


export interface ChanceCard {
  description: string;
  resourceChanges: ResourceChanges;
}

export type GamePhase = typeof GamePhaseEnum[keyof typeof GamePhaseEnum];

export interface GameSettings {
    numPlayers: number;
    initialResources: Resources;
    playerNames: string[];
    scenarioSource: 'dynamic' | 'pregenerated';
}

// New types for generic quest configuration

export interface ResourceDefinition {
  name: string;
  icon: string; // Name of the icon component, e.g., "MoneyIcon"
  barColor: string; // Tailwind CSS class, e.g., "bg-green-500"
  initialValue: number;
}

export interface FooterSection {
  title: string;
  content: string; // Can contain basic HTML
}

export interface QuestConfig {
  name: string;
  description:string;
  resources: ResourceDefinition[];
  playerColors: string[];
  board: {
    locations: BoardLocation[];
    jailPosition: number;
  };
  chanceCards: ChanceCard[];
  communityChestCards?: ChanceCard[];
  footerSections: FooterSection[];
  pregeneratedScenarios: ScenariosByLocation;
  positivity?: number; // 0.0 (challenging) to 1.0 (positive)
  groundingInReality?: boolean; // If true, AI will try to find real-world sources for scenarios.
}