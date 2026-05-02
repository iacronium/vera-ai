# 👋 ¡Bienvenido a Vera!

## 🎯 Configuración de Webhooks - Guía Rápida

### ⚡ Opción más rápida (Recomendada)

Ejecuta este comando en PowerShell:

```powershell
.\setup-ngrok.ps1
```

Te pedirá tu **authtoken de ngrok**. Obtenlo aquí:
👉 https://dashboard.ngrok.com/get-started/your-authtoken

El script hará todo automáticamente:
- Descarga ngrok
- Lo configura
- Lo inicia

---

## 🚀 Iniciar todo el sistema

Una vez configurado ngrok, usa este comando para iniciar todo:

```powershell
.\iniciar-todo.ps1
```

Esto abrirá 3 ventanas:
1. **Backend** (servidor Express)
2. **Frontend** (Vite)
3. **ngrok** (túnel para webhooks)

---

## 📋 Configurar webhook en Mercado Pago

1. Copia la URL HTTPS de la ventana de ngrok (ej: `https://abc123.ngrok-free.app`)
2. Ve a: https://www.mercadopago.com.ar/developers/panel/app
3. Selecciona tu aplicación
4. Ve a **"Webhooks"**
5. Agrega:
   ```
   https://abc123.ngrok-free.app/api/webhooks/mercadopago
   ```
6. Selecciona evento: **"Pagos"**
7. Guarda

---

## 🧪 Probar el sistema

1. Ve a: http://localhost:5173/plans
2. Selecciona un plan
3. Usa esta tarjeta de prueba:

| Campo | Valor |
|-------|-------|
| Número | `4509 9535 6623 3704` |
| Nombre | `APRO` |
| Vencimiento | `11/25` |
| CVV | `123` |
| DNI | `12345678` |

4. Completa el pago
5. Verifica los logs en la terminal del backend

---

## 🔍 Verificar el sistema

En cualquier momento, ejecuta:

```powershell
.\check-system.ps1
```

Te mostrará el estado de:
- ✅ Backend
- ✅ Frontend
- ✅ ngrok
- ✅ Credenciales de Mercado Pago

---

## 📚 Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `setup-ngrok.ps1` | Instala y configura ngrok (solo una vez) |
| `iniciar-todo.ps1` | Inicia backend + frontend + ngrok |
| `start-webhook.ps1` | Solo inicia ngrok (si ya está configurado) |
| `check-system.ps1` | Verifica el estado del sistema |

---

## 📖 Documentación completa

| Archivo | Contenido |
|---------|-----------|
| `INICIO_RAPIDO.md` | Guía rápida de inicio |
| `WEBHOOK_SETUP_GUIDE.md` | Guía detallada de webhooks |
| `MERCADOPAGO_SETUP.md` | Configuración de Mercado Pago |
| `README.md` | Documentación completa del proyecto |

---

## 🎯 Flujo de trabajo diario

### Primera vez (configuración):
```powershell
.\setup-ngrok.ps1
```

### Cada día (iniciar sistema):
```powershell
.\iniciar-todo.ps1
```

### Verificar que todo funciona:
```powershell
.\check-system.ps1
```

---

## 💡 URLs importantes

| Servicio | URL |
|----------|-----|
| **Frontend** | http://localhost:5173 |
| **Backend** | http://localhost:5000 |
| **ngrok Panel** | http://localhost:4040 |
| **Mercado Pago** | https://www.mercadopago.com.ar/developers/panel/app |
| **ngrok Dashboard** | https://dashboard.ngrok.com |

---

## ⚠️ Importante

### La URL de ngrok cambia

En el plan gratuito, la URL de ngrok cambia cada vez que lo reinicias.

**Qué hacer:**
- Actualiza la URL en Mercado Pago cada vez
- O considera el plan de pago de ngrok para URL fija

### Mantén las 3 terminales abiertas

Para que todo funcione, necesitas:
1. ✅ Terminal del backend
2. ✅ Terminal del frontend
3. ✅ Terminal de ngrok

---

## 🐛 Problemas comunes

### "ngrok no encontrado"
```powershell
.\setup-ngrok.ps1
```

### "Backend no está corriendo"
```powershell
cd server
node index.js
```

### "El webhook no se recibe"

Verifica:
1. ngrok está corriendo
2. Backend está corriendo
3. URL correcta en Mercado Pago
4. Evento "Pagos" seleccionado

Ver logs en: http://localhost:4040

---

## ✅ Checklist de configuración

- [ ] Ejecutar `.\setup-ngrok.ps1`
- [ ] Ingresar authtoken de ngrok
- [ ] Ejecutar `.\iniciar-todo.ps1`
- [ ] Copiar URL de ngrok
- [ ] Configurar webhook en Mercado Pago
- [ ] Probar con tarjeta de prueba
- [ ] Verificar logs del webhook

---

## 🎉 ¡Listo!

Una vez completados estos pasos, tu sistema estará funcionando completamente.

**Próximos pasos:**
1. Probar múltiples pagos
2. Verificar que los planes se activen
3. Revisar la base de datos
4. Preparar para producción

---

**¿Necesitas ayuda?** Consulta `WEBHOOK_SETUP_GUIDE.md` para más detalles.
