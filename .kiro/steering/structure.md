# Project Structure

## Root Directory

```
synthesized-ether-ai/
├── src/                    # Frontend React application
├── server/                 # Backend Express API
├── .kiro/                  # Kiro configuration and specs
├── dist/                   # Production build output
├── node_modules/           # Frontend dependencies
├── .env                    # Frontend environment variables
├── .env.example            # Frontend env template
├── package.json            # Frontend dependencies and scripts
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
└── index.html              # HTML entry point
```

## Frontend Structure (`src/`)

```
src/
├── pages/                  # Route components (one per page)
│   ├── LandingPage.jsx     # Public landing page with pricing
│   ├── LoginPage.jsx       # Authentication page
│   ├── Dashboard.jsx       # Main dashboard with metrics
│   ├── SalesChat.jsx       # Oliver AI chat interface
│   ├── Sandbox.jsx         # PDF upload and chat
│   ├── Metrics.jsx         # Detailed analytics
│   ├── Settings.jsx        # User preferences and API keys
│   ├── Help.jsx            # Documentation and support
│   ├── Plans.jsx           # Pricing and Mercado Pago checkout
│   └── Success.jsx         # Payment confirmation page
├── components/             # Reusable UI components
│   ├── Layout.jsx          # Main layout with sidebar and header
│   ├── ProtectedRoute.jsx  # Authentication guard
│   ├── AIPulse.jsx         # AI pulse animation
│   └── Avatar.jsx          # User avatar with initials fallback
├── services/               # API client modules
│   ├── aiService.js        # AI chat API calls
│   ├── calendarService.js  # Google Calendar integration
│   ├── pdfService.js       # PDF text extraction
│   └── mercadoPagoService.js # Payment processing
├── store/                  # Zustand state management
│   └── useAppStore.js      # Global store with slices
├── hooks/                  # Custom React hooks
│   └── useAuth.js          # Authentication hook
├── test/                   # Test configuration
│   ├── setup.js            # Vitest setup
│   ├── mswHandlers.js      # MSW request handlers
│   └── mswServer.js        # MSW server setup
├── App.jsx                 # Root component with routes
├── main.jsx                # React entry point
└── index.css               # Global styles and Tailwind imports
```

## Backend Structure (`server/`)

```
server/
├── routes/                 # Express route handlers
│   ├── auth.js             # POST /api/auth/login
│   ├── ai.js               # POST /api/ai/chat (proxy)
│   ├── data.js             # Leads and metrics CRUD
│   ├── calendar.js         # Google Calendar OAuth2 + events
│   └── mercadoPago.js      # Payment checkout + webhooks
├── middleware/             # Express middleware
│   └── auth.js             # JWT verification (strict + optional)
├── node_modules/           # Backend dependencies
├── .env                    # Backend environment variables
├── .env.example            # Backend env template
├── package.json            # Backend dependencies
├── index.js                # Express server entry point
├── db.js                   # SQLite initialization + migrations
└── agency.db               # SQLite database (auto-generated)
```

## Routing Architecture

### Public Routes
- `/` — Landing page
- `/login` — Authentication
- `/plans` — Pricing and checkout
- `/success` — Payment confirmation

### Protected Routes (require authentication)
All wrapped in `<ProtectedRoute>` with `<Layout>`:
- `/dashboard` — Overview and metrics
- `/chat` — Sales chat with Oliver
- `/sandbox` — Document chat
- `/metrics` — Detailed analytics
- `/settings` — Configuration
- `/help` — Documentation

## State Management

Zustand store (`useAppStore.js`) organized into slices:
- **Auth** — `session`, `login()`, `logout()`
- **Leads** — `leads[]`, `addLead()`, `clearLeads()`
- **Metrics** — `metrics{}`, `incrementInteraction()`
- **AI Preferences** — `aiPreferences{}`, `setAIPreferences()`
- **Notifications** — `notificationPrefs{}`, `unreadNotifications`
- **Profile** — `profile{}`, `setProfile()`
- **Instructions** — `agentInstructions`, `setAgentInstructions()`

State is persisted to localStorage except for `leads` and `metrics.history` (session-only).

## Component Conventions

- **Pages** — Full-page components in `src/pages/`, one per route
- **Components** — Reusable UI in `src/components/`, prefixed with component name
- **Services** — API logic in `src/services/`, pure functions that return promises
- **Hooks** — Custom hooks in `src/hooks/`, prefixed with `use`

## Styling Conventions

- **Tailwind utility classes** — Primary styling approach
- **Custom design tokens** — Defined in `tailwind.config.js` (Material Design 3 inspired)
- **Glassmorphism** — `.glass-card` class for frosted glass effect
- **Animations** — Framer Motion for complex animations, Tailwind for simple transitions
- **Responsive** — Mobile-first with `md:` and `lg:` breakpoints

## Testing Conventions

- **Unit tests** — `*.test.jsx` or `*.test.js` alongside source files
- **Property-based tests** — `*.property.test.js` using fast-check
- **Test setup** — `src/test/setup.js` imports `@testing-library/jest-dom`
- **API mocking** — MSW handlers in `src/test/mswHandlers.js`

## File Naming

- **Components** — PascalCase (e.g., `Avatar.jsx`, `SalesChat.jsx`)
- **Services/Hooks** — camelCase (e.g., `aiService.js`, `useAuth.js`)
- **Tests** — Match source file with `.test` or `.property.test` suffix
- **Routes** — camelCase (e.g., `auth.js`, `mercadoPago.js`)

## Import Conventions

- **Absolute imports** — Not configured; use relative imports
- **Service imports** — `import { sendChatMessage } from '../services/aiService'`
- **Store imports** — `import { useSession, useLogin } from '../store/useAppStore'`
- **Component imports** — `import Avatar from '../components/Avatar'`
