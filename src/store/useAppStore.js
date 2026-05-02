import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Default State ────────────────────────────────────────────────────────────

const defaultMetrics = {
  totalInteractions: 0,
  conversionRate: 0,
  avgSessionTime: 0,
  sentimentDistribution: { positive: 0, neutral: 0, negative: 0 },
  history: [], // session-only, not persisted
};

const defaultAIPreferences = {
  salesModel: 'llama-3.3-70b-versatile',
  sandboxModel: 'llama-3.3-70b-versatile',
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

// ─── Store ────────────────────────────────────────────────────────────────────

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const useAppStore = create(
  persist(
    (set, get) => ({
      // ── Auth slice ──────────────────────────────────────────────────────────
      session: null,

      login: async (credentials) => {
        const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.error || 'Login failed');
        }

        const data = await response.json();
        set({ session: data });
        localStorage.setItem('synthesized-ether-token', data.token);
        
        // Cargar datos después del login
        get().syncData();
      },

      logout: () => {
        set({
          session: null,
          leads: [],
          metrics: { ...defaultMetrics },
          unreadNotifications: 0,
        });
        localStorage.removeItem('synthesized-ether-token');
      },

      // ── Data Sync ───────────────────────────────────────────────────────────
      syncData: async () => {
        const token = get().session?.token;
        if (!token) return;

        try {
          const [leadsRes, metricsRes] = await Promise.all([
            fetch(`${BACKEND_URL}/api/data/leads`, { headers: { Authorization: `Bearer ${token}` } }),
            fetch(`${BACKEND_URL}/api/data/metrics`, { headers: { Authorization: `Bearer ${token}` } })
          ]);

          if (leadsRes.ok) {
            const leads = await leadsRes.json();
            set({ leads });
          }
          if (metricsRes.ok) {
            const metrics = await metricsRes.json();
            set({ metrics: { ...get().metrics, ...metrics } });
          }
        } catch (error) {
          console.error('Error syncing data:', error);
        }
      },

      // ── Leads slice ─────────────────────────────────────────────────────────
      leads: [],

      addLead: async (lead) => {
        const { notificationPrefs, session } = get();
        
        // Optimistic update
        set((state) => ({
          leads: [...state.leads, lead],
          unreadNotifications: notificationPrefs.newLead
            ? state.unreadNotifications + 1
            : state.unreadNotifications,
        }));

        // Backend sync
        if (session?.token) {
          fetch(`${BACKEND_URL}/api/data/leads`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.token}`
            },
            body: JSON.stringify(lead),
          });
        }
      },

      clearLeads: () => set({ leads: [] }),

      // ── Metrics slice ───────────────────────────────────────────────────────
      metrics: { ...defaultMetrics },

      incrementInteraction: () => {
        const currentMetrics = get().metrics;
        const newTotal = currentMetrics.totalInteractions + 1;
        
        set((state) => ({
          metrics: {
            ...state.metrics,
            totalInteractions: newTotal,
          },
        }));

        // Sync with backend (throttle could be added)
        const { session } = get();
        if (session?.token) {
          fetch(`${BACKEND_URL}/api/data/metrics`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.token}`
            },
            body: JSON.stringify({ ...get().metrics, totalInteractions: newTotal }),
          });
        }
      },

      // Nuevo: Análisis de sentimientos
      analyzeSentiment: (message) => {
        const text = message.toLowerCase();
        let sentiment = 'neutral';
        
        // Palabras positivas
        const positiveWords = [
          'excelente', 'perfecto', 'genial', 'fantástico', 'increíble', 'bueno', 'bien',
          'gracias', 'me gusta', 'interesante', 'útil', 'helpful', 'great', 'good',
          'excellent', 'perfect', 'amazing', 'wonderful', 'love', 'like', 'interested',
          'sí', 'si', 'yes', 'ok', 'vale', 'de acuerdo', 'correcto', 'exacto'
        ];
        
        // Palabras negativas
        const negativeWords = [
          'malo', 'terrible', 'horrible', 'no me gusta', 'odio', 'awful', 'bad',
          'hate', 'terrible', 'horrible', 'disgusting', 'no', 'nunca', 'never',
          'imposible', 'difícil', 'complicado', 'caro', 'expensive', 'problema',
          'error', 'fallo', 'issue', 'problem', 'wrong', 'incorrect'
        ];
        
        const positiveCount = positiveWords.filter(word => text.includes(word)).length;
        const negativeCount = negativeWords.filter(word => text.includes(word)).length;
        
        if (positiveCount > negativeCount) {
          sentiment = 'positive';
        } else if (negativeCount > positiveCount) {
          sentiment = 'negative';
        }
        
        // Actualizar métricas de sentimiento
        set((state) => {
          const currentDist = state.metrics.sentimentDistribution;
          const newDist = {
            positive: sentiment === 'positive' ? currentDist.positive + 1 : currentDist.positive,
            neutral: sentiment === 'neutral' ? currentDist.neutral + 1 : currentDist.neutral,
            negative: sentiment === 'negative' ? currentDist.negative + 1 : currentDist.negative,
          };
          
          return {
            metrics: {
              ...state.metrics,
              sentimentDistribution: newDist,
            },
          };
        });

        // Sync with backend
        const { session } = get();
        if (session?.token) {
          fetch(`${BACKEND_URL}/api/data/metrics`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.token}`
            },
            body: JSON.stringify(get().metrics),
          });
        }
      },

      // Nuevo: Actualizar tiempo de sesión
      updateSessionTime: (sessionDuration) => {
        set((state) => {
          const currentAvg = state.metrics.avgSessionTime;
          const totalSessions = state.metrics.totalInteractions || 1;
          const newAvg = ((currentAvg * (totalSessions - 1)) + sessionDuration) / totalSessions;
          
          return {
            metrics: {
              ...state.metrics,
              avgSessionTime: Math.round(newAvg),
            },
          };
        });

        // Sync with backend
        const { session } = get();
        if (session?.token) {
          fetch(`${BACKEND_URL}/api/data/metrics`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.token}`
            },
            body: JSON.stringify(get().metrics),
          });
        }
      },

      // ── AI Preferences slice ────────────────────────────────────────────────
      aiPreferences: { ...defaultAIPreferences },

      setAIPreferences: (prefs) => {
        set((state) => ({
          aiPreferences: { ...state.aiPreferences, ...prefs },
        }));
      },

      // ── Notification Preferences slice ──────────────────────────────────────
      notificationPrefs: { ...defaultNotificationPrefs },

      setNotificationPrefs: (prefs) => {
        set((state) => ({
          notificationPrefs: { ...state.notificationPrefs, ...prefs },
        }));
      },

      // ── Profile slice ───────────────────────────────────────────────────────
      profile: { ...defaultProfile },

      setProfile: (profile) => {
        set((state) => ({
          profile: { ...state.profile, ...profile },
        }));
      },

      // ── Agent Instructions slice ────────────────────────────────────────────
      agentInstructions: '',

      setAgentInstructions: (instructions) => set({ agentInstructions: instructions }),

      // ── Notification badge ──────────────────────────────────────────────────
      unreadNotifications: 0,

      clearNotifications: () => set({ unreadNotifications: 0 }),
    }),
    {
      name: 'synthesized-ether-store',
      // Persist only the specified slices; leads and metrics.history are session-only
      partialize: (state) => ({
        aiPreferences: state.aiPreferences,
        notificationPrefs: state.notificationPrefs,
        profile: state.profile,
        agentInstructions: state.agentInstructions,
        // Persist only the token from session, not the full user object
        session: state.session ? { token: state.session.token, user: state.session.user } : null,
      }),
    }
  )
);

