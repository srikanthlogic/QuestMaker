/**
 * Jest setup for React + RTL + TypeScript + a11y.
 */
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// NOTE: jest-axe matcher registration can cause issues across major versions of Jest/expect.
// To avoid global registration problems, import axe and assertions per-test instead.
// If needed later, enable the following lines and ensure compatibility of versions:
// import { toHaveNoViolations } from 'jest-axe';
// declare global {
//   // eslint-disable-next-line @typescript-eslint/no-namespace
//   namespace jest {
//     interface Matchers<R> {
//       toHaveNoViolations(): R;
//     }
//   }
// }
// expect.extend({ toHaveNoViolations });

// Configure RTL
configure({ asyncUtilTimeout: 3000 });

// Deterministic timers and randomness
// Jest config enables fake timers globally; ensure Date.now and Math.random can be controlled per test.
const realMathRandom = Math.random;
beforeEach(() => {
  // Use modern fake timers; tests can switch to real with jest.useRealTimers()
  jest.useFakeTimers();
  // Default predictable random
  let seed = 42;
  Math.random = () => {
    // simple LCG-ish deterministic generator
    seed = (seed * 1664525 + 1013904223) % 0xffffffff;
    return (seed & 0xffffff) / 0x1000000;
  };
});

afterEach(() => {
  Math.random = realMathRandom;
});

// Polyfill fetch if missing
if (!(global as any).fetch) {
  (global as any).fetch = async (_input: RequestInfo | URL, _init?: RequestInit) => {
    throw new Error('fetch was called in tests without a mock. Please mock global.fetch in the test.');
  };
}

// jsdom already provides localStorage/sessionStorage but guard with try/catch access used by code
// Provide minimal process.env for code paths relying on env
process.env = {
  ...process.env,
  NODE_ENV: process.env.NODE_ENV || 'test'
} as any;

// IntersectionObserver mock for components that might rely on it
if (!(global as any).IntersectionObserver) {
  (global as any).IntersectionObserver = class {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
  } as any;
}