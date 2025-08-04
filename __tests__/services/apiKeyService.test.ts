import { saveApiKey, getApiKey, clearApiKey } from '../../services/apiKeyService';

describe('apiKeyService.getApiKey()', () => {
  const KEY = 'test-key-123';

  beforeEach(() => {
    // Ensure clean storages
    sessionStorage.clear();
    (process.env as Record<string, string>).API_KEY = '';
  });

  it('returns key from sessionStorage when present', () => {
    sessionStorage.setItem('questcraft_gemini_api_key', KEY);
    expect(getApiKey()).toBe(KEY);
  });

  it('falls back to process.env.API_KEY when sessionStorage missing', () => {
    (process.env as Record<string, string>).API_KEY = 'ENV_KEY_ABC';
    expect(getApiKey()).toBe('ENV_KEY_ABC');
  });

  it('returns null when neither storage nor env has key', () => {
    expect(getApiKey()).toBeNull();
  });

  it('handles storage exceptions gracefully', () => {
    const original = sessionStorage.getItem;
    // Simulate storage throwing
    // @ts-ignore
    sessionStorage.getItem = () => { throw new Error('denied'); };
    expect(() => getApiKey()).not.toThrow();
    (process.env as Record<string, string>).API_KEY = 'ENV_FALLBACK';
    expect(getApiKey()).toBe('ENV_FALLBACK');
    // restore
    sessionStorage.getItem = original;
  });
});

describe('apiKeyService.saveApiKey() and clearApiKey()', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('saves a provided key to sessionStorage', () => {
    saveApiKey('abc');
    expect(sessionStorage.getItem('questcraft_gemini_api_key')).toBe('abc');
  });

  it('clears when empty string is passed', () => {
    sessionStorage.setItem('questcraft_gemini_api_key', 'x');
    saveApiKey('');
    expect(sessionStorage.getItem('questcraft_gemini_api_key')).toBeNull();
  });

  it('clearApiKey removes from sessionStorage and does not throw on errors', () => {
    sessionStorage.setItem('questcraft_gemini_api_key', 'x');
    clearApiKey();
    expect(sessionStorage.getItem('questcraft_gemini_api_key')).toBeNull();
  });
});