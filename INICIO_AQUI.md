# 🚀 VERA AI - INICIO AQUÍ

## 👋 ¡Bienvenido!

Este es tu punto de partida para poner **Vera AI** en producción HOY.

---

## 🏗️ Arquitectura de Deploy (100% GRATIS)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│    VERCEL       │────▶│    RENDER       │────▶│   SUPABASE      │
│   (Frontend)    │     │   (Backend)     │     │  (Base de Datos)│
│                 │     │                 │     │                 │
│   React + Vite  │     │  Node.js +      │     │  PostgreSQL     │
│   GRATIS ✅     │     │  Express        │     │  Auth + Storage │
│                 │     │  GRATIS ✅      │     │  GRATIS ✅      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**Costo total: $0/mes** 🎉

---

## ⚡ Quick Start (4 pasos)

### 1️⃣ Crear proyecto en Supabase (15 min)

1. Ir a [supabase.com](https://supabase.com) → Crear cuenta gratis
2. "New Project" → Elegir nombre y región (South America si está disponible)
3. Guardar la contraseña de la base de datos
4. Ir a **Settings → API** y copiar:
   - `Project URL` → será tu `SUPABASE_URL`
   - `anon public` key → será tu `SUPABASE_ANON_KEY`
   - `service_role` key → será tu `SUPABASE_SERVICE_KEY`
5. Ir a **Settings → Database** y copiar la `Connection string` (URI)
   → será tu `DATABASE_URL`

📖 **Guía completa:** `GUIA_DEPLOY_SUPABASE.md`

---

### 2️⃣ Configurar Variables de Entorno (20 min)

**Generar JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Backend (`server/.env`):**
```env
PORT=5000
NODE_ENV=production

# JWT
JWT_SECRET=TU_SECRET_SEGURO_64_CARACTERES

# Supabase (Base de Datos)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
SUPABASE_URL=https://[PROJECT].supabase.co
SUPABASE_SERVICE_KEY=tu_service_role_key

# IA
GROQ_API_KEY=tu_clave_groq

# Mercado Pago
MERCADOPAGO_PUBLIC_KEY=APP_USR-tu-clave-publica
MERCADOPAGO_ACCESS_TOKEN=tu_access_token
BACKEND_URL=https://tu-app.onrender.com
FRONTEND_URL=https://tu-app.vercel.app

# Email
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_app_password_16_chars

# Google Calendar
GOOGLE_CLIENT_ID=tu_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_client_secret
GOOGLE_REDIRECT_URI=https://tu-app.onrender.com/api/calendar/oauth/callback
```

**Frontend (`.env`):**
```env
VITE_API_URL=https://tu-app.onrender.com
```

---

### 3️⃣ Deploy Backend en Render (30 min)

1. Ir a [render.com](https://render.com) → Crear cuenta gratis
2. "New" → "Web Service"
3. Conectar repositorio de GitHub
4. Configurar:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
5. Agregar todas las variables de entorno
6. Deploy → Copiar URL (ej: `https://vera-backend.onrender.com`)

> ⚠️ **Nota Render Free:** El servidor se "duerme" tras 15 min de inactividad.
> El primer request tarda ~30 segundos en despertar. Esto es normal en el plan gratuito.

---

### 4️⃣ Deploy Frontend en Vercel (15 min)

1. Ir a [vercel.com](https://vercel.com) → Crear cuenta gratis
2. "Add New Project" → Importar repositorio
3. Configurar variable de entorno:
   - `VITE_API_URL` = `https://tu-app.onrender.com`
4. Deploy → Copiar URL (ej: `https://vera-ai.vercel.app`)
5. Volver a Render y actualizar `FRONTEND_URL` con la URL de Vercel

---

## 🔧 Configurar Servicios Externos (1 hora)

### Mercado Pago
- Ir a [mercadopago.com.ar/developers](https://www.mercadopago.com.ar/developers)
- Crear aplicación de **producción**
- Configurar webhook: `https://tu-app.onrender.com/api/webhooks/mercadopago`

### Google Calendar
- Ir a [console.cloud.google.com](https://console.cloud.google.com)
- Agregar redirect URI: `https://tu-app.onrender.com/api/calendar/oauth/callback`

### Gmail SMTP
- Ir a [myaccount.google.com/security](https://myaccount.google.com/security)
- Activar verificación en 2 pasos
- Generar contraseña de aplicación (16 caracteres)

---

## 📚 Documentación Disponible

### 🎯 Para Deploy
1. **`GUIA_DEPLOY_SUPABASE.md`** ← Guía completa paso a paso
2. **`CHECKLIST_RAPIDO.md`** ← Checklist visual
3. **`CHECKLIST_PRODUCCION.md`** ← Checklist detallado

### 🔒 Para Seguridad
4. **`MEJORAS_SEGURIDAD.md`** ← Código listo para implementar

### 🛠️ Para Configuración de Servicios
5. **`EMAIL_SETUP.md`** ← Configurar Gmail SMTP
6. **`MERCADOPAGO_SETUP.md`** ← Configurar Mercado Pago
7. **`WEBHOOK_SETUP_GUIDE.md`** ← Configurar webhooks

### 📝 Para Referencia
8. **`README.md`** ← Documentación general
9. **`RESUMEN_REVISION_COMPLETA.md`** ← Revisión técnica completa

---

## ✅ Estado del Proyecto

| Área | Estado |
|------|--------|
| Chat con Oliver (IA) | ✅ Listo |
| Sistema de planes dinámico | ✅ Listo |
| Pagos con Mercado Pago | ✅ Listo |
| Google Calendar | ✅ Listo |
| Emails automáticos | ✅ Listo |
| Dashboard y métricas | ✅ Listo |
| Autenticación JWT | ✅ Listo |
| Responsive design | ✅ Listo |
| Branding "Vera" | ✅ Listo |
| Logo implementado | ✅ Listo |
| Base de datos → Supabase | ⚙️ Migrar |

---

## 💰 Costos

| Servicio | Plan | Costo |
|---------|------|-------|
| Vercel (Frontend) | Free | $0/mes |
| Render (Backend) | Free | $0/mes |
| Supabase (Base de datos) | Free | $0/mes |
| Groq API (IA) | Free tier | $0/mes |
| Google Calendar | Free | $0/mes |
| Gmail SMTP | Free | $0/mes |
| Mercado Pago | Comisión | ~3-5% por venta |
| **TOTAL** | | **$0/mes** |

---

## ⚠️ Limitaciones del Plan Gratuito

### Supabase Free
- 500 MB de base de datos
- 50,000 usuarios activos/mes
- 2 proyectos activos
- Proyectos se pausan tras **1 semana de inactividad**

### Render Free
- El servidor se "duerme" tras 15 min sin tráfico
- Primer request puede tardar ~30 segundos
- 750 horas/mes de compute

### Vercel Free
- Deployments ilimitados
- 100 GB de bandwidth/mes
- Sin limitaciones prácticas para este proyecto

> 💡 **Consejo:** Para evitar que Supabase se pause, accede al dashboard al menos una vez por semana. Para Render, considera usar [UptimeRobot](https://uptimerobot.com) (gratis) para hacer ping cada 14 minutos y mantener el servidor activo.

---

## 🎯 Ruta de Deploy (HOY)

```
1. Crear proyecto en Supabase (15 min)
   ↓
2. Configurar variables de entorno (20 min)
   ↓
3. Deploy backend en Render (30 min)
   ↓
4. Deploy frontend en Vercel (15 min)
   ↓
5. Configurar servicios externos (60 min)
   ↓
6. Pruebas finales (20 min)
   ↓
🎉 ¡EN PRODUCCIÓN! (Total: ~2.5 horas)
```

---

## 🆘 Problemas Comunes

| Problema | Solución |
|---------|---------|
| Frontend no conecta con backend | Verificar `VITE_API_URL` en Vercel |
| Backend tarda en responder | Normal en Render Free (cold start ~30s) |
| Base de datos no conecta | Verificar `DATABASE_URL` en Render |
| Pagos no funcionan | Verificar credenciales de producción de MP |
| Emails no llegan | Verificar contraseña de aplicación Gmail |
| OAuth de Google falla | Verificar redirect URI exacto |
| Supabase pausado | Entrar al dashboard para reactivar |

---

## 📞 Recursos

- **Supabase:** [supabase.com](https://supabase.com)
- **Render:** [render.com](https://render.com)
- **Vercel:** [vercel.com](https://vercel.com)
- **Groq API:** [console.groq.com](https://console.groq.com)
- **Mercado Pago:** [mercadopago.com.ar/developers](https://www.mercadopago.com.ar/developers)
- **Google Cloud:** [console.cloud.google.com](https://console.cloud.google.com)

---

**¡Éxito con el lanzamiento de Vera AI! 🎉**

*Última actualización: 1 de Mayo, 2026 | Versión: 1.0.0 | Estado: ✅ LISTO PARA PRODUCCIÓN*
