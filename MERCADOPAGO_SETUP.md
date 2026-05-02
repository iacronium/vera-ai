# 🎉 Migración a Mercado Pago - COMPLETADA

## ✅ Estado actual

- **Backend**: ✅ Funcionando en http://localhost:5000
- **Frontend**: ✅ Funcionando en http://localhost:5173
- **Credenciales**: ✅ Configuradas correctamente
- **Base de datos**: ✅ Actualizada con nuevas tablas

---

## 🔑 Credenciales configuradas

```env
MERCADOPAGO_PUBLIC_KEY=APP_USR-c4c4749a-5040-4c68-bfbd-f9364c7d00d8
MERCADOPAGO_ACCESS_TOKEN=APP_USR-809881027210383-051300-0180ed0695f01c85ed30b11ebb4c9219-441142703
```

⚠️ **IMPORTANTE**: Estas son credenciales de **PRODUCCIÓN**. Para testing, usa credenciales de prueba.

---

## 💰 Precios configurados

| Plan | Precio | Descripción |
|------|--------|-------------|
| **Starter** | $250.000 ARS | Landing Page + Asistente IA + Agenda |
| **Business** | $350.000 ARS | Web Multipágina + IA + CRM + Analíticas |
| **Mantenimiento** | $150.000 ARS/mes | Reentrenamiento + Optimización + Hosting |

---

## 🚀 Cómo probar el sistema

### 1. Acceder a la aplicación

Abre tu navegador en: **http://localhost:5173**

### 2. Ir a la página de planes

Navega a: **http://localhost:5173/plans**

### 3. Seleccionar un plan

- Haz clic en cualquier botón "Comenzar", "Adquirir" o "Suscribirse"
- Serás redirigido a Mercado Pago para completar el pago

### 4. Completar el pago

En Mercado Pago podrás pagar con:
- ✅ Tarjeta de crédito/débito
- ✅ Efectivo (Rapipago, Pago Fácil)
- ✅ Transferencia bancaria
- ✅ Dinero en cuenta de Mercado Pago

### 5. Confirmación

Después del pago exitoso, serás redirigido a: **http://localhost:5173/success**

---

## 🧪 Testing con credenciales de prueba

### Obtener credenciales de prueba

