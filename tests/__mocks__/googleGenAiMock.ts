/**
 * Jest stub for @google/genai ESM package to avoid parsing ESM in Jest CJS runtime.
 * We only mock what services/geminiService.ts consumes: GoogleGenAI class and Type enum-like.
 */
export class GoogleGenAI {
  models = {
    generateContent: async (_: any) => {
      // Default stub returns minimal valid JSON to unblock tests that don't override this mock.
      return {
        text: JSON.stringify({
          title: 'Stub Scenario',
          description: 'Stub description',
          choices: [
            { text: 'A', outcome: { explanation: 'E1', resourceChanges: { money: 0, time: 0 } } },
            { text: 'B', outcome: { explanation: 'E2', resourceChanges: { money: 0, time: 0 } } }
          ]
        })
      } as any;
    }
  };
  constructor(_opts?: any) {}
}

// Minimal Type constants referenced when building schema in geminiService
export const Type = {
  STRING: 'string',
  OBJECT: 'object',
  ARRAY: 'array',
  INTEGER: 'integer',
  NUMBER: 'number',
  BOOLEAN: 'boolean'
} as const;