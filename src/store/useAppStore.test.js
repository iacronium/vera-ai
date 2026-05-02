// Feature: synthesized-ether-full-functionality
// Unit tests for AppStore — initial state, addLead, logout

import { describe, it, expect, beforeEach, vi } from 'vitest';
import useAppStore from './useAppStore';

// ─── Default values (mirrored from store) ─────────────────────────────────────

const defaultMetrics = {
  totalInteractions: 0,
  conversionRate: 0,
  avgSessionTime: 0,
  sentimentDistribution: { positive: 0, neutral: 0, negative: 0 },
  history: [],
};

const defaultAIPreferences = {
  salesModel: 'gpt-4o',
  sandboxModel: 'llama-3-70b',
  temperature: 0.7,
  maxTokens: 1024,
  openaiKey: '',
  groqKey: '',
};

const defaultNotificationPrefs = {
  newLead: true,
  agentStatusChange: true,
  weeklyEmailSummary: false,
};

const defaultProfile = {
  agencyName: 'My Agency',
  email: '',
  avatarUrl: '',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resetStore() {
  useAppStore.setState({
    session: null,
    leads: [],
    metrics: { ...defaultMetrics },
    aiPreferences: { ...defaultAIPreferences },
    notificationPrefs: { ...defaultNotificationPrefs },
    profile: { ...defaultProfile },
    unreadNotifications: 0,
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AppStore unit tests', () => {
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

  // ── Initial state ────────────────────────────────────────────────────────────

  describe('initial state', () => {
    it('has a null session', () => {
      const { session } = useAppStore.getState();
      expect(session).toBeNull();
    });

    it('has an empty leads array', () => {
      const { leads } = useAppStore.getState();
      expect(leads).toEqual([]);
    });

    it('has default metrics', () => {
      const { metrics } = useAppStore.getState();
      expect(metrics).toEqual(defaultMetrics);
    });

    it('has default AI preferences', () => {
      const { aiPreferences } = useAppStore.getState();
      expect(aiPreferences).toEqual(defaultAIPreferences);
    });

    it('has default notification preferences', () => {
      const { notificationPrefs } = useAppStore.getState();
      expect(notificationPrefs).toEqual(defaultNotificationPrefs);
    });

    it('has default profile', () => {
      const { profile } = useAppStore.getState();
      expect(profile).toEqual(defaultProfile);
    });

    it('has zero unread notifications', () => {
      const { unreadNotifications } = useAppStore.getState();
      expect(unreadNotifications).toBe(0);
    });

    it('exposes all required action functions', () => {
      const state = useAppStore.getState();
      expect(typeof state.login).toBe('function');
      expect(typeof state.logout).toBe('function');
      expect(typeof state.addLead).toBe('function');
      expect(typeof state.clearLeads).toBe('function');
      expect(typeof state.incrementInteraction).toBe('function');
      expect(typeof state.setAIPreferences).toBe('function');
      expect(typeof state.setNotificationPrefs).toBe('function');
      expect(typeof state.setProfile).toBe('function');
      expect(typeof state.clearNotifications).toBe('function');
    });
  });

  // ── addLead ──────────────────────────────────────────────────────────────────

  describe('addLead', () => {
    const sampleLead = {
      id: 'lead-1',
      name: 'Alice',
      company: 'Acme',
      intent: 'high',
      capturedAt: new Date().toISOString(),
      sessionId: 'session-abc',
    };

    it('appends a lead to the leads array', () => {
      useAppStore.getState().addLead(sampleLead);
      const { leads } = useAppStore.getState();
      expect(leads).toHaveLength(1);
      expect(leads[0]).toEqual(sampleLead);
    });

    it('appends multiple leads in order', () => {
      const lead2 = { ...sampleLead, id: 'lead-2', name: 'Bob' };
      useAppStore.getState().addLead(sampleLead);
      useAppStore.getState().addLead(lead2);
      const { leads } = useAppStore.getState();
      expect(leads).toHaveLength(2);
      expect(leads[0]).toEqual(sampleLead);
      expect(leads[1]).toEqual(lead2);
    });

    it('does not mutate existing leads when adding a new one', () => {
      useAppStore.getState().addLead(sampleLead);
      const leadsBefore = useAppStore.getState().leads;
      const lead2 = { ...sampleLead, id: 'lead-2', name: 'Bob' };
      useAppStore.getState().addLead(lead2);
      // The first snapshot should still have only one entry
      expect(leadsBefore).toHaveLength(1);
    });

    it('increments unreadNotifications when notificationPrefs.newLead is true', () => {
      // Default notificationPrefs.newLead is true
      useAppStore.getState().addLead(sampleLead);
      expect(useAppStore.getState().unreadNotifications).toBe(1);
    });

    it('does not increment unreadNotifications when notificationPrefs.newLead is false', () => {
      useAppStore.setState({ notificationPrefs: { ...defaultNotificationPrefs, newLead: false } });
      useAppStore.getState().addLead(sampleLead);
      expect(useAppStore.getState().unreadNotifications).toBe(0);
    });
  });

  // ── logout ───────────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('sets session to null', () => {
      useAppStore.setState({
        session: { token: 'tok', user: { name: 'Alice', email: 'alice@example.com', avatarUrl: '' } },
      });
      useAppStore.getState().logout();
      expect(useAppStore.getState().session).toBeNull();
    });

    it('clears the leads array', () => {
      useAppStore.setState({
        leads: [{ id: 'lead-1', name: 'Alice' }],
      });
      useAppStore.getState().logout();
      expect(useAppStore.getState().leads).toEqual([]);
    });

    it('resets metrics to defaults', () => {
      useAppStore.setState({
        metrics: { ...defaultMetrics, totalInteractions: 5 },
      });
      useAppStore.getState().logout();
      expect(useAppStore.getState().metrics).toEqual(defaultMetrics);
    });

    it('resets unreadNotifications to 0', () => {
      useAppStore.setState({ unreadNotifications: 3 });
      useAppStore.getState().logout();
      expect(useAppStore.getState().unreadNotifications).toBe(0);
    });

    it('clears both session and leads when both are set', () => {
      useAppStore.setState({
        session: { token: 'tok', user: { name: 'Alice', email: 'alice@example.com', avatarUrl: '' } },
        leads: [{ id: 'lead-1', name: 'Alice' }, { id: 'lead-2', name: 'Bob' }],
      });
      useAppStore.getState().logout();
      const { session, leads } = useAppStore.getState();
      expect(session).toBeNull();
      expect(leads).toEqual([]);
    });
  });
});
