// Feature: synthesized-ether-full-functionality, Property 4: AI preferences persist across store re-hydration

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import useAppStore from './useAppStore';

// ─── Arbitraries ──────────────────────────────────────────────────────────────

const salesModelArb = fc.constantFrom('gpt-4o', 'gpt-3.5-turbo', 'llama-3-70b');

const aiPreferencesArb = fc.record({
  salesModel: salesModelArb,
  sandboxModel: fc.constant('llama-3-70b'),
  temperature: fc.float({ min: 0, max: 1, noNaN: true }),
  maxTokens: fc.integer({ min: 1, max: 4096 }),
  openaiKey: fc.string({ minLength: 0, maxLength: 64 }),
  groqKey: fc.string({ minLength: 0, maxLength: 64 }),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STORE_KEY = 'synthesized-ether-store';

/**
 * Read the persisted state from the real jsdom localStorage.
 * Returns the parsed object or null if nothing is stored.
 */
function readPersistedState() {
  const raw = localStorage.getItem(STORE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Reset the store to a clean baseline and clear localStorage.
 */
function resetAll() {
  localStorage.clear();
  useAppStore.setState({
    aiPreferences: {
      salesModel: 'gpt-4o',
      sandboxModel: 'llama-3-70b',
      temperature: 0.7,
      maxTokens: 1024,
      openaiKey: '',
      groqKey: '',
    },
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AppStore AI preferences property tests', () => {
  beforeEach(() => {
    resetAll();
  });

  afterEach(() => {
    resetAll();
  });

  // Feature: synthesized-ether-full-functionality, Property 4: AI preferences persist across store re-hydration
  it('Property 4: AI preferences persist across store re-hydration', () => {
    // Validates: Requirements 1.4, 5.2
    fc.assert(
      fc.property(aiPreferencesArb, (prefs) => {
        // 1. Reset to a clean state for each run
        resetAll();

        // 2. Save the generated preferences via the store action
        useAppStore.getState().setAIPreferences(prefs);

        // 3. Verify the preferences were written to localStorage by the persist middleware
        const persisted = readPersistedState();
        expect(persisted).not.toBeNull();
        expect(persisted.state).toBeDefined();
        expect(persisted.state.aiPreferences).toMatchObject(prefs);

        // 4. Simulate re-hydration: manually set the store state from the persisted JSON
        //    (mirrors what persist middleware does on app startup)
        const storedPrefs = persisted.state.aiPreferences;
        useAppStore.setState({ aiPreferences: storedPrefs });

        // 5. Verify the re-hydrated store's aiPreferences equals the saved values
        const rehydratedPrefs = useAppStore.getState().aiPreferences;
        expect(rehydratedPrefs).toEqual(prefs);
      }),
      { numRuns: 100 }
    );
  });
});
