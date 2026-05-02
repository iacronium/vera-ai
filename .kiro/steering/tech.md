# Technology Stack

## Frontend

- **React 18.3** — UI framework
- **Vite 5.x** — Build tool and dev server
- **React Router 6.x** — Client-side routing
- **Zustand 5.x** — Global state management with localStorage persistence
- **Framer Motion 11.x** — Animations and transitions
- **Tailwind CSS 3.x** — Utility-first styling with custom design tokens
- **Lucide React** — Icon library
- **pdfjs-dist 5.x** — PDF text extraction

### Testing

- **Vitest 4.x** — Test runner (configured with jsdom)
- **Testing Library** — React component testing
- **MSW 2.x** — API mocking for tests
- **fast-check 4.x** — Property-based testing

## Backend

- **Express.js 5.x** — HTTP server
- **better-sqlite3 12.x** — Embedded SQL database
- **jsonwebtoken 9.x** — JWT authentication
- **bcryptjs 3.x** — Password hashing
- **googleapis** — Google Calendar API integration
- **mercadopago 2.x** — Payment processing (Argentina)
- **axios** — HTTP client
- **dotenv** — Environment variable management

## AI Providers

- **Groq** — Primary provider (Llama 3.3 70B, Llama 3.1 8B, Mixtral, Gemma 2)
- **OpenAI** — Secondary provider (GPT-4o)

Backend acts as a proxy to both providers.

## Database Schema

SQLite with four tables:
- `users` — Authentication, profile, Google tokens, plan status
- `leads` — Captured leads with status tracking
- `metrics` — User interaction analytics
- `payments` — Mercado Pago transaction records

## Common Commands

### Development

```bash
# Install dependencies
npm install
cd server && npm install

# Start frontend dev server (http://localhost:5173)
npm run dev

# Start backend server (http://localhost:5000)
cd server && node index.js

# Start both + ngrok for webhooks
.\iniciar-todo.ps1  # Windows PowerShell
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test -- --watch
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Linting

```bash
# Run ESLint
npm run lint
```

## Environment Variables

### Frontend (`.env`)

```env
VITE_API_URL=http://localhost:5000
```

### Backend (`server/.env`)

```env
PORT=5000
JWT_SECRET=your_jwt_secret

# AI Providers
GROQ_API_KEY=your_groq_key

# Google Calendar (optional)
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/calendar/oauth/callback

# Mercado Pago (optional)
MERCADOPAGO_PUBLIC_KEY=APP_USR-...
MERCADOPAGO_ACCESS_TOKEN=your_access_token
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173
```

## API Architecture

Backend provides REST endpoints:
- `/api/auth/*` — Authentication (login)
- `/api/ai/*` — AI chat proxy (Groq/OpenAI)
- `/api/data/*` — Leads and metrics CRUD
- `/api/calendar/*` — Google Calendar OAuth2 and event creation
- `/api/mercadopago/*` — Payment checkout and order management
- `/api/webhooks/mercadopago` — Payment confirmation webhook (IPN)

All authenticated routes require `Authorization: Bearer <token>` header.
