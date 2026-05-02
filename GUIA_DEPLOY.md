# 🚀 Guía de Deploy - Vera AI

## Arquitectura Recomendada (100% Gratis)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    VERCEL       │────▶│    RENDER       │────▶│   SUPABASE      │
│   (Frontend)    │     │   (Backend)     │     │  (Base de Datos)│
│   React + Vite  │     │  Node.js +      │     │  PostgreSQL     │
│   GRATIS ✅     │     │  Express        │     │  GRATIS ✅      │
│                 │     │  GRATIS ✅      │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

**Costo total: $0/mes** 🎉

---

## 📦 Opción Principal: Vercel + Render + Supabase (Recomendada)

> 📖 **Guía detallada paso a paso:** `GUIA_DEPLOY_SUPABASE.md`
> 📋 **Checklist visual:** `CHECKLIST_RAPIDO.md`

### Resumen de Pasos

| Paso | Servicio | Tiempo |
|------|---------|--------|
| 1. Crear DB | Supabase | 15 min |
| 2. Migrar a PostgreSQL | Código local | 30 min |
| 3. Deploy Backend | Render | 30 min |
| 4. Deploy Frontend | Vercel | 15 min |
| 5. Servicios externos | MP, Google, Gmail | 60 min |
| 6. Pruebas | - | 20 min |
| **Total** | | **~2.5 horas** |

### Ventajas
- ✅ **100% gratuito** sin tarjeta de crédito
- ✅ HTTPS automático en todos los servicios
- ✅ Deploy automático desde Git
- ✅ Logs y monitoreo incluidos
- ✅ Base de datos PostgreSQL con dashboard visual
- ✅ Backups automáticos en Supabase

### Limitaciones del Plan Gratuito

| Servicio | Limitación |
|---------|-----------|
| Render | Cold start ~30s tras 15 min inactivo |
| Supabase | Se pausa tras 1 semana sin actividad |
| Vercel | 100 GB bandwidth/mes |

> 💡 **Solución para Render:** Usar [UptimeRobot](https://uptimerobot.com) (gratis) para hacer ping cada 14 min y mantener el servidor activo.

---

## 📦 Opción 2: Vercel + Railway + Supabase (De Pago)

Si necesitas más estabilidad sin cold starts:

### Railway (Backend)
- **Costo:** $5/mes
- **Ventaja:** Sin cold starts, siempre activo
- **Configuración:** Igual que Render pero en railway.app

### Pasos
1. Crear proyecto en Supabase (igual que opción principal)
2. Crear Web Service en Railway:
   - Root Directory: `server`
   - Start Command: `node index.js`
3. Agregar variables de entorno
4. Deploy frontend en Vercel (igual)

---

## 📦 Opción 3: VPS Manual (Máximo Control)

Para máximo control y escalabilidad:

### Requisitos
- Servidor Ubuntu 22.04 (DigitalOcean, AWS, etc.)
- Node.js 18+
- Nginx
- PM2
- Certbot (HTTPS)

### Costo
- DigitalOcean Droplet básico: $6/mes
- Supabase Free: $0/mes
- **Total: $6/mes**

### Pasos Resumidos

```bash
# 1. Preparar servidor
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs nginx
sudo npm install -g pm2

# 2. Clonar proyecto
git clone https://github.com/tu-usuario/vera-ai.git
cd vera-ai

# 3. Configurar backend
cd server
npm install
cp .env.example .env
nano .env  # Configurar todas las variables

# 4. Iniciar con PM2
pm2 start index.js --name vera-backend
pm2 save && pm2 startup

# 5. Build frontend
cd ..
npm install
echo "VITE_API_URL=https://api.tu-dominio.com" > .env
npm run build

# 6. Configurar Nginx
sudo nano /etc/nginx/sites-available/vera
# (ver configuración abajo)

# 7. HTTPS con Certbot
sudo certbot --nginx -d tu-dominio.com -d api.tu-dominio.com
```

### Configuración Nginx

```nginx
# Frontend
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;
    root /home/vera/vera-ai/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Backend
server {
    listen 80;
    server_name api.tu-dominio.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🔄 Actualizar la Aplicación

### Con Vercel + Render (automático)
```bash
git add .
git commit -m "Descripción del cambio"
git push origin main
# Vercel y Render se actualizan automáticamente
```

### Con VPS (manual)
```bash
# En el servidor
cd ~/vera-ai
git pull origin main

# Actualizar backend
cd server && npm install
pm2 restart vera-backend

# Actualizar frontend
cd ..
npm install && npm run build
```

---

## 🆘 Troubleshooting

### Frontend no carga
```
1. Verificar que el build fue exitoso en Vercel
2. Verificar que vercel.json tiene los rewrites configurados
3. Verificar VITE_API_URL apunta al backend correcto
```

### Backend no responde
```
1. Verificar logs en Render (o Railway/VPS)
2. Verificar que DATABASE_URL es correcta
3. Verificar que Supabase no está pausado
4. Si es Render Free: esperar 30s (cold start)
```

### Base de datos no conecta
```
1. Verificar DATABASE_URL en variables de entorno
2. Ir a Supabase → verificar que el proyecto está activo
3. Verificar que la contraseña en la URL es correcta
4. Verificar que SSL está configurado correctamente
```

### Webhooks de Mercado Pago no funcionan
```
1. Verificar que la URL del webhook es pública (no localhost)
2. Verificar en el panel de MP que el webhook está activo
3. Revisar logs del backend
4. Verificar que el evento configurado es "payment"
```

### OAuth de Google falla
```
1. Verificar redirect URI exacto en Google Cloud Console
2. Verificar que el dominio está en "Authorized JavaScript origins"
3. Verificar GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET
```

---

## 📊 Comparación de Opciones

| Característica | Vercel+Render+Supabase | Vercel+Railway+Supabase | VPS |
|---------------|----------------------|------------------------|-----|
| Costo/mes | **$0** | $5 | $6 |
| Cold starts | Sí (Render) | No | No |
| HTTPS | Automático | Automático | Manual |
| Deploy automático | Sí | Sí | No |
| Escalabilidad | Media | Media | Alta |
| Control | Bajo | Bajo | Alto |
| Dificultad | Fácil | Fácil | Difícil |
| Recomendado para | Empezar | Crecer | Escalar |

---

## ✅ Checklist Post-Deploy

- [ ] Frontend accesible en HTTPS
- [ ] Backend accesible en HTTPS
- [ ] Health check responde: `/health`
- [ ] Chat con Oliver funciona
- [ ] Checkout de Mercado Pago funciona
- [ ] Webhooks de Mercado Pago configurados
- [ ] Google Calendar OAuth funciona
- [ ] Emails se envían correctamente
- [ ] Login y dashboard funcionan
- [ ] Funciona en móvil
- [ ] UptimeRobot configurado (si usas Render Free)

---

*Última actualización: 1 de Mayo, 2026 | Vera AI v1.0.0*
