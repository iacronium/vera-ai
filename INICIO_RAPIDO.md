# 🚀 Inicio Rápido - Webhooks de Mercado Pago

## Opción 1: Instalación y configuración automática (Recomendado)

### Paso 1: Ejecutar el script de configuración

Abre PowerShell en la carpeta del proyecto y ejecuta:

```powershell
.\setup-ngrok.ps1
```

El script te pedirá tu **authtoken de ngrok**. Obtenlo aquí:
👉 https://dashboard.ngrok.com/get-started/your-authtoken

El script hará automáticamente:
- ✅ Descargar ngrok si no lo tienes
- ✅ Configurar tu authtoken
- ✅ Iniciar ngrok en el puerto 5000

### Paso 2: Copiar la URL pública

Cuando ngrok se inicie, verás algo como:

```
Forwarding    https://abc123.ngrok-free.app -> http://localhost:5000
```

**Copia esa URL HTTPS** (ej: `https://abc123.ngrok-free.app`)

### Paso 3: Configurar en Mercado Pago

1. Ve a: https://www.mercadopago.com.ar/developers/panel/app
2. Selecciona tu aplicación
3. Ve a **"Webhooks"**
4. Agrega esta URL:
   ```
   https://abc123.ngrok-free.app/api/webhooks/mercadopago
   ```
   (Reemplaza con tu URL de ngrok)
5. Selecciona evento: **"Pagos"**
6. Guarda

### Paso 4: ¡Listo! Probar el sistema

1. Ve a: http://localhost:5173/plans
2. Selecciona un plan
3. Usa tarjeta de prueba:
   - **Número**: `4509 9535 6623 3704`
   - **Nombre**: `APRO`
   - **Vencimiento**: `11/25`
   - **CVV**: `123`
   - **DNI**: `12345678`

---

## Opción 2: Instalación manual

### Paso 1: Descargar ngrok

1. Ve a: https://ngrok.com/download
2. Descarga la versión para Windows
3. Extrae `ngrok.exe` a `C:\ngrok\`

### Paso 2: Configurar authtoken

Abre PowerShell y ejecuta:

```powershell
cd C:\ngrok
.\ngrok.exe config add-authtoken TU_AUTHTOKEN_AQUI
```

Obtén tu authtoken aquí: https://dashboard.ngrok.com/get-started/your-authtoken

### Paso 3: Iniciar ngrok

```powershell
cd C:\ngrok
.\ngrok.exe http 5000
```

O si agregaste ngrok al PATH:

```powershell
ngrok http 5000
```

### Paso 4: Configurar webhook (igual que Opción 1, Paso 3)

---

## 🔄 Uso diario

Una vez configurado, solo necesitas:

### Terminal 1: Backend
```powershell
cd server
node index.js
```

### Terminal 2: Frontend
```powershell
npm run dev
```

### Terminal 3: ngrok
```powershell
.\start-webhook.ps1
```

O manualmente:
```powershell
ngrok http 5000
```

---

## ⚡ Script de inicio rápido

Para iniciar ngrok rápidamente (después de la configuración inicial):

```powershell
.\start-webhook.ps1
```

Este script:
- ✅ Busca ngrok automáticamente
- ✅ Verifica que el backend esté corriendo
- ✅ Inicia ngrok con instrucciones claras

---

## 🔍 Verificar el sistema

Para verificar que todo esté funcionando:

```powershell
.\check-system.ps1
```

---

## 📊 Ver logs de webhooks

### En el backend
Los logs aparecen en la terminal donde corre `node index.js`:

```
[mercadopago] Webhook received: { type: 'payment', data: { id: '123456' } }
[mercadopago] Payment approved for cliente@empresa.com
```

### En ngrok
Abre tu navegador en: http://localhost:4040

Aquí puedes ver:
- Todas las peticiones HTTP
- El payload completo de cada webhook
- Las respuestas del servidor

---

## ⚠️ Importante

### La URL de ngrok cambia cada vez

En el plan gratuito de ngrok, la URL cambia cada vez que reinicias ngrok.

**Solución:**
- Actualiza la URL en Mercado Pago cada vez que reinicies ngrok
- O considera el plan de pago de ngrok para una URL fija

### Mantén ngrok corriendo

ngrok debe estar corriendo mientras:
- Estés probando pagos
- Quieras recibir webhooks de Mercado Pago

---

## 🐛 Problemas comunes

### "ngrok no encontrado"

**Solución:**
```powershell
.\setup-ngrok.ps1
```

### "Backend no está corriendo"

**Solución:**
```powershell
cd server
node index.js
```

### "El webhook no se recibe"

**Verificar:**
1. ✅ ngrok está corriendo
2. ✅ Backend está corriendo
3. ✅ URL correcta en Mercado Pago
4. ✅ Evento "Pagos" seleccionado

**Ver logs:**
- Backend: Terminal donde corre `node index.js`
- ngrok: http://localhost:4040

---

## 📚 Documentación completa

Para más detalles, consulta:
- `WEBHOOK_SETUP_GUIDE.md` - Guía detallada paso a paso
- `MERCADOPAGO_SETUP.md` - Configuración de Mercado Pago
- `README.md` - Documentación completa del proyecto

---

## ✅ Checklist

- [ ] ngrok instalado
- [ ] Authtoken configurado
- [ ] Backend corriendo (http://localhost:5000)
- [ ] Frontend corriendo (http://localhost:5173)
- [ ] ngrok corriendo (ver URL en terminal)
- [ ] Webhook configurado en Mercado Pago
- [ ] Prueba con tarjeta de prueba realizada
- [ ] Webhook recibido (ver logs del backend)

---

**¿Necesitas ayuda?** Ejecuta `.\check-system.ps1` para diagnosticar problemas.
