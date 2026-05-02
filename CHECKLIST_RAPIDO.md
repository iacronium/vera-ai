# ✅ Checklist Rápido - Deploy de Vera AI

## 🏗️ Arquitectura (100% GRATIS)
```
Vercel (Frontend) + Render (Backend) + Supabase (Base de Datos)
```

---

## PASO 1: Supabase - Base de Datos (15 min)

- [ ] Crear cuenta en [supabase.com](https://supabase.com)
- [ ] Crear nuevo proyecto → Guardar contraseña de DB
- [ ] Ir a **Settings → API** → Copiar:
  - [ ] `Project URL` → guardar como `SUPABASE_URL`
  - [ ] `service_role` key → guardar como `SUPABASE_SERVICE_KEY`
- [ ] Ir a **Settings → Database** → Copiar `Connection string (URI)` → guardar como `DATABASE_URL`
- [ ] Ir a **SQL Editor** → Ejecutar el SQL de creación de tablas (ver `GUIA_DEPLOY_SUPABASE.md`)
- [ ] Verificar que las 4 tablas se crearon: `users`, `leads`, `metrics`, `payments`

---

## PASO 2: Migrar Backend a PostgreSQL (30 min)

- [ ] Instalar dependencia: `cd server && npm install pg`
- [ ] Reemplazar `server/db.js` con versión PostgreSQL (ver `MIGRACION_SQLITE_POSTGRES.md`)
- [ ] Actualizar `server/routes/auth.js` → cambiar `?` por `$1`, `.get()` por `.rows[0]`
- [ ] Actualizar `server/routes/data.js` → cambiar sintaxis SQLite por PostgreSQL
- [ ] Actualizar `server/routes/mercadoPago.js` → cambiar sintaxis
- [ ] Actualizar `server/routes/calendar.js` → cambiar sintaxis
- [ ] Probar localmente: `cd server && node index.js` → debe mostrar "Conectado a Supabase ✅"

---

## PASO 3: Variables de Entorno (20 min)

### Generar JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Backend (`server/.env`)
- [ ] `JWT_SECRET` → Pegar el resultado del comando anterior
- [ ] `DATABASE_URL` → URL de conexión de Supabase
- [ ] `SUPABASE_URL` → Project URL de Supabase
- [ ] `SUPABASE_SERVICE_KEY` → service_role key de Supabase
- [ ] `GROQ_API_KEY` → Tu clave real de Groq
- [ ] `MERCADOPAGO_PUBLIC_KEY` → Clave pública de producción
- [ ] `MERCADOPAGO_ACCESS_TOKEN` → Token de producción
- [ ] `BACKEND_URL` → `https://vera-backend.onrender.com` (actualizar después)
- [ ] `FRONTEND_URL` → `https://vera-ai.vercel.app` (actualizar después)
- [ ] `EMAIL_USER` → Tu email de Gmail
- [ ] `EMAIL_PASSWORD` → Contraseña de aplicación (16 chars)
- [ ] `GOOGLE_CLIENT_ID` → Client ID de Google Cloud
- [ ] `GOOGLE_CLIENT_SECRET` → Client Secret
- [ ] `GOOGLE_REDIRECT_URI` → `https://vera-backend.onrender.com/api/calendar/oauth/callback`

### Frontend (`.env`)
- [ ] `VITE_API_URL` → `https://vera-backend.onrender.com`

---

## PASO 4: Deploy Backend en Render (30 min)

- [ ] Crear cuenta en [render.com](https://render.com)
- [ ] "New +" → "Web Service"
- [ ] Conectar repositorio de GitHub
- [ ] Configurar:
  - [ ] Root Directory: `server`
  - [ ] Build Command: `npm install`
  - [ ] Start Command: `node index.js`
  - [ ] Plan: `Free`
- [ ] Agregar TODAS las variables de entorno del paso anterior
- [ ] Click "Create Web Service" → Esperar deploy (~3-5 min)
- [ ] Copiar URL: `https://vera-backend.onrender.com`
- [ ] Verificar: `curl https://vera-backend.onrender.com/health`

---

## PASO 5: Deploy Frontend en Vercel (15 min)

- [ ] Crear cuenta en [vercel.com](https://vercel.com)
- [ ] "Add New Project" → Importar repositorio
- [ ] Configurar variable: `VITE_API_URL` = URL de Render
- [ ] Crear `vercel.json` en la raíz:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```
- [ ] Click "Deploy" → Esperar (~2 min)
- [ ] Copiar URL: `https://vera-ai.vercel.app`
- [ ] Volver a Render → Actualizar `FRONTEND_URL` con la URL de Vercel

---

## PASO 6: Configurar Servicios Externos (60 min)

### Mercado Pago
- [ ] Ir a [mercadopago.com.ar/developers](https://www.mercadopago.com.ar/developers)
- [ ] Crear aplicación de **producción** (no test)
- [ ] Copiar credenciales de producción → Actualizar en Render
- [ ] Configurar webhook: `https://vera-backend.onrender.com/api/webhooks/mercadopago`
- [ ] Evento: `payment`

### Google Calendar
- [ ] Ir a [console.cloud.google.com](https://console.cloud.google.com)
- [ ] APIs & Services → Credentials → Editar OAuth Client
- [ ] Agregar redirect URI: `https://vera-backend.onrender.com/api/calendar/oauth/callback`
- [ ] Agregar origen autorizado: `https://vera-ai.vercel.app`

### Gmail SMTP
- [ ] Ir a [myaccount.google.com/security](https://myaccount.google.com/security)
- [ ] Activar verificación en 2 pasos
- [ ] Generar contraseña de aplicación → Actualizar `EMAIL_PASSWORD` en Render

### UptimeRobot (Evitar cold start de Render)
- [ ] Crear cuenta en [uptimerobot.com](https://uptimerobot.com)
- [ ] "Add New Monitor" → HTTP(s)
- [ ] URL: `https://vera-backend.onrender.com/health`
- [ ] Interval: 14 minutes

---

## PASO 7: Pruebas Finales (20 min)

### Funcionalidad Básica
- [ ] Abrir `https://vera-ai.vercel.app`
- [ ] Logo de Vera visible en navbar
- [ ] Footer muestra "© 2026 Vera"
- [ ] HTTPS activo (candado verde)

### Chat con Oliver
- [ ] Enviar mensaje de prueba
- [ ] Oliver responde en < 5 segundos
- [ ] Respuesta en español
- [ ] Tarjetas de planes aparecen al preguntar por planes

### Pagos
- [ ] Click en botón de pago
- [ ] Redirige a Mercado Pago
- [ ] Completar pago de prueba
- [ ] Recibir email de confirmación

### Autenticación
- [ ] Ir a `/login`
- [ ] Login con credenciales
- [ ] Dashboard carga correctamente
- [ ] Logout funciona

### Responsive
- [ ] Abrir en móvil
- [ ] Chat funciona
- [ ] Navegación funciona

---

## 🆘 Si Algo Falla

| Problema | Solución |
|---------|---------|
| Backend no responde | Verificar logs en Render |
| DB no conecta | Verificar `DATABASE_URL`, verificar que Supabase no esté pausado |
| Frontend en blanco | Verificar `VITE_API_URL` en Vercel |
| Pagos fallan | Verificar credenciales de producción (no test) en Render |
| Emails no llegan | Verificar contraseña de aplicación Gmail |
| OAuth Google falla | Verificar redirect URI exacto en Google Cloud |
| Render tarda 30s | Normal (cold start). Configurar UptimeRobot para evitarlo |
| Supabase pausado | Entrar al dashboard → Reactivar proyecto |

---

## 💰 Costo Total: $0/mes

| Servicio | Plan | Costo |
|---------|------|-------|
| Vercel | Free | $0 |
| Render | Free | $0 |
| Supabase | Free | $0 |
| Groq | Free tier | $0 |
| **TOTAL** | | **$0/mes** |

---

**Tiempo total estimado: ~2.5 horas**

*Última actualización: 1 de Mayo, 2026 | Vera AI v1.0.0*
