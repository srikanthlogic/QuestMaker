import { generateScenario, generateQuestOutline } from '../../services/geminiService';
import * as apiKeySvc from '../../services/apiKeyService';
import type { Player, BoardLocation, QuestConfig, ResourceDefinition } from '../../types';

// Helper deterministic quest config for tests
const resources: ResourceDefinition[] = [
  { name: 'Money', icon: 'MoneyIcon', barColor: 'bg-green-500', initialValue: 100 },
  { name: 'Time', icon: 'TimeIcon', barColor: 'bg-blue-500', initialValue: 100 },
  { name: 'Security', icon: 'InfoIcon', barColor: 'bg-gray-500', initialValue: 100 }
];

const baseQuest: QuestConfig = {
  name: 'Test Quest',
  description: 'A test quest',
  resources,
  playerColors: ['text-red-600', 'text-blue-600', 'text-green-600', 'text-purple-600'],
  board: {
    locations: [
      { name: 'Start', description: 'Start', type: 'START' },
      { name: 'Prop A', description: 'A', type: 'PROPERTY', color: 'bg-red-500' },
      { name: 'Chance', description: 'C', type: 'CHANCE' },
      { name: 'Jail', description: 'J', type: 'JAIL' },
    ],
    jailPosition: 3
  },
  chanceCards: [],
  communityChestCards: [],
  footerSections: [],
  pregeneratedScenarios: {},
  positivity: 0.5,
  groundingInReality: true
};

const player: Player = {
  id: 1,
  name: 'Alice',
  type: 'Citizen',
  resources: { Money: 100, Time: 100, Security: 100 },
  position: 0,
  status: 'active',
  color: 'text-red-600'
};
const location: BoardLocation = baseQuest.board.locations[1];

describe('geminiService.generateScenario()', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
    (global.fetch as any) = jest.fn(async () => ({
      ok: true,
      text: async () => 'PROMPT OK'
    })) as any;
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('falls back to static scenario when API key is missing', async () => {
    jest.spyOn(apiKeySvc, 'getApiKey').mockReturnValue(null);
    const result = await generateScenario(player, location, baseQuest);
    expect(result.id).toBe('fallback-error');
    expect(result.choices).toHaveLength(2);
  });

  it('returns parsed scenario when AI returns valid JSON', async () => {
    jest.spyOn(apiKeySvc, 'getApiKey').mockReturnValue('key');
    const result = await generateScenario(player, location, baseQuest);
    expect(result.choices.length).toBe(2);
  });

  it('falls back to static scenario when AI call errors', async () => {
    jest.spyOn(apiKeySvc, 'getApiKey').mockReturnValue('key');
    jest.doMock('@google/genai', () => {
      return {
        GoogleGenAI: class {
          models = { generateContent: async () => { throw new Error('AI down'); } };
          constructor(_: any) {}
        },
        Type: { STRING: 'string', OBJECT: 'object', ARRAY: 'array', INTEGER: 'integer', NUMBER: 'number', BOOLEAN: 'boolean' }
      };
    });
    const { generateScenario: impl } = await import('../../services/geminiService');
    const result = await impl(player, location, baseQuest);
    expect(result.id).toBe('fallback-error');
  });

  it('groundingInReality=false still succeeds without source', async () => {
    jest.spyOn(apiKeySvc, 'getApiKey').mockReturnValue('key');
    const quest = { ...baseQuest, groundingInReality: false };
    const result = await generateScenario(player, location, quest);
    expect(result.choices.length).toBe(2);
  });
});

describe('geminiService.generateQuestOutline()', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
    (global.fetch as any) = jest.fn(async () => ({
      ok: true,
      text: async () => 'PROMPT OK'
    })) as any;
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('returns outline using stubbed client and normalizes resourceChanges arrays', async () => {
    // Ensure API key present for outline path (service throws when missing)
    jest.doMock('../../services/apiKeyService', () => ({
      getApiKey: () => 'key',
      saveApiKey: jest.fn(),
      clearApiKey: jest.fn(),
    }));

    // Replace google stub to return our shaped outline JSON
    jest.doMock('@google/genai', () => {
      return {
        GoogleGenAI: class {
          models = {
            generateContent: async () => ({
              text: JSON.stringify({
                summary: 'S',
                name: 'N',
                description: 'D',
                groundingInReality: true,
                positivity: 0.6,
                resources: resources,
                chanceCards: [
                  { description: 'x', resourceChanges: [{ name: 'money', value: -5 }, { name: 'time', value: 3 }] }
                ],
                communityChestCards: [
                  { description: 'y', resourceChanges: [{ name: 'security', value: 2 }] }
                ],
                boardSize: 20,
                boardLocationIdeas: Array.from({ length: 16 }, (_, i) => ({ name: `L${i}`, description: 'desc' })),
                footerSections: [{ title: 't', content: 'c' }]
              })
            })
          };
          constructor(_: any) {}
        },
        Type: { STRING: 'string', OBJECT: 'object', ARRAY: 'array', INTEGER: 'integer', NUMBER: 'number', BOOLEAN: 'boolean' }
      };
    });

    // Dynamic import AFTER mocks
    const { generateQuestOutline: impl } = await import('../../services/geminiService');
    const outline = await impl('hello');

    expect(outline.chanceCards[0].resourceChanges.money).toBe(-5);
    expect(outline.chanceCards[0].resourceChanges.time).toBe(3);
    expect(outline.communityChestCards?.[0].resourceChanges.security).toBe(2);
  });
});