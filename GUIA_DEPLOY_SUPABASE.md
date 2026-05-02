# 🚀 Guía de Deploy - Vera AI con Supabase

## Arquitectura Final (100% Gratis)

```
Vercel (Frontend) → Render (Backend Express) → Supabase (PostgreSQL)
```

| Servicio | Rol | Costo |
|---------|-----|-------|
| **Vercel** | Frontend React | Gratis |
| **Render** | Backend Node.js/Express | Gratis |
| **Supabase** | Base de datos PostgreSQL | Gratis |

---

## PASO 1: Configurar Supabase (15 min)

### 1.1 Crear Cuenta y Proyecto

1. Ir a [supabase.com](https://supabase.com)
2. Click en "Start your project" → Registrarse con GitHub
3. Click en "New Project"
4. Completar:
   - **Name:** `vera-ai`
   - **Database Password:** Generar una segura y guardarla
   - **Region:** `South America (São Paulo)` si está disponible, sino `US East`
5. Click "Create new project" → Esperar ~2 minutos

### 1.2 Obtener Credenciales

1. Ir a **Settings** (ícono de engranaje) → **API**
2. Copiar y guardar:
   ```
   Project URL:     https://xxxxxxxxxxxx.supabase.co
   anon public:     eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   service_role:    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. Ir a **Settings** → **Database**
4. Copiar la **Connection string** (URI):
   ```
   postgresql://postgres:[TU-PASSWORD]@db.xxxxxxxxxxxx.supabase.co:5432/postgres
   ```

### 1.3 Crear las Tablas

1. Ir a **SQL Editor** en el menú lateral
2. Click en "New query"
3. Pegar y ejecutar el siguiente SQL:

```sql
-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  "agencyName" TEXT,
  "avatarUrl" TEXT,
  google_tokens TEXT,
  plan_status TEXT,
  maintenance_active INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de leads
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER REFERENCES users(id),
  name TEXT,
  email TEXT,
  status TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de métricas
CREATE TABLE IF NOT EXISTS metrics (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER REFERENCES users(id),
  "totalInteractions" INTEGER DEFAULT 0,
  "conversionRate" REAL DEFAULT 0,
  "avgSessionTime" REAL DEFAULT 0,
  "sentimentPositive" INTEGER DEFAULT 0,
  "sentimentNeutral" INTEGER DEFAULT 0,
  "sentimentNegative" INTEGER DEFAULT 0,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de pagos
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  external_reference TEXT UNIQUE,
  preference_id TEXT,
  payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);
```

4. Click "Run" → Verificar que dice "Success"

### 1.4 Crear Usuario Admin Inicial

```sql
-- Insertar usuario de prueba (contraseña: admin123)
-- La contraseña real se hashea desde el backend al hacer login
INSERT INTO users (email, password, "agencyName")
VALUES ('admin@vera.ai', '$2b$10$placeholder', 'Vera AI')
ON CONFLICT (email) DO NOTHING;
```

> ⚠️ El usuario real se crea cuando el backend hashea la contraseña. Esto es solo para verificar que la tabla funciona.

---

## PASO 2: Migrar Backend a PostgreSQL (30 min)

El backend actual usa SQLite. Necesitamos actualizarlo para usar PostgreSQL de Supabase.

### 2.1 Instalar dependencia de PostgreSQL

```bash
cd server
npm install pg
```

### 2.2 Actualizar `server/db.js`

Reemplazar el contenido completo con:

```javascript
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Verificar conexión al iniciar
pool.connect((err, client, release) => {
  if (err) {
    console.error('[DB] Error conectando a PostgreSQL:', err.message);
  } else {
    console.log('[DB] Conectado a Supabase PostgreSQL ✅');
    release();
  }
});

module.exports = pool;
```

### 2.3 Actualizar `server/routes/auth.js`

Cambiar la sintaxis de SQLite a PostgreSQL:

```javascript
// ANTES (SQLite):
const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

// DESPUÉS (PostgreSQL):
const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
const user = result.rows[0];
```

> 📖 Ver `MIGRACION_SQLITE_POSTGRES.md` para todos los cambios necesarios en las rutas.

### 2.4 Variables de Entorno del Backend

Actualizar `server/.env`:

```env
# Agregar estas líneas:
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
SUPABASE_URL=https://[PROJECT].supabase.co
SUPABASE_SERVICE_KEY=tu_service_role_key
```

---

## PASO 3: Deploy Backend en Render (30 min)

### 3.1 Crear Cuenta en Render

1. Ir a [render.com](https://render.com)
2. Registrarse con GitHub (recomendado)

### 3.2 Crear Web Service

1. Click en "New +" → "Web Service"
2. Conectar repositorio de GitHub
3. Configurar:

| Campo | Valor |
|-------|-------|
| **Name** | `vera-backend` |
| **Root Directory** | `server` |
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node index.js` |
| **Plan** | `Free` |

### 3.3 Agregar Variables de Entorno

En la sección "Environment Variables", agregar:

```
NODE_ENV                = production
PORT                    = 5000
JWT_SECRET              = [tu_secret_64_chars]
DATABASE_URL            = postgresql://postgres:[PASS]@db.[PROJECT].supabase.co:5432/postgres
SUPABASE_URL            = https://[PROJECT].supabase.co
SUPABASE_SERVICE_KEY    = [tu_service_role_key]
GROQ_API_KEY            = [tu_clave_groq]
MERCADOPAGO_PUBLIC_KEY  = [tu_public_key]
MERCADOPAGO_ACCESS_TOKEN= [tu_access_token]
BACKEND_URL             = https://vera-backend.onrender.com
FRONTEND_URL            = https://vera-ai.vercel.app
EMAIL_USER              = [tu_email@gmail.com]
EMAIL_PASSWORD          = [tu_app_password]
GOOGLE_CLIENT_ID        = [tu_client_id]
GOOGLE_CLIENT_SECRET    = [tu_client_secret]
GOOGLE_REDIRECT_URI     = https://vera-backend.onrender.com/api/calendar/oauth/callback
```

### 3.4 Deploy

1. Click "Create Web Service"
2. Render construirá y desplegará automáticamente
3. Esperar ~3-5 minutos
4. Copiar la URL: `https://vera-backend.onrender.com`

### 3.5 Verificar

```bash
curl https://vera-backend.onrender.com/health
# Respuesta esperada: {"status":"ok","timestamp":"..."}
```

---

## PASO 4: Deploy Frontend en Vercel (15 min)

### 4.1 Crear Cuenta en Vercel

1. Ir a [vercel.com](https://vercel.com)
2. Registrarse con GitHub

### 4.2 Importar Proyecto

1. Click "Add New Project"
2. Seleccionar tu repositorio
3. Vercel detecta automáticamente que es Vite

### 4.3 Configurar

| Campo | Valor |
|-------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `.` (raíz) |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

**Variables de Entorno:**
```
VITE_API_URL = https://vera-backend.onrender.com
```

### 4.4 Configurar Redirects para SPA

Crear archivo `vercel.json` en la raíz del proyecto:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 4.5 Deploy

1. Click "Deploy"
2. Esperar ~2 minutos
3. Copiar URL: `https://vera-ai.vercel.app`

### 4.6 Actualizar FRONTEND_URL en Render

Volver a Render → Environment Variables → Actualizar:
```
FRONTEND_URL = https://vera-ai.vercel.app
```

---

## PASO 5: Configurar Servicios Externos (60 min)

### 5.1 Mercado Pago

1. Ir a [mercadopago.com.ar/developers](https://www.mercadopago.com.ar/developers)
2. Crear aplicación de **producción** (no test)
3. Copiar credenciales de producción
4. Ir a **Webhooks** → Configurar:
   - URL: `https://vera-backend.onrender.com/api/webhooks/mercadopago`
   - Eventos: `payment`
5. Actualizar variables en Render con las nuevas credenciales

### 5.2 Google Calendar

1. Ir a [console.cloud.google.com](https://console.cloud.google.com)
2. Seleccionar proyecto → APIs & Services → Credentials
3. Editar tu OAuth 2.0 Client ID
4. En "Authorized redirect URIs" agregar:
   ```
   https://vera-backend.onrender.com/api/calendar/oauth/callback
   ```
5. En "Authorized JavaScript origins" agregar:
   ```
   https://vera-ai.vercel.app
   ```
6. Guardar

### 5.3 Gmail SMTP

1. Ir a [myaccount.google.com/security](https://myaccount.google.com/security)
2. Activar "Verificación en 2 pasos" si no está activa
3. Buscar "Contraseñas de aplicaciones"
4. Generar contraseña para "Correo" → "Otro dispositivo" → "Vera AI"
5. Copiar los 16 caracteres → Actualizar `EMAIL_PASSWORD` en Render

---

## PASO 6: Pruebas Finales (20 min)

### Checklist de Verificación

```
□ Abrir https://vera-ai.vercel.app
□ Logo de Vera visible en navbar
□ Chat con Oliver responde
□ Planes se muestran correctamente
□ Botón de pago redirige a Mercado Pago
□ Email de confirmación llega
□ Login funciona
□ Dashboard carga con datos
□ Funciona en móvil
□ HTTPS activo en ambas URLs
```

### Probar Health Check del Backend

```bash
curl https://vera-backend.onrender.com/health
```

### Probar Chat (sin login)

```bash
curl -X POST https://vera-backend.onrender.com/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "groq",
    "model": "llama-3.3-70b-versatile",
    "messages": [{"role": "user", "content": "Hola, ¿qué servicios ofrecen?"}],
    "temperature": 0.7,
    "maxTokens": 256
  }'
```

---

## ⚠️ Limitaciones y Soluciones

### Render Free - Cold Start

**Problema:** El servidor se "duerme" tras 15 min de inactividad. El primer request tarda ~30 segundos.

**Solución:** Usar [UptimeRobot](https://uptimerobot.com) (gratis) para hacer ping cada 14 minutos:
1. Crear cuenta en uptimerobot.com
2. "Add New Monitor" → HTTP(s)
3. URL: `https://vera-backend.onrender.com/health`
4. Interval: 14 minutes
5. Esto mantiene el servidor activo 24/7

### Supabase Free - Pausa por Inactividad

**Problema:** Los proyectos se pausan tras 1 semana sin actividad.

**Solución:** 
- Acceder al dashboard de Supabase al menos una vez por semana
- O agregar el endpoint de Supabase al monitor de UptimeRobot

### Límites de Supabase Free

| Recurso | Límite Free |
|---------|------------|
| Base de datos | 500 MB |
| Usuarios activos/mes | 50,000 |
| Proyectos activos | 2 |
| Bandwidth | 5 GB/mes |
| Edge Functions | 500,000 invocaciones/mes |

Para Vera AI en sus primeros meses, estos límites son más que suficientes.

---

## 🔄 Actualizar la Aplicación

Cuando hagas cambios en el código:

```bash
# Hacer commit y push
git add .
git commit -m "Descripción del cambio"
git push origin main

# Vercel y Render se actualizan automáticamente
# (si están conectados al repositorio de GitHub)
```

---

## 🆘 Troubleshooting

### Error: "Cannot connect to database"
```
Verificar DATABASE_URL en Render
Verificar que el proyecto de Supabase esté activo (no pausado)
Verificar que la contraseña en la URL sea correcta
```

### Error: "CORS policy"
```
Verificar FRONTEND_URL en Render
Debe ser exactamente: https://vera-ai.vercel.app (sin slash final)
```

### Error: "Invalid API Key" (Groq)
```
Verificar GROQ_API_KEY en Render
Obtener nueva clave en console.groq.com
```

### Error: "Webhook not received" (Mercado Pago)
```
Verificar que la URL del webhook sea pública
Verificar en el panel de MP que el webhook esté activo
Revisar logs en Render
```

### Supabase pausado
```
Ir a supabase.com → Dashboard → Reactivar proyecto
Esperar ~2 minutos para que se reactive
```

---

## 📊 Monitoreo

### Logs del Backend (Render)
- Ir a Render → tu servicio → "Logs"
- Ver logs en tiempo real

### Métricas de Base de Datos (Supabase)
- Ir a Supabase → Dashboard → "Reports"
- Ver queries, conexiones, storage

### Uptime del Frontend (Vercel)
- Ir a Vercel → tu proyecto → "Analytics"

---

## 🔒 Seguridad Post-Deploy

Una vez en producción, implementar en `server/index.js`:

```bash
cd server
npm install helmet express-rate-limit
```

```javascript
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

app.use(helmet());
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use('/api/ai/', rateLimit({ windowMs: 60 * 1000, max: 20 }));
```

Ver guía completa en `MEJORAS_SEGURIDAD.md`.

---

## ✅ Resumen

| Paso | Tiempo | Servicio |
|------|--------|---------|
| 1. Crear Supabase | 15 min | supabase.com |
| 2. Migrar a PostgreSQL | 30 min | Código local |
| 3. Deploy Backend | 30 min | render.com |
| 4. Deploy Frontend | 15 min | vercel.com |
| 5. Servicios externos | 60 min | MP, Google, Gmail |
| 6. Pruebas | 20 min | - |
| **TOTAL** | **~2.5 horas** | |

**Costo mensual: $0** 🎉

---

*Última actualización: 1 de Mayo, 2026 | Vera AI v1.0.0*
