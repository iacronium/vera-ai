# Vera AI

Plataforma SaaS de automatización de ventas con IA. Despliega a **Oliver**, un consultor de ventas virtual que captura y cualifica leads 24/7, agenda consultorías directamente en Google Calendar y responde en milisegundos.

---

## Características principales

- **Consultor de ventas IA (Oliver)** — Chat en tiempo real con identidad de ventas personalizable, detección automática de intención de compra y captura de contactos
- **Agendamiento con Google Calendar** — Oliver detecta intención de agendar, extrae fecha/hora del chat y crea el evento directamente en tu calendario con invitación al cliente
- **Instrucciones personalizadas** — Sube un archivo `.md` o `.txt` con tu guión de ventas, precios y objeciones; se inyecta en cada conversación
- **Sandbox de documentos** — Carga un PDF y chatea con su contenido usando Llama 3
- **Dashboard de métricas** — Interacciones, tasa de conversión, análisis de sentimiento y funnel
- **Soporte multi-modelo** — Groq (Llama 3.3 70B, Mixtral, Gemma 2) y OpenAI (GPT-4o)
- **Diseño premium** — Glassmorphism, animaciones fluidas, sistema de diseño moderno

---

## Stack tecnológico

### Frontend
| Tecnología | Versión | Uso |
|---|---|---|
| React | 18.3 | UI |
| Vite | 5.x | Bundler |
| React Router | 6.x | Navegación |
| Zustand | 5.x | Estado global (persistido en localStorage) |
| Framer Motion | 11.x | Animaciones |
| Tailwind CSS | 3.x | Estilos |
| pdfjs-dist | 5.x | Extracción de texto PDF |
| Lucide React | 0.395 | Iconografía |

### Backend
| Tecnología | Versión | Uso |
|---|---|---|
| Express.js | 5.x | Servidor HTTP |
| better-sqlite3 | 12.x | Base de datos |
| jsonwebtoken | 9.x | Autenticación JWT |
| bcryptjs | 3.x | Hash de contraseñas |
| googleapis | latest | Integración Google Calendar |

---

## Estructura del proyecto

```
synthesized-ether-ai/
├── src/
│   ├── pages/
│   │   ├── LandingPage.jsx       # Página de inicio con ROI calculator
│   │   ├── LoginPage.jsx         # Autenticación
│   │   ├── Dashboard.jsx         # Métricas y estado del agente
│   │   ├── SalesChat.jsx         # Chat con Oliver + agendamiento
│   │   ├── Sandbox.jsx           # PDF upload + chat contextualizado
│   │   ├── Metrics.jsx           # Historial y análisis
│   │   ├── Settings.jsx          # Modelos, API keys, instrucciones, Calendar
│   │   └── Help.jsx              # Documentación y soporte
│   ├── components/
│   │   ├── Layout.jsx            # Sidebar + header principal
│   │   ├── ProtectedRoute.jsx    # Guard de autenticación
│   │   ├── AIPulse.jsx           # Animación de pulso IA
│   │   └── Avatar.jsx            # Avatar con iniciales
│   ├── services/
│   │   ├── aiService.js          # Proxy hacia Groq/OpenAI
│   │   ├── calendarService.js    # Integración Google Calendar
│   │   └── pdfService.js         # Extracción de texto con pdfjs
│   ├── store/
│   │   └── useAppStore.js        # Store Zustand (auth, leads, métricas, prefs, instrucciones)
│   └── hooks/
│       └── useAuth.js            # Hook de sesión
├── server/
│   ├── index.js                  # Servidor Express
│   ├── db.js                     # Inicialización SQLite + migraciones
│   ├── middleware/
│   │   └── auth.js               # JWT middleware (strict + optional)
│   └── routes/
│       ├── auth.js               # POST /api/auth/login
│       ├── ai.js                 # POST /api/ai/chat (proxy IA)
│       ├── data.js               # GET/POST /api/data/leads, /metrics
│       └── calendar.js           # Google Calendar OAuth2 + eventos
├── .gitignore
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## Instalación y uso

### Requisitos previos
- Node.js 18+
- Una API key de [Groq](https://console.groq.com) (gratuita) o [OpenAI](https://platform.openai.com)
- (Opcional) Proyecto en [Google Cloud Console](https://console.cloud.google.com) para Google Calendar
- (Opcional) Cuenta de [Mercado Pago](https://www.mercadopago.com.ar) para pagos en Argentina (ARS)

### 1. Instalar dependencias

```bash
# Frontend
npm install

