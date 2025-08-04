/**
 * Helper to run jest-axe checks with common configuration.
 * This helper avoids registering global matchers to prevent version mismatch issues.
 * It simply returns the axe results so tests can assert explicitly or register matchers locally.
 */
export const checkA11y = async (
  container: HTMLElement,
  axe: (c: HTMLElement, o?: any) => Promise<any>
) => {
  const results = await axe(container, {
    rules: {
      // Keep defaults strict; disable rules only if they are systematically noisy for jsdom
      'aria-allowed-attr': { enabled: true }
    }
  });
  return results;
};