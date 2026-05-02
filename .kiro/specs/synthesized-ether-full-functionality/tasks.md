# Implementation Plan: Synthesized Ether Full Functionality

## Overview

Transform the Synthesized Ether AI React SPA from a fully static/mock application into a production-ready, fully functional product. Implementation follows a bottom-up approach: foundational infrastructure first (store, services, auth), then feature pages, then wiring and tests. Each task builds on the previous and ends with integrated, working code.

Tech stack: React 18, Vite 5, Tailwind CSS v3, React Router v6, Zustand, pdfjs-dist, fast-check, msw, vitest, @testing-library/react.

## Tasks

- [x] 1. Fix tailwind.config.js borderRadius and install missing dependencies
  - Replace the non-standard `borderRadius` values in `tailwind.config.js` with Tailwind's standard scale (`sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `full`) so that utility classes like `rounded-3xl` and `rounded-2xl` used throughout the app render correctly
  - Install all missing runtime and dev dependencies: `zustand`, `pdfjs-dist`, `vitest`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `fast-check`, `msw`, `jsdom`
  - Add `"test": "vitest run"` script to `package.json`
  - _Requirements: 15.1, 15.6_

- [x] 2. Create Zustand AppStore with persistence
  - [x] 2.1 Create `src/store/useAppStore.js` with all slices: auth (`session`, `login`, `logout`), leads (`leads`, `addLead`, `clearLeads`), metrics (`metrics`, `incrementInteraction`), AI preferences (`aiPreferences`, `setAIPreferences`), notification preferences (`notificationPrefs`, `setNotificationPrefs`), profile (`profile`, `setProfile`), and notification badge (`unreadNotifications`, `clearNotifications`)
    - Use Zustand `persist` middleware targeting `localStorage`; persist only `aiPreferences`, `notificationPrefs`, `profile`, and `session` (token only)
    - `leads` and `metrics.history` are session-only (not persisted)
    - Expose individual selectors per slice to avoid unnecessary re-renders
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 2.2 Write property test for AppStore lead addition and logout
    - **Property 2: AppStore lead addition is reflected in metrics** — for any sequence of `addLead` calls, `leads.length` equals the call count and `metrics.totalInteractions` is incremented by the same count
    - **Property 3: AppStore logout clears session and leads** — for any non-null session and non-empty leads array, calling `logout()` results in `session === null` and `leads === []`
    - **Validates: Requirements 1.2, 1.3, 15.3**

  - [x] 2.3 Write property test for AI preferences persistence
    - **Property 4: AI preferences persist across store re-hydration** — for any set of AI preferences saved via `setAIPreferences`, re-hydrating the store from `localStorage` produces a store whose `aiPreferences` equals the saved values
    - **Validates: Requirements 1.4, 5.2**

  - [x] 2.4 Write unit tests for AppStore
    - Test initial state shape matches the defined interface
    - Test `addLead` appends to `leads` array
    - Test `logout` clears `session` and `leads`
    - _Requirements: 1.1, 1.2, 1.3, 15.3_

- [x] 3. Create Avatar component (AvatarManager)
  - [x] 3.1 Create `src/components/Avatar.jsx`
    - Accept props: `src` (optional URL), `name` (string for initials), `size` (number in px, default 40), `className` (optional string)
    - Attempt to load `src` via `<img>`; on `onError`, fall back to a `<div>` showing initials (first letter of each word, max 2 chars) on a deterministic background color derived from `name` (hash → hue)
    - Never show a broken image icon
    - _Requirements: 14.1, 14.2, 14.4_

  - [x] 3.2 Write property test for Avatar initials
    - **Property 1: Avatar initials are always visible for any non-empty name** — for any non-empty string `name`, the fallback placeholder renders a non-empty initials string (≥1 character)
    - **Validates: Requirements 15.7, 14.1**

  - [x] 3.3 Write unit tests for Avatar component
    - Test renders `<img>` when `src` is provided
    - Test shows initials fallback when image `onError` fires
    - Test renders with empty `name` without crashing
    - _Requirements: 14.1, 14.2, 15.2_

- [x] 4. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Create AI service and PDF service
  - [x] 5.1 Create `src/services/aiService.js` with two exported async functions:
    - `sendChatMessage({ messages, model, temperature, maxTokens, apiKey, provider })` — thin `fetch` wrapper over OpenAI or Groq REST API; returns `{ content: string }` or throws `Error`
    - `sendSandboxMessage({ messages, context, model, temperature, maxTokens, apiKey })` — Groq-only wrapper that prepends PDF context to the system message; returns `{ content: string }` or throws `Error`
    - Never log or store the API key; handle non-2xx responses by throwing a descriptive error
    - _Requirements: 2.1, 2.5, 3.2, 3.7_

  - [x] 5.2 Create `src/services/pdfService.js`
    - Export `extractTextFromPDF(file: File): Promise<string>` using `pdfjs-dist` browser build
    - Concatenate text from all pages; throw a descriptive error on parse failure
    - _Requirements: 3.1, 3.6_

- [x] 6. Create authentication components and hooks
  - [x] 6.1 Create `src/components/ProtectedRoute.jsx`
    - Read `session` from AppStore; if null, redirect to `/login` preserving the attempted path in `location.state.from`
    - _Requirements: 12.1, 12.6_

  - [x] 6.2 Create `src/pages/LoginPage.jsx`
    - Render a login form with email and password fields and a "Sign In" button
    - On submit, call `login()` from AppStore with the credentials; on success redirect to `location.state.from` or `/dashboard`
    - On failure, show a generic "Invalid email or password" error message (no field-level detail)
    - _Requirements: 12.1, 12.2, 12.5, 12.6_

  - [x] 6.3 Create `src/hooks/useAuth.js`
    - Export helpers derived from AppStore: `useSession()`, `useIsAuthenticated()`, `useLogin()`, `useLogout()`
    - _Requirements: 12.2, 12.3, 12.4_

  - [x] 6.4 Write unit tests for authentication flow
    - Test `<ProtectedRoute>` redirects to `/login` when no session exists
    - Test `<LoginPage>` restores session from `localStorage` on mount (re-hydration)
    - Test invalid credentials show error message without revealing which field is wrong
    - _Requirements: 12.1, 12.3, 12.5, 15.5_

- [x] 7. Update App.jsx with auth guards and /metrics route
  - Wrap all protected routes (`/dashboard`, `/chat`, `/sandbox`, `/settings`, `/help`, `/metrics`) with `<ProtectedRoute>`
  - Add `<Route path="/login" element={<LoginPage />} />` outside the Layout wrapper
  - Add `<Route path="/metrics" element={<MetricsPage />} />` inside the Layout + ProtectedRoute wrapper
  - _Requirements: 12.1, 13.1_

- [x] 8. Update Layout.jsx with AppStore integration and Avatar
  - Replace the hardcoded workspace `<img>` in the sidebar with `<Avatar>` reading `profile.avatarUrl` and `profile.agencyName` from AppStore
  - Update the sidebar agency name to read from `profile.agencyName` in AppStore
  - Fix the "Metrics" nav item to point to `/metrics` instead of `/dashboard`
  - Wire the "Sign Out" button to call `logout()` from AppStore and redirect to `/login`
  - Add a notification badge on the Bell icon that shows `unreadNotifications` count from AppStore when > 0; clicking it calls `clearNotifications()`
  - _Requirements: 4.3, 6.3, 12.4, 13.3, 14.3_

- [x] 9. Implement SalesChat with real AI API integration
  - [x] 9.1 Update `src/pages/SalesChat.jsx` to use `aiService.sendChatMessage`
    - Read `aiPreferences` (model, temperature, maxTokens, openaiKey/groqKey) from AppStore
    - On message send, disable the input field and send button; call `sendChatMessage` with the full conversation history and a predefined sales system prompt
    - On success, append the AI response as a new message and re-enable input
    - On failure, append an error `ChatMessage` with `isError: true` displayed with a distinct error style, then re-enable input
    - When the user message contains high-intent keywords, update the "Purchase Intent" score in the sidebar
    - Call `incrementInteraction()` and `addLead()` on AppStore when appropriate
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 9.2 Write property test for SalesChat input disabled during API call
    - **Property 6: SalesChat disables input during API call** — for any user message sent while an API call is in progress, the input field and send button remain disabled until the call resolves or rejects
    - **Validates: Requirements 2.4, 15.4**

  - [x] 9.3 Write unit tests for SalesChat
    - Test sending a message appends it to the message list
    - Test input is disabled while API call is in progress (mock `aiService`)
    - Test error message appears inline when API call fails
    - _Requirements: 2.2, 2.3, 2.4, 15.4_

- [x] 10. Implement Sandbox with real Groq API and PDF extraction
  - [x] 10.1 Update `src/pages/Sandbox.jsx` to use `pdfService` and `aiService.sendSandboxMessage`
    - Replace the simulated upload handler with a real file input (`<input type="file" accept=".pdf">`) that calls `extractTextFromPDF`; store extracted text in component state
    - Show "Vectorizing..." status in the process panel while extraction is running (Req 3.6)
    - If the user tries to send a message without a loaded PDF, show an inline warning (Req 3.4)
    - On message send, call `sendSandboxMessage` with the PDF text as context; read `groqKey`, `sandboxModel`, `temperature`, `maxTokens` from AppStore
    - On success, append the Llama 3 response (with code block formatting when applicable)
    - On failure, append a descriptive error message in the chat (Req 3.5)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 11. Implement Settings page — four functional sections
  - [x] 11.1 Rewrite `src/pages/Settings.jsx` with expandable sections
    - Replace the static card list with four accordion/expandable sections: Profile Account, AI Model Preferences, Notifications, Security & API Keys
    - Each section expands inline when clicked (no separate routes needed)
    - _Requirements: 4.1, 5.1, 6.1, 7.1_

  - [x] 11.2 Implement Profile Account section
    - Form fields: agency name, email, avatar URL
    - On save, call `setProfile()` on AppStore; validate email format inline on submit
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 11.3 Implement AI Model Preferences section
    - Controls: model selector (GPT-4o, GPT-3.5-turbo, Llama 3 70B), temperature slider (0.0–1.0), max tokens input
    - On save, call `setAIPreferences()` on AppStore (persisted to localStorage)
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 11.4 Implement Notifications section
    - Three toggles: new lead captured, agent status change, weekly email summary
    - On toggle change, call `setNotificationPrefs()` on AppStore (persisted to localStorage)
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 11.5 Implement Security & API Keys section
    - Two masked password inputs: OpenAI API Key, Groq API Key
    - "Reveal" toggle button per field to show/hide value
    - On save, call `setAIPreferences()` with the new keys; block save of empty key with inline validation warning (preserve existing key)
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 12. Implement Help page — four functional sections
  - [x] 12.1 Rewrite `src/pages/Help.jsx` with expandable sections
    - Replace the static card grid with four expandable sections: Documentation, Community Discord, API Reference, Direct Support
    - _Requirements: 8.1, 9.1, 10.1, 11.1_

  - [x] 12.2 Implement Documentation section
    - Expand to show articles organized by category: Getting Started, API Integration, Sales Chat, Sandbox
    - At least 3 articles per category with title, brief description, and "Read More" link
    - _Requirements: 8.1, 8.2_

  - [x] 12.3 Implement Community Discord section
    - Show active member count (static configurable value)
    - "Join Discord" button opens the Discord URL in a new tab
    - _Requirements: 9.1, 9.2_

  - [x] 12.4 Implement API Reference section
    - Expand to show endpoint docs with parameters and code-formatted example responses
    - Include at minimum: `POST /api/chat`, `POST /api/sandbox/upload`, `GET /api/leads`
    - _Requirements: 10.1, 10.2_

  - [x] 12.5 Implement Direct Support (ticket form) section
    - Form fields: subject (required), description (required), priority selector (Low, Medium, High)
    - On submit: validate required fields inline, disable submit button during processing, show confirmation with generated ticket number on success
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [x] 12.6 Write property test for support ticket form validation
    - **Property 5: Support ticket form rejects empty required fields** — for any submission where `subject` or `description` is empty or whitespace-only, the form does not submit and displays at least one validation message
    - **Validates: Requirements 11.3**

- [x] 13. Create MetricsPage (/metrics route)
  - Create `src/pages/Metrics.jsx`
  - Read metrics data from AppStore (`metrics` slice)
  - Display: total interactions, conversion rate, average session time, sentiment distribution
  - Include a date range selector (Last 7 days, 30 days, 90 days) that filters the displayed metrics
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [x] 14. Replace all avatar `<img>` tags with `<Avatar>` component
  - Update `src/components/Layout.jsx`: replace workspace avatar `<img>` with `<Avatar src={profile.avatarUrl} name={profile.agencyName} size={40} />`
  - Update `src/pages/SalesChat.jsx`: replace the Alex avatar `<img>` with `<Avatar src={...} name="Alex" size={48} />`
  - Update `src/pages/Dashboard.jsx`: replace lead avatar `<img>` tags in the leads list with `<Avatar src={lead.avatar} name={lead.name} size={40} />`
  - _Requirements: 14.3_

- [x] 15. Configure Vitest and set up test infrastructure
  - Create `vitest.config.js` with `environment: 'jsdom'`, `globals: true`, and `setupFiles` pointing to a setup file that imports `@testing-library/jest-dom`
  - Create `src/test/setup.js` with the jest-dom import
  - Configure `msw` handlers for OpenAI and Groq API endpoints used in component tests
  - _Requirements: 15.1, 15.6_

- [x] 16. Checkpoint — Ensure all tests pass
  - Run `npm test` and verify all unit tests and property tests pass. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests (fast-check) validate universal correctness invariants; unit tests validate specific examples and edge cases
- API keys are never hardcoded — always read from AppStore which persists to localStorage
- The `msw` mock server should be used in tests to intercept AI API calls without real network requests