// ─── Individual Selectors (avoid unnecessary re-renders) ─────────────────────

export const useSession = () => useAppStore((s) => s.session);
export const useLogin = () => useAppStore((s) => s.login);
export const useLogout = () => useAppStore((s) => s.logout);

export const useLeads = () => useAppStore((s) => s.leads);
export const useAddLead = () => useAppStore((s) => s.addLead);
export const useClearLeads = () => useAppStore((s) => s.clearLeads);

export const useMetrics = () => useAppStore((s) => s.metrics);
export const useIncrementInteraction = () => useAppStore((s) => s.incrementInteraction);
export const useAnalyzeSentiment = () => useAppStore((s) => s.analyzeSentiment);
export const useUpdateSessionTime = () => useAppStore((s) => s.updateSessionTime);

export const useAIPreferences = () => useAppStore((s) => s.aiPreferences);
export const useSetAIPreferences = () => useAppStore((s) => s.setAIPreferences);

export const useNotificationPrefs = () => useAppStore((s) => s.notificationPrefs);
export const useSetNotificationPrefs = () => useAppStore((s) => s.setNotificationPrefs);

export const useProfile = () => useAppStore((s) => s.profile);
export const useSetProfile = () => useAppStore((s) => s.setProfile);

export const useAgentInstructions = () => useAppStore((s) => s.agentInstructions);
export const useSetAgentInstructions = () => useAppStore((s) => s.setAgentInstructions);

export const useUnreadNotifications = () => useAppStore((s) => s.unreadNotifications);
export const useClearNotifications = () => useAppStore((s) => s.clearNotifications);

export default useAppStore;
