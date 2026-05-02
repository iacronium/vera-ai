// Feature: synthesized-ether-full-functionality
// Property tests for AppStore lead addition and logout

import { describe, it, expect, beforeEach, vi } from 'vitest';
import fc from 'fast-check';
import useAppStore from './useAppStore';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const defaultMetrics = {
  totalInteractions: 0,
  conversionRate: 0,
  avgSessionTime: 0,
  sentimentDistribution: { positive: 0, neutral: 0, negative: 0 },
  history: [],
};

const defaultNotificationPrefs = {
  newLead: true,
  agentStatusChange: true,
  weeklyEmailSummary: false,
};

const initialState = {
  session: null,
  leads: [],
  metrics: { ...defaultMetrics },
  unreadNotifications: 0,
  notificationPrefs: { ...defaultNotificationPrefs },
};

// Reset store to a clean state before each test
function resetStore(overrides = {}) {
  useAppStore.setState({ ...initialState, ...overrides });
}

// ─── Arbitraries ──────────────────────────────────────────────────────────────

const intentArb = fc.constantFrom('low', 'medium', 'high');

const leadArb = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  company: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
  intent: intentArb,
  capturedAt: fc
    .integer({ min: 0, max: 4102444800000 }) // 1970-01-01 to 2100-01-01
    .map((ms) => new Date(ms).toISOString()),
  sessionId: fc.uuid(),
});

const sessionArb = fc.record({
  token: fc.string({ minLength: 1, maxLength: 64 }),
  user: fc.record({
    name: fc.string({ minLength: 1, maxLength: 50 }),
    email: fc.emailAddress(),
    avatarUrl: fc.constant(''),
  }),
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AppStore property tests', () => {
  beforeEach(() => {
    // Stub localStorage to prevent persist middleware side-effects
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
    resetStore();
  });

  // Feature: synthesized-ether-full-functionality, Property 2: AppStore lead addition is reflected in metrics
  it('Property 2: AppStore lead addition is reflected in metrics', () => {
    // Validates: Requirements 1.2, 1.3, 15.3
    fc.assert(
      fc.property(fc.array(leadArb, { minLength: 1, maxLength: 20 }), (leads) => {
        // Reset to a clean state for each run
        resetStore();

        const { addLead } = useAppStore.getState();

        // Add each lead in sequence
        for (const lead of leads) {
          addLead(lead);
        }

        const state = useAppStore.getState();

        // leads.length must equal the number of addLead calls
        expect(state.leads.length).toBe(leads.length);

        // metrics.totalInteractions must be incremented by the same count
        expect(state.metrics.totalInteractions).toBe(leads.length);
      }),
      { numRuns: 100 }
    );
  });

  // Feature: synthesized-ether-full-functionality, Property 3: AppStore logout clears session and leads
  it('Property 3: AppStore logout clears session and leads', () => {
    // Validates: Requirements 1.2, 1.3, 15.3
    fc.assert(
      fc.property(
        sessionArb,
        fc.array(leadArb, { minLength: 1, maxLength: 20 }),
        (session, leads) => {
          // Set up store with a non-null session and non-empty leads
          resetStore({ session, leads });

          // Verify preconditions
          const stateBefore = useAppStore.getState();
          expect(stateBefore.session).not.toBeNull();
          expect(stateBefore.leads.length).toBeGreaterThan(0);

          // Call logout
          useAppStore.getState().logout();

          const stateAfter = useAppStore.getState();

          // session must be null after logout
          expect(stateAfter.session).toBeNull();

          // leads must be empty after logout
          expect(stateAfter.leads).toEqual([]);
        }
      ),
      { numRuns: 100 }
    );
  });
});