# Backend
cd server
npm install
```

### 2. Configurar variables de entorno

**Backend** — Crea `server/.env`:

```env
PORT=5000
JWT_SECRET=tu_secreto_jwt_aqui

# AI
GROQ_API_KEY=tu_groq_api_key

# Google Calendar (opcional)
GOOGLE_CLIENT_ID=tu_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/calendar/oauth/callback

# Mercado Pago (opcional - pagos en Argentina)
MERCADOPAGO_PUBLIC_KEY=APP_USR-c4c4749a-5040-4c68-bfbd-f9364c7d00d8
MERCADOPAGO_ACCESS_TOKEN=tu_access_token_aqui
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173
```

**Frontend** — Crea `.env` en la raíz:

```env
VITE_API_URL=http://localhost:5000
```

### 3. Iniciar el backend

```bash
cd server
node index.js
# → Server running on http://localhost:5000
```

### 4. Iniciar el frontend

```bash
npm run dev
# → http://localhost:5173
```

### 5. Configurar API keys en la app

Ve a **Settings → Security & API Keys** e ingresa tu API key de Groq o OpenAI. Las keys se guardan localmente en el navegador.

---

## Rutas de la aplicación

| Ruta | Acceso | Descripción |
|---|---|---|
| `/` | Público | Landing page con pricing y ROI calculator |
| `/login` | Público | Inicio de sesión |
| `/plans` | Público | Planes y checkout con Mercado Pago (ARS) |
| `/success` | Público | Confirmación de pago exitoso |
| `/dashboard` | Autenticado | Métricas y estado del agente IA |
| `/chat` | Autenticado | Chat de ventas con Oliver + agendamiento |
| `/sandbox` | Autenticado | Prueba de concepto con PDFs |
| `/metrics` | Autenticado | Análisis detallado de interacciones |
| `/settings` | Autenticado | Modelos, temperatura, API keys, instrucciones, Calendar |
| `/help` | Autenticado | Documentación y soporte |

---

## Modelos de IA disponibles

### Groq (recomendado — gratuito)
| Modelo | Velocidad | Contexto |
|---|---|---|
| `llama-3.3-70b-versatile` | Alta | 128k tokens |
| `llama-3.1-8b-instant` | Muy alta | 128k tokens |
| `mixtral-8x7b-32768` | Alta | 32k tokens |
| `gemma2-9b-it` | Alta | 8k tokens |

### OpenAI
| Modelo | Notas |
|---|---|
| `gpt-4o` | Requiere API key de pago |

---

## Instrucciones personalizadas para Oliver

Ve a **Settings → Agent Instructions** para personalizar el comportamiento de Oliver:

- Escribe directamente en el editor de texto
- O sube un archivo `.md` / `.txt` con tu guión de ventas

El contenido se inyecta al inicio de cada conversación. Ejemplo de estructura recomendada:

```markdown
## Identidad
Eres Oliver, consultor de [Tu Empresa]...

## Productos
- Plan Starter: $250 (pago único)
- Plan Business: $350 (pago único)

## Objeciones comunes
- "Es muy caro" → Mostrar ROI...
```

---

## Integración con Google Calendar

### Configuración inicial (una sola vez)

1. Crea un proyecto en [Google Cloud Console](https://console.cloud.google.com)
2. Activa la **Google Calendar API**
3. Crea credenciales **OAuth 2.0** (tipo: Aplicación web)
4. URI de redirección: `http://localhost:5000/api/calendar/oauth/callback`
5. Agrega tu correo en **Audiencia → Usuarios de prueba**
6. Copia Client ID y Client Secret a `server/.env`

### Conectar desde la app

1. Ve a **Settings → Security & API Keys**
2. Clic en **"Conectar Google Calendar"**
3. Autoriza en el popup de Google

