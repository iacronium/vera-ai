# Configuración de Email (Gmail SMTP)

Este documento explica cómo configurar el envío automático de emails usando Gmail.

---

## ¿Qué emails se envían?

### 1. Email de Checkout (cuando se crea el pago)
- **Asunto:** 🚀 Tu enlace de pago - [Plan]
- **Contenido:**
  - Detalles del plan seleccionado
  - Precio y características
  - Botón de pago directo a Mercado Pago
  - Métodos de pago aceptados

### 2. Email de Agradecimiento (cuando el pago es aprobado)
- **Asunto:** ✓ ¡Gracias por tu compra! - [Plan]
- **Contenido:**
  - Confirmación de pago
  - Próximos pasos
  - Qué preparar para la implementación
  - Contacto de soporte

---

## Configuración paso a paso

### 1. Habilitar verificación en 2 pasos en Gmail

1. Ve a: https://myaccount.google.com/security
2. En "Cómo inicias sesión en Google", selecciona **"Verificación en 2 pasos"**
3. Sigue los pasos para activarla (necesitarás tu teléfono)

### 2. Generar contraseña de aplicación

1. Una vez activada la verificación en 2 pasos, vuelve a: https://myaccount.google.com/security
2. Busca **"Contraseñas de aplicaciones"** (App passwords)
3. Selecciona:
   - **Aplicación:** Correo
   - **Dispositivo:** Otro (nombre personalizado) → escribe "Synthesized Ether"
4. Haz clic en **"Generar"**
5. Gmail te mostrará una contraseña de **16 caracteres** (ej: `abcd efgh ijkl mnop`)

### 3. Configurar variables de entorno

Edita `server/.env` y agrega:

```env
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
```

**Importante:**
- Usa tu email de Gmail completo (ej: `contacto@gmail.com`)
- La contraseña es la de **16 caracteres** que generaste (sin espacios)
- **NO uses tu contraseña normal de Gmail**

### 4. Instalar dependencia

Desde la carpeta `server/`, ejecuta:

```bash
npm install
```

Esto instalará `nodemailer` que agregamos al `package.json`.

### 5. Reiniciar el backend

```bash
cd server
node index.js
```

---

## Probar el sistema

### Prueba 1: Email de checkout

1. Ve al chat de ventas
2. Escribe: "Quiero el Plan B"
3. Oliver responderá mencionando el pago
4. Se abrirá Mercado Pago automáticamente
5. **Revisa tu email** — deberías recibir el email de checkout

### Prueba 2: Email de agradecimiento

1. Completa un pago de prueba en Mercado Pago
2. Usa la tarjeta de prueba: `4509 9535 6623 3704`
3. Cuando el pago sea aprobado, el webhook notificará al backend
4. **Revisa tu email** — deberías recibir el email de agradecimiento

---

## Verificar logs

En la terminal del backend verás:

```
[email] Checkout email sent to cliente@empresa.com
[mercadopago] Payment approved for cliente@empresa.com
[email] Thank you email sent to cliente@empresa.com
```

---

## Solución de problemas

### Error: "Invalid login"

**Causa:** Contraseña incorrecta o verificación en 2 pasos no activada.

**Solución:**
1. Verifica que la verificación en 2 pasos esté activa
2. Genera una nueva contraseña de aplicación
3. Copia la contraseña **sin espacios**

### Error: "Connection timeout"

**Causa:** Firewall o antivirus bloqueando el puerto 587.

**Solución:**
1. Desactiva temporalmente el firewall
2. Agrega una excepción para Node.js

### Los emails no llegan

**Causa:** Pueden estar en spam o el email del cliente es incorrecto.

**Solución:**
1. Revisa la carpeta de spam
2. Verifica que el email del cliente esté bien escrito en el chat
3. Revisa los logs del backend para confirmar que se envió

### Error: "self signed certificate"

**Causa:** Problema con certificados SSL en algunos entornos.

**Solución:**
Edita `server/services/emailService.js` y agrega:

```javascript
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false  // Agregar esta línea
  }
});
```

---

## Alternativas a Gmail

Si prefieres no usar Gmail, puedes usar:

### SendGrid (recomendado para producción)
- 100 emails gratis por día
- Más confiable para producción
- https://sendgrid.com

### Resend
- 100 emails gratis por día
- API moderna y simple
- https://resend.com

### Mailgun
- 5,000 emails gratis por mes
- https://mailgun.com

Para cambiar de proveedor, solo necesitas modificar `server/services/emailService.js`.

---

## Personalización de emails

Los templates HTML están en `server/services/emailService.js`:

- `getCheckoutEmailHTML()` — Email de checkout
- `getThankYouEmailHTML()` — Email de agradecimiento

Puedes modificar:
- Colores (busca `#4cd6ff`, `#b600f8`, etc.)
- Textos
- Logo (agrega `<img src="...">` en el header)
- Footer

---

## Seguridad

⚠️ **Importante:**

1. **Nunca** subas el archivo `.env` a GitHub
2. El `.gitignore` ya incluye `.env` para protegerlo
3. En producción, usa variables de entorno del servidor (no archivos)
4. Rota la contraseña de aplicación cada 6 meses

---

## Checklist de configuración

- [ ] Verificación en 2 pasos activada en Gmail
- [ ] Contraseña de aplicación generada
- [ ] Variables `EMAIL_USER` y `EMAIL_PASSWORD` en `server/.env`
- [ ] `npm install` ejecutado en `/server`
- [ ] Backend reiniciado
- [ ] Email de prueba enviado correctamente
- [ ] Emails no están en spam

---

¿Necesitas ayuda? Revisa los logs del backend o contacta al equipo de desarrollo.
