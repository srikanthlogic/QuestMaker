import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: ['**/__tests__/**/*.(spec|test).(ts|tsx)'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
        useESM: true,
        diagnostics: true
      }
    ]
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleNameMapper: {
    // CSS and asset stubs
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png|jpg|jpeg|webp)$': '<rootDir>/tests/__mocks__/fileMock.js',
    // ESM-only module mock to avoid parsing ESM in Node CJS test runtime
    '^@google/genai$': '<rootDir>/tests/__mocks__/googleGenAiMock.ts'
  },
  collectCoverage: true,
  collectCoverageFrom: [
    // Focus coverage collection on source directories to avoid dragging entire app before tests exist
    'components/**/*.tsx',
    'services/**/*.ts',
    '!**/index.ts',
    '!**/*.d.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'json', 'clover'],
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 20,
      lines: 20,
      statements: 20
    }
  },
  testTimeout: 20000,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  fakeTimers: { enableGlobally: true }
};

export default config;