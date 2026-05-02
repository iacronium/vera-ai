# 🔔 Guía de Configuración de Webhooks - Mercado Pago

## 📋 Requisitos previos

- ✅ Servidor backend corriendo en http://localhost:5000
- ✅ Credenciales de Mercado Pago configuradas
- ⏳ ngrok instalado (lo instalaremos ahora)

---

## 🚀 Paso 1: Instalar ngrok

### Opción A: Descarga directa (Recomendado para Windows)

1. **Ve a la página de descargas de ngrok**:
   - Abre tu navegador en: https://ngrok.com/download
   
2. **Descarga la versión para Windows**:
   - Haz clic en el botón "Download for Windows"
   - Se descargará un archivo ZIP

3. **Extrae el archivo**:
   - Abre el archivo ZIP descargado
   - Extrae `ngrok.exe` a una carpeta fácil de acceder
   - Recomendado: `C:\ngrok\ngrok.exe`

4. **Agrega ngrok al PATH (opcional pero recomendado)**:
   - Presiona `Win + R` y escribe `sysdm.cpl`
   - Ve a la pestaña "Opciones avanzadas"
   - Haz clic en "Variables de entorno"
   - En "Variables del sistema", busca "Path" y haz clic en "Editar"
   - Haz clic en "Nuevo" y agrega la ruta donde guardaste ngrok (ej: `C:\ngrok`)
   - Haz clic en "Aceptar" en todas las ventanas
   - **Reinicia tu terminal PowerShell**

### Opción B: Con Chocolatey (si lo tienes instalado)

```powershell
choco install ngrok
```

### Opción C: Con Scoop (si lo tienes instalado)

```powershell
scoop install ngrok
```

---

## 🔑 Paso 2: Crear cuenta en ngrok (Gratis)

1. **Ve a**: https://dashboard.ngrok.com/signup
2. **Regístrate** con tu email o cuenta de Google/GitHub
3. **Verifica tu email** (si es necesario)
4. **Copia tu authtoken**:
   - Después de registrarte, verás tu authtoken en el dashboard
   - Se ve así: `2abc123def456ghi789jkl012mno345_6pqr789stu012vwx345yz`

---

## ⚙️ Paso 3: Configurar ngrok con tu authtoken

Abre PowerShell o CMD y ejecuta:

```powershell
# Si agregaste ngrok al PATH:
ngrok config add-authtoken TU_AUTHTOKEN_AQUI

# Si NO lo agregaste al PATH, navega a la carpeta donde está ngrok.exe:
cd C:\ngrok
.\ngrok.exe config add-authtoken TU_AUTHTOKEN_AQUI
```

Reemplaza `TU_AUTHTOKEN_AQUI` con el token que copiaste del dashboard.

---

## 🌐 Paso 4: Exponer tu servidor local

### Asegúrate de que tu servidor backend esté corriendo

En una terminal, verifica que el servidor esté activo:

```powershell
# Debería estar corriendo en http://localhost:5000
# Si no está corriendo, inícialo:
cd server
node index.js
```

### Inicia ngrok en otra terminal

Abre una **nueva terminal** PowerShell y ejecuta:

```powershell
# Si agregaste ngrok al PATH:
ngrok http 5000

# Si NO lo agregaste al PATH:
cd C:\ngrok
.\ngrok.exe http 5000
```

### ¡Verás algo como esto! 🎉

```
ngrok                                                                   

Session Status                online
Account                       tu_email@gmail.com (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       45ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123def456.ngrok-free.app -> http://localhost:5000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

### 📝 Copia la URL de Forwarding

La línea importante es:
```
Forwarding    https://abc123def456.ngrok-free.app -> http://localhost:5000
```

**Copia la URL HTTPS** (ej: `https://abc123def456.ngrok-free.app`)

⚠️ **IMPORTANTE**: Esta URL cambia cada vez que reinicias ngrok (en el plan gratuito). Si necesitas una URL fija, considera el plan de pago de ngrok.

---

## 🔧 Paso 5: Configurar el Webhook en Mercado Pago

### 1. Ve al panel de desarrolladores de Mercado Pago

Abre tu navegador en: https://www.mercadopago.com.ar/developers/panel/app

### 2. Selecciona tu aplicación

- Si no tienes una aplicación, crea una nueva:
  - Haz clic en "Crear aplicación"
  - Nombre: "Synthesized Ether"
  - Tipo: "Pagos online"
  - Haz clic en "Crear aplicación"

### 3. Ve a la sección de Webhooks

- En el menú lateral, haz clic en **"Webhooks"** o **"Notificaciones IPN"**

### 4. Agrega una nueva URL de notificación

- Haz clic en **"Configurar notificaciones"** o **"Agregar URL"**

### 5. Configura la URL del webhook

**URL de producción**:
```
https://abc123def456.ngrok-free.app/api/webhooks/mercadopago
```

Reemplaza `abc123def456.ngrok-free.app` con tu URL de ngrok.

**Eventos a escuchar**:
- ✅ Marca la casilla **"Pagos"** o **"payment"**

### 6. Guarda la configuración

- Haz clic en **"Guardar"** o **"Confirmar"**

---

## ✅ Paso 6: Probar el Webhook

### 1. Realiza un pago de prueba

1. Ve a tu aplicación: http://localhost:5173/plans
2. Selecciona un plan (ej: Starter)
3. Serás redirigido a Mercado Pago

### 2. Usa una tarjeta de prueba

**Para que el pago sea APROBADO**, usa estos datos:

| Campo | Valor |
|-------|-------|
| **Número de tarjeta** | `4509 9535 6623 3704` |
| **Nombre** | `APRO` |
| **Vencimiento** | `11/25` |
| **CVV** | `123` |
| **DNI** | `12345678` |

### 3. Completa el pago

- Haz clic en "Pagar"
- Espera la confirmación

### 4. Verifica los logs

**En la terminal de tu servidor backend** (donde corre `node index.js`), deberías ver:

```
[mercadopago] Webhook received: { type: 'payment', data: { id: '123456789' } }
[mercadopago] Payment info: { status: 'approved', ... }
[mercadopago] Payment approved for cliente@empresa.com (Ref: order_1234567890_1)
[mercadopago] Payment order_1234567890_1 updated to approved
[mercadopago] User plan updated: cliente@empresa.com -> starter
```

**En la terminal de ngrok**, deberías ver:

```
POST /api/webhooks/mercadopago    200 OK
```

### 5. Verifica en la interfaz web de ngrok

Abre tu navegador en: http://localhost:4040

Aquí puedes ver:
- Todas las peticiones HTTP que llegan a tu servidor
- El cuerpo de las peticiones (payload del webhook)
- Las respuestas que envía tu servidor

---

## 🐛 Troubleshooting

### ❌ El webhook no se recibe

**Posibles causas:**

1. **ngrok no está corriendo**
   - Verifica que la terminal de ngrok esté abierta y mostrando "Session Status: online"

2. **URL incorrecta en Mercado Pago**
   - Verifica que la URL termine en `/api/webhooks/mercadopago`
   - Ejemplo correcto: `https://abc123.ngrok-free.app/api/webhooks/mercadopago`

3. **Servidor backend no está corriendo**
   - Verifica que `node index.js` esté corriendo en otra terminal

4. **Firewall bloqueando ngrok**
   - Temporalmente desactiva el firewall para probar

**Solución:**
- Revisa los logs de ngrok en http://localhost:4040
- Revisa los logs del servidor backend
- Verifica que la URL de ngrok sea la correcta en Mercado Pago

### ❌ Error 404 en el webhook

**Causa:** La ruta del webhook no existe o está mal configurada.

**Solución:**
- Verifica que la URL sea exactamente: `https://TU_URL.ngrok-free.app/api/webhooks/mercadopago`
- Verifica que el servidor backend tenga la ruta registrada (ya está configurada)

### ❌ Error 500 en el webhook

**Causa:** Error en el código del servidor al procesar el webhook.

**Solución:**
- Revisa los logs del servidor backend para ver el error específico
- Verifica que las credenciales de Mercado Pago sean correctas

### ❌ El pago no actualiza la base de datos

**Causa:** El webhook se recibe pero no actualiza el estado.

**Solución:**
1. Verifica que el `external_reference` coincida con el de la base de datos
2. Revisa la tabla `payments` en SQLite:
   ```bash
   cd server
   sqlite3 agency.db
   SELECT * FROM payments ORDER BY created_at DESC LIMIT 5;
   .exit
   ```

### ❌ ngrok dice "Session Expired"

**Causa:** Las sesiones gratuitas de ngrok expiran después de 2 horas.

**Solución:**
- Reinicia ngrok: `ngrok http 5000`
- Copia la nueva URL
- Actualiza la URL en Mercado Pago

---

## 📊 Verificar que todo funciona

### Checklist de verificación

- [ ] ngrok instalado y configurado con authtoken
- [ ] ngrok corriendo y mostrando URL HTTPS
- [ ] Servidor backend corriendo en http://localhost:5000
- [ ] URL del webhook configurada en Mercado Pago
- [ ] Evento "Pagos" seleccionado en Mercado Pago
- [ ] Pago de prueba realizado con tarjeta de prueba
- [ ] Logs del webhook visibles en el servidor backend
- [ ] Estado del pago actualizado a "approved" en la base de datos
- [ ] Usuario redirigido a /success después del pago

### Comandos útiles

**Ver logs del servidor backend:**
```powershell
# Los logs aparecen automáticamente en la terminal donde corre node index.js
```

**Ver logs de ngrok (interfaz web):**
```
http://localhost:4040
```

**Consultar pagos en la base de datos:**
```bash
cd server
sqlite3 agency.db
SELECT * FROM payments ORDER BY created_at DESC LIMIT 10;
.exit
```

**Reiniciar ngrok con nueva URL:**
```powershell
# Presiona Ctrl+C en la terminal de ngrok para detenerlo
ngrok http 5000
# Copia la nueva URL y actualízala en Mercado Pago
```

---

## 🎯 Resumen de terminales necesarias

Para que todo funcione, necesitas **3 terminales abiertas**:

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
ngrok http 5000
```

---

## 🌐 URLs importantes

| Servicio | URL |
|----------|-----|
| **Frontend** | http://localhost:5173 |
| **Backend** | http://localhost:5000 |
| **ngrok Web Interface** | http://localhost:4040 |
| **ngrok Public URL** | https://abc123.ngrok-free.app (cambia cada vez) |
| **Mercado Pago Developers** | https://www.mercadopago.com.ar/developers/panel/app |

---

## 📚 Recursos adicionales

- [Documentación de ngrok](https://ngrok.com/docs)
- [Webhooks de Mercado Pago](https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks)
- [Tarjetas de prueba](https://www.mercadopago.com.ar/developers/es/docs/checkout-api/testing)

---

## ✅ ¡Listo!

Una vez que completes estos pasos, tu sistema de webhooks estará funcionando y los pagos se procesarán automáticamente.

**Próximos pasos:**
1. Probar con múltiples pagos
2. Verificar que los planes se activen correctamente
3. Probar el plan de mantenimiento (recurrente)
4. Preparar para producción con un dominio real

---

**¿Necesitas ayuda?** Revisa la sección de Troubleshooting o consulta los logs en http://localhost:4040
