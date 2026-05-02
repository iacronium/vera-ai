# Design Document — Synthesized Ether Full Functionality

## Overview

This document describes the technical design to transform the Synthesized Ether AI application from a fully static/mock React SPA into a production-ready, fully functional application. The scope covers 15 requirements: global state management, real AI API integrations, four functional Settings sections, four functional Help sections, authentication with session persistence, a dedicated `/metrics` route, robust avatar management, and a Vitest + React Testing Library test suite.

The application is a React 18 + Vite 5 + Tailwind CSS v3 SPA using a custom glassmorphism / Material You design system. The existing stack (React Router v6, Framer Motion, Lucide React, clsx, tailwind-merge) is preserved. No new UI framework or CSS library is introduced.

All new functionality is layered on top of the existing component tree with minimal structural disruption. The guiding principle is **progressive enhancement**: each requirement is self-contained and can be implemented and tested independently.

---

## Architecture

### High-Level Structure

```
src/
├── store/
│   └── useAppStore.js          # Zustand store (AppStore)
├── services/
│   ├── aiService.js            # OpenAI / Groq API calls
│   └── pdfService.js           # PDF text extraction (pdf.js)
├── hooks/
│   ├── useAuth.js              # Auth helpers derived from AppStore
│   └── useAIModel.js           # AI model config helpers
├── components/
│   ├── Avatar.jsx              # AvatarManager component
│   ├── AIPulse.jsx             # (existing, unchanged)
│   ├── Layout.jsx              # (updated: Avatar, notifications, auth)
│   └── ProtectedRoute.jsx      # Route guard
├── pages/
│   ├── LandingPage.jsx         # (unchanged)
│   ├── LoginPage.jsx           # NEW
│   ├── Dashboard.jsx           # (updated: reads from AppStore)
│   ├── Metrics.jsx             # NEW
│   ├── SalesChat.jsx           # (updated: real AI calls)
│   ├── Sandbox.jsx             # (updated: real Groq calls + PDF)
│   ├── Settings.jsx            # (updated: four functional sections)
│   └── Help.jsx                # (updated: four functional sections)
└── App.jsx                     # (updated: auth guards, /metrics route)
```

### Data Flow

```
User Action
    │
    ▼
React Component
    │  reads/writes
    ▼
AppStore (Zustand)  ◄──── localStorage (persist middleware)
    │
    ├── aiService.js  ──► OpenAI / Groq API
    └── pdfService.js ──► pdf.js (browser)
```

### Authentication Flow

```
App loads
    │
    ▼
AuthManager reads localStorage token
    │
    ├── token valid ──► restore session in AppStore ──► render protected routes
    └── no token    ──► render <LoginPage>
                            │
                            ▼
                        user submits credentials
                            │
                            ├── valid ──► store token ──► redirect to original route
                            └── invalid ──► show error (no detail leak)
```

---

## Components and Interfaces

### AppStore (Zustand)

```js
// src/store/useAppStore.js
{
  // Auth slice
  session: null | { token: string, user: { name, email, avatarUrl } },
  login: (credentials) => void,
  logout: () => void,

  // Leads slice
  leads: Lead[],
  addLead: (lead: Lead) => void,
  clearLeads: () => void,

  // Metrics slice
  metrics: {
    totalInteractions: number,
    conversionRate: number,
    avgSessionTime: number,
    sentimentDistribution: { positive: number, neutral: number, negative: number },
    history: MetricPoint[],
  },
  incrementInteraction: () => void,

  // AI Preferences slice
  aiPreferences: {
    salesModel: 'gpt-4o' | 'gpt-3.5-turbo' | 'llama-3-70b',
    sandboxModel: 'llama-3-70b',
    temperature: number,       // 0.0–1.0
    maxTokens: number,
    openaiKey: string,
    groqKey: string,
  },
  setAIPreferences: (prefs: Partial<AIPreferences>) => void,

  // Notification preferences slice
  notificationPrefs: {
    newLead: boolean,
    agentStatusChange: boolean,
    weeklyEmailSummary: boolean,
  },
  setNotificationPrefs: (prefs: Partial<NotificationPrefs>) => void,

  // Profile slice
  profile: { agencyName: string, email: string, avatarUrl: string },
  setProfile: (profile: Partial<Profile>) => void,

  // Notification badge
  unreadNotifications: number,
  clearNotifications: () => void,
}
```

Persistence is handled by Zustand's `persist` middleware targeting `localStorage`. Only `aiPreferences`, `notificationPrefs`, `profile`, and `session.token` are persisted. The `leads` array and `metrics.history` are session-only by default (can be extended later).

### Avatar Component

```jsx
// src/components/Avatar.jsx
<Avatar
  src="https://..."       // optional URL
  name="Jordan M."        // used for initials + color
  size={40}               // px, default 40
  className="..."         // optional extra classes
/>
```

Behavior:
- Attempts to load `src` via `<img>`.
- On `onError`, falls back to a `<div>` with initials (first letter of each word, max 2) on a deterministic background color derived from `name` (hash → hue).
- Never shows a broken image icon.

### ProtectedRoute Component

```jsx
// src/components/ProtectedRoute.jsx
<ProtectedRoute>
  <SomePage />
</ProtectedRoute>
```

Reads `session` from AppStore. If null, redirects to `/login` while preserving the attempted path in `location.state.from`.

### aiService

```js
// src/services/aiService.js
export async function sendChatMessage({ messages, model, temperature, maxTokens, apiKey, provider })
// Returns: { content: string } | throws Error

export async function sendSandboxMessage({ messages, context, model, temperature, maxTokens, apiKey })
// Returns: { content: string } | throws Error
```