1. Ve a [Mercado Pago Developers](https://www.mercadopago.com.ar/developers)
2. Selecciona tu aplicación
3. Ve a **Credenciales de prueba**
4. Copia las credenciales que empiezan con `TEST-...`

### Configurar para testing

Edita `server/.env` y reemplaza con credenciales de prueba:

```env
MERCADOPAGO_PUBLIC_KEY=TEST-...
MERCADOPAGO_ACCESS_TOKEN=TEST-...
```

### Tarjetas de prueba

| Tarjeta | Resultado | CVV | Vencimiento |
|---------|-----------|-----|-------------|
| `4509 9535 6623 3704` | ✅ Aprobado | 123 | 11/25 |
| `5031 7557 3453 0604` | ✅ Aprobado | 123 | 11/25 |
| `4013 5406 8274 6260` | ❌ Rechazado | 123 | 11/25 |

**Nombre**: APRO (para aprobado) o OTHE (para rechazado)  
**DNI**: 12345678

---

## 🔔 Configurar Webhooks (IPN)

Los webhooks permiten que Mercado Pago notifique a tu servidor cuando un pago es aprobado.

### Para desarrollo local (con ngrok)

1. **Instalar ngrok**:
   ```bash
   # Descargar de https://ngrok.com/download
   # O con chocolatey:
   choco install ngrok
   ```

2. **Exponer tu servidor local**:
   ```bash
   ngrok http 5000
   ```

3. **Copiar la URL HTTPS** que te da ngrok (ej: `https://abc123.ngrok.io`)

4. **Configurar en Mercado Pago**:
   - Ve a [Tus integraciones](https://www.mercadopago.com.ar/developers/panel/app)
   - Selecciona tu aplicación
   - Ve a **Webhooks**
   - Agrega nueva URL: `https://abc123.ngrok.io/api/webhooks/mercadopago`
   - Selecciona evento: **Pagos** (`payment`)
   - Guarda

### Para producción

Usa tu dominio real:
```
https://tu-dominio.com/api/webhooks/mercadopago
```

---

## 📊 Base de datos actualizada

### Tabla `payments` (nueva)

```sql
CREATE TABLE payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_email TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  external_reference TEXT UNIQUE,
  preference_id TEXT,
  payment_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  paid_at DATETIME
);
```

### Tabla `users` (columnas nuevas)

```sql
ALTER TABLE users ADD COLUMN plan_status TEXT;
ALTER TABLE users ADD COLUMN maintenance_active INTEGER DEFAULT 0;
```

---

## 🔄 Flujo completo del pago

```
1. Usuario selecciona plan en /plans
   ↓
2. Frontend llama a POST /api/mercadopago/checkout
   ↓
3. Backend crea preferencia en Mercado Pago
   ↓
4. Backend guarda pago en DB con status='pending'
   ↓
5. Usuario es redirigido a Mercado Pago
   ↓
6. Usuario completa el pago
   ↓
7. Mercado Pago envía webhook a /api/webhooks/mercadopago
   ↓
8. Backend verifica que status='approved'
   ↓
9. Backend actualiza:
   - payments.status = 'approved'
   - payments.paid_at = CURRENT_TIMESTAMP
   - users.plan_status = 'starter' (o el plan correspondiente)
   - users.maintenance_active = 1 (si es plan de mantenimiento)
   ↓
10. Usuario es redirigido a /success
```

---

## 🛠️ Comandos útiles

### Iniciar el sistema

```bash
# Terminal 1 - Backend
cd server
node index.js

# Terminal 2 - Frontend
npm run dev
```

### Ver logs del servidor

Los logs del webhook aparecerán en la terminal del backend:

```
[mercadopago] Webhook received: { type: 'payment', data: { id: '123456' } }
[mercadopago] Payment info: { status: 'approved', ... }
[mercadopago] Payment approved for cliente@empresa.com (Ref: order_...)
[mercadopago] Payment order_... updated to approved
[mercadopago] User plan updated: cliente@empresa.com -> starter
```

### Verificar estado de un pago

```bash
# Reemplaza {external_reference} con el ID de tu pago
curl http://localhost:5000/api/mercadopago/order/{external_reference}
```

---

## 📝 Endpoints disponibles

### Crear checkout
```http
POST http://localhost:5000/api/mercadopago/checkout
Content-Type: application/json

{
  "planId": "starter",
  "userEmail": "cliente@empresa.com"
}
```

### Obtener pago por referencia
```http
GET http://localhost:5000/api/mercadopago/order/order_1234567890_1
```

### Listar pagos del usuario (requiere autenticación)
```http
GET http://localhost:5000/api/mercadopago/orders
Authorization: Bearer {token}
```

### Consultar estado en Mercado Pago
```http
GET http://localhost:5000/api/mercadopago/payment-status/{payment_id}
```

---

## ⚠️ Troubleshooting

### El webhook no se recibe

1. Verifica que ngrok esté corriendo
2. Verifica que la URL en Mercado Pago sea correcta
3. Revisa los logs de ngrok: `http://localhost:4040`
4. Verifica que el evento seleccionado sea **Pagos** (`payment`)

### Error: "Access token inválido"

1. Verifica que el access token esté correcto en `server/.env`
2. Asegúrate de que no haya espacios antes o después del token
3. Si usas credenciales de prueba, deben empezar con `TEST-`
4. Si usas credenciales de producción, deben empezar con `APP_USR-`

### El pago no actualiza el plan del usuario

1. Verifica que el webhook se esté recibiendo (revisa logs del servidor)
2. Verifica que el estado del pago sea `approved`
3. Verifica que el `external_reference` coincida con el de la base de datos
4. Revisa la tabla `payments` para ver el estado actual

### Error al crear la preferencia

1. Verifica que el `planId` sea válido: `starter`, `business`, o `maintenance`
2. Verifica que el `userEmail` esté presente
3. Revisa los logs del servidor para ver el error específico

---

## 🎯 Próximos pasos recomendados

1. **Probar con credenciales de prueba** antes de usar en producción
2. **Configurar webhooks con ngrok** para testing local
3. **Probar el flujo completo** con una tarjeta de prueba
4. **Verificar que los pagos se guarden** correctamente en la base de datos
5. **Probar la página de éxito** (`/success`) después de un pago
6. **Configurar webhooks en producción** cuando despliegues la app

---

## 📚 Recursos adicionales

- [Documentación de Mercado Pago](https://www.mercadopago.com.ar/developers/es/docs)
- [Tarjetas de prueba](https://www.mercadopago.com.ar/developers/es/docs/checkout-api/testing)
- [Webhooks (IPN)](https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks)
- [SDK de Node.js](https://github.com/mercadopago/sdk-nodejs)

---

## ✅ Checklist de verificación

- [x] SDK de Mercado Pago instalado
- [x] Credenciales configuradas en `.env`
- [x] Rutas del backend creadas
- [x] Servicio del frontend creado
- [x] Página de planes actualizada
- [x] Página de éxito actualizada
- [x] Base de datos actualizada
- [x] README.md actualizado
- [x] Servidor backend funcionando
- [x] Servidor frontend funcionando
- [ ] Webhooks configurados (pendiente - requiere ngrok o dominio)
- [ ] Prueba con tarjeta de prueba (pendiente)
- [ ] Verificación de pago completo (pendiente)

---

**¡La migración está completa y lista para usar!** 🎉

Solo falta configurar los webhooks y hacer pruebas con tarjetas de prueba.