### Cómo funciona en el chat

Cuando un cliente menciona palabras como `agendar`, `cita`, `reunión`, `consultoría`:
- Se abre automáticamente el modal de agendamiento
- La fecha/hora se extrae del mensaje del cliente ("mañana a las 5 de la tarde" → 17:00 hs)
- El resumen del chat se incluye en la descripción del evento
- Al confirmar, el evento se crea en tu Google Calendar y el cliente recibe invitación por correo

También puedes abrir el modal manualmente con el botón **"Agendar"** en el header del chat.

---

## API del backend

### Autenticación

```http
POST /api/auth/login
Content-Type: application/json

{ "email": "user@example.com", "password": "password" }
```

### Chat IA

```http
POST /api/ai/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "provider": "groq",
  "model": "llama-3.3-70b-versatile",
  "messages": [{ "role": "user", "content": "Hola" }],
  "temperature": 0.7,
  "maxTokens": 1024,
  "apiKey": "<groq_api_key>"
}
```

### Leads y métricas

```http
GET  /api/data/leads       # Listar leads del usuario
POST /api/data/leads       # Crear nuevo lead
GET  /api/data/metrics     # Obtener métricas
POST /api/data/metrics     # Actualizar métricas
```

### Google Calendar

```http
GET  /api/calendar/auth-url          # Obtener URL de autorización OAuth2
GET  /api/calendar/oauth/callback    # Callback OAuth2 (uso interno)
GET  /api/calendar/status            # Estado de conexión
POST /api/calendar/disconnect        # Desconectar
POST /api/calendar/create-event      # Crear evento

# Body de create-event:
{
  "summary": "Consultoría Gratuita — Vera",
  "description": "...",
  "startDateTime": "2026-04-24T17:00:00.000Z",
  "endDateTime": "2026-04-24T18:00:00.000Z",
  "attendeeEmail": "cliente@empresa.com"
}
```

### Mercado Pago

```http
POST /api/mercadopago/checkout              # Crear preferencia de pago
POST /api/webhooks/mercadopago              # Webhook de confirmación de pago (IPN)
GET  /api/mercadopago/orders                # Listar pagos del usuario autenticado
GET  /api/mercadopago/order/:externalRef    # Obtener pago por external reference
GET  /api/mercadopago/payment-status/:id    # Consultar estado del pago en Mercado Pago

# Body de checkout:
{
  "planId": "starter",  // 'starter', 'business', o 'maintenance'
  "userEmail": "cliente@empresa.com"
}
```

---

## Pagos con Mercado Pago (Argentina)

### ¿Por qué Mercado Pago?

Mercado Pago es la solución de pagos más popular en Argentina, con amplia adopción y confianza del mercado. Acepta:
- **Tarjetas de crédito y débito** — todas las tarjetas argentinas
- **Pago en efectivo** — Rapipago, Pago Fácil
- **Transferencia bancaria** — desde cualquier banco
- **Dinero en cuenta** — saldo de Mercado Pago

### Configuración inicial