Both functions are thin wrappers over `fetch` targeting the respective provider's REST API. They never store or log the API key.

### pdfService

```js
// src/services/pdfService.js
export async function extractTextFromPDF(file: File): Promise<string>
```

Uses `pdfjs-dist` (browser build) to extract plain text from an uploaded PDF file. Returns the concatenated text of all pages.

---

## Data Models

```ts
// Lead
interface Lead {
  id: string;           // uuid
  name: string;
  company?: string;
  intent: 'low' | 'medium' | 'high';
  capturedAt: string;   // ISO timestamp
  sessionId: string;
}

// MetricPoint (for time-series chart)
interface MetricPoint {
  date: string;         // ISO date
  interactions: number;
  leads: number;
  conversionRate: number;
}

// ChatMessage
interface ChatMessage {
  id: number | string;
  sender: string;
  role: 'User' | 'AI';
  text: string;
  time: string;
  isError?: boolean;
}

// SupportTicket
interface SupportTicket {
  subject: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
}

// Session
interface Session {
  token: string;
  user: {
    name: string;
    email: string;
    avatarUrl: string;
  };
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Avatar initials are always visible for any non-empty name

*For any* non-empty string `name`, the `<Avatar>` component's fallback placeholder SHALL render a non-empty initials string (at least one character) derived from `name`.

**Validates: Requirements 15.7, 14.1**

---

### Property 2: AppStore lead addition is reflected in metrics

*For any* sequence of `addLead` calls on the AppStore, the `leads` array length SHALL equal the number of calls made, and `metrics.totalInteractions` SHALL be incremented by the same count.

**Validates: Requirements 1.2, 15.3**

---

### Property 3: AppStore logout clears session and leads

*For any* AppStore state that contains a non-null session and a non-empty leads array, calling `logout()` SHALL result in `session` being null and `leads` being an empty array.

**Validates: Requirements 1.3, 12.4, 15.3**

---

### Property 4: AI preferences persist across store re-hydration

*For any* set of AI preferences saved via `setAIPreferences`, re-hydrating the store from `localStorage` SHALL produce a store whose `aiPreferences` equals the saved values.

**Validates: Requirements 1.4, 5.2**

---

### Property 5: Support ticket form rejects empty required fields

*For any* submission of the SupportTicket form where `subject` or `description` is empty or whitespace-only, the form SHALL not submit and SHALL display at least one validation message.

**Validates: Requirements 11.3**

---

### Property 6: SalesChat disables input during API call

*For any* user message sent in SalesChat while an API call is in progress, the input field and send button SHALL remain disabled until the API call resolves or rejects.

**Validates: Requirements 2.4, 15.4**

---

## Error Handling

### AI API Errors
- Network failures and non-2xx responses from OpenAI/Groq are caught in `aiService`.
- The calling component (SalesChat, Sandbox) appends an error `ChatMessage` with `isError: true` to the message list.
- The error message is displayed inline in the chat with a distinct visual style (error color token).
- The input is re-enabled after the error so the user can retry.

### PDF Processing Errors
- If `pdfjs-dist` fails to parse the file (corrupt PDF, wrong format), `pdfService` throws a descriptive error.
- Sandbox catches this and shows an inline error in the process panel.

### Authentication Errors
- Invalid credentials: AuthManager shows a generic "Invalid email or password" message (no field-level detail to prevent enumeration).
- Token expiry: ProtectedRoute detects an invalid/expired token on route access and redirects to `/login`.

### Form Validation
- All forms (Profile, AI Preferences, Security, Support Ticket) use controlled inputs with inline validation messages.
- Validation runs on submit (not on every keystroke) to avoid noise.
- Empty API key saves are blocked with a warning; existing key is preserved.

### Avatar Load Errors
- `<img onError>` triggers the fallback immediately.
- The fallback is a pure CSS/JS solution — no additional network request.

---

## Testing Strategy

### Test Stack
- **Vitest** (test runner, compatible with Vite)
- **@testing-library/react** (component rendering and interaction)
- **@testing-library/user-event** (realistic user interactions)
- **@testing-library/jest-dom** (custom matchers)
- **fast-check** (property-based testing library)
- **jsdom** (browser environment for Vitest)
- **msw** (Mock Service Worker — mocks fetch calls to AI APIs in tests)

### Test Configuration
`vitest.config.js` sets `environment: 'jsdom'` and `globals: true`. The `npm test` script runs `vitest run` (single execution, no watch mode).

### Test Files

| File | What it tests |
|---|---|
| `src/components/Avatar.test.jsx` | Renders with valid src; fallback initials on error; empty name edge case |
| `src/store/useAppStore.test.js` | Initial state; addLead; logout clears session+leads; AI prefs persist |
| `src/pages/SalesChat.test.jsx` | Message send updates list; input disabled during API call; error message on API failure |
| `src/pages/LoginPage.test.jsx` | Redirect to login when no session; session restore from localStorage; invalid credentials error |
| `src/components/Avatar.property.test.jsx` | PBT: for any non-empty name, placeholder contains ≥1 initial character |

### Property-Based Test Configuration
- Library: **fast-check**
- Minimum iterations: **100** per property
- Tag format: `// Feature: synthesized-ether-full-functionality, Property N: <property_text>`

### Unit Test Balance
Unit tests cover specific examples and integration points. Property tests handle broad input coverage. The split avoids redundant example tests for behaviors already covered by properties.

### Dual Testing Approach
- **Unit tests**: specific examples (valid email, empty field, known API response shape)
- **Property tests**: universal invariants (Avatar initials, store consistency)
- **Integration tests** (manual / future): end-to-end AI API calls with real keys