1. Crea una cuenta en [Mercado Pago Developers](https://www.mercadopago.com.ar/developers)
2. Ve a **Tus integraciones → Crear aplicación**
3. Selecciona **Pagos online** como tipo de integración
4. Copia tus credenciales:
   - **Public Key**: `APP_USR-...` (para el frontend)
   - **Access Token**: `APP_USR-...` (para el backend)
5. Agrega las credenciales a `server/.env`:

```env
MERCADOPAGO_PUBLIC_KEY=APP_USR-c4c4749a-5040-4c68-bfbd-f9364c7d00d8
MERCADOPAGO_ACCESS_TOKEN=tu_access_token_aqui
```

### Configurar Webhooks (IPN)

1. Ve a **Tus integraciones → [Tu app] → Webhooks**
2. Agrega una nueva URL de notificación:
   - **URL**: `https://tu-dominio.com/api/webhooks/mercadopago`
   - Para desarrollo local, usa [ngrok](https://ngrok.com): `https://abc123.ngrok.io/api/webhooks/mercadopago`
3. Selecciona el evento: **Pagos** (`payment`)
4. Guarda la configuración

### Precios configurados

Los precios están en pesos argentinos (ARS) en `server/routes/mercadoPago.js`:

```javascript
const PLANS = {
  starter: { price: 250000 },      // $250.000 ARS
  business: { price: 350000 },     // $350.000 ARS
  maintenance: { price: 150000 },  // $150.000 ARS/mes
};
```

### Cómo funciona

1. El usuario va a `/plans` y selecciona un plan
2. Se crea una preferencia de pago con `POST /api/mercadopago/checkout`
3. El usuario es redirigido a Mercado Pago para completar el pago
4. Mercado Pago envía un webhook (IPN) a `/api/webhooks/mercadopago` cuando el pago es aprobado
5. El backend:
   - Actualiza el estado del pago en la tabla `payments` a `approved`
   - Actualiza el `plan_status` del usuario en la tabla `users`
   - Si es plan de mantenimiento, activa `maintenance_active = 1`
6. El usuario es redirigido a `/success` con los detalles de su compra

### Testing en Sandbox

Mercado Pago tiene credenciales de prueba:

1. Ve a **Tus integraciones → [Tu app] → Credenciales de prueba**
2. Copia las credenciales de prueba (empiezan con `TEST-...`)
3. Úsalas en `server/.env` para testing:

```env
MERCADOPAGO_PUBLIC_KEY=TEST-...
MERCADOPAGO_ACCESS_TOKEN=TEST-...
```

4. Usa [tarjetas de prueba](https://www.mercadopago.com.ar/developers/es/docs/checkout-api/testing) para simular pagos:
   - **Aprobado**: `4509 9535 6623 3704` (VISA)
   - **Rechazado**: `4013 5406 8274 6260` (VISA)

### Testing local con webhooks

Para probar webhooks en local, usa [ngrok](https://ngrok.com):

```bash
# Instalar ngrok
# https://ngrok.com/download

# Exponer tu servidor local
ngrok http 5000

# Copia la URL https://... que te da ngrok
# Úsala en Mercado Pago → Webhooks
# Ejemplo: https://abc123.ngrok.io/api/webhooks/mercadopago
```

### Ventajas de Mercado Pago

- ✅ **Amplia adopción** — la mayoría de los argentinos tienen cuenta
- ✅ **Múltiples métodos de pago** — tarjetas, efectivo, transferencia
- ✅ **Cuotas sin interés** — configurable desde el panel
- ✅ **Protección al comprador** — devoluciones y reclamos
- ✅ **API robusta** — documentación completa y SDKs oficiales
- ✅ **Webhooks confiables** — notificaciones en tiempo real (IPN)

### Flujo de estados del pago

Mercado Pago envía notificaciones con diferentes estados:

| Estado | Descripción | Acción en el backend |
|---|---|---|
| `approved` | Pago aprobado | Activar plan del usuario |
| `pending` | Pago pendiente (ej: efectivo) | Esperar confirmación |
| `in_process` | En revisión | Esperar confirmación |
| `rejected` | Pago rechazado | No activar plan |
| `cancelled` | Pago cancelado | No activar plan |
| `refunded` | Pago devuelto | Desactivar plan |

Solo los pagos con estado `approved` activan el plan del usuario.

---

## Base de datos

SQLite con cuatro tablas:

```sql
users    (id, email, password, agencyName, avatarUrl, google_tokens, plan_status, maintenance_active)
leads    (id, userId, name, email, status, timestamp)
metrics  (id, userId, totalInteractions, conversionRate, avgSessionTime, timestamp)
payments (id, user_email, plan_id, amount, status, external_reference, preference_id, payment_id, created_at, paid_at)
```

El archivo se genera automáticamente en `server/agency.db` al iniciar el servidor. Las migraciones se aplican de forma segura en cada arranque.

---

## Tests

```bash
npm test
```

Usa Vitest + Testing Library + MSW para mocking de peticiones HTTP. Incluye tests unitarios, de integración y tests basados en propiedades (fast-check).

---

## Licencia

Privado — todos los derechos reservados.
