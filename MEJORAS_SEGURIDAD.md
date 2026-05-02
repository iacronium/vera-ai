# 🔒 Mejoras de Seguridad para Producción

## ⚠️ CRÍTICO - Implementar Antes de Producción

### 1. HTTPS Obligatorio
**Estado:** ❌ No implementado
**Prioridad:** CRÍTICA

```javascript
// server/index.js - Agregar después de las importaciones
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

### 2. Helmet.js para Headers de Seguridad
**Estado:** ❌ No implementado
**Prioridad:** ALTA

```bash
cd server && npm install helmet
```

```javascript
// server/index.js
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.groq.com", "https://api.openai.com"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### 3. Rate Limiting
**Estado:** ❌ No implementado
**Prioridad:** ALTA

```bash
cd server && npm install express-rate-limit
```

```javascript
// server/index.js
const rateLimit = require('express-rate-limit');

// Rate limiter general
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por IP
  message: { error: 'Demasiadas solicitudes, intenta de nuevo más tarde.' }
});

// Rate limiter para IA (más restrictivo)
const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 20, // 20 requests por minuto
  message: { error: 'Límite de solicitudes de IA alcanzado.' }
});

// Rate limiter para login (muy restrictivo)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  message: { error: 'Demasiados intentos de login.' }
});

app.use('/api/', generalLimiter);
app.use('/api/ai/', aiLimiter);
app.use('/api/auth/login', loginLimiter);
```

### 4. Validación de Input
**Estado:** ⚠️ Parcial
**Prioridad:** ALTA

```bash
cd server && npm install express-validator
```

```javascript
// server/routes/auth.js - Ejemplo
const { body, validationResult } = require('express-validator');

router.post('/login',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // ... resto del código
  }
);
```

### 5. JWT Secret Seguro
**Estado:** ⚠️ Usando fallback inseguro
**Prioridad:** CRÍTICA

```bash
# Generar un secret seguro
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Agregar al `.env`:
```env
JWT_SECRET=el_resultado_del_comando_anterior_64_caracteres
```

### 6. Sanitización de Datos
**Estado:** ❌ No implementado
**Prioridad:** MEDIA

```bash
cd server && npm install xss
```

```javascript
// server/routes/data.js
const xss = require('xss');

router.post('/leads', authenticateToken, (req, res) => {
  const { name, email, status } = req.body;
  
  // Sanitizar inputs
  const sanitizedName = xss(name);
  const sanitizedEmail = xss(email);
  
  // ... resto del código
});
```

### 7. CORS Restrictivo
**Estado:** ⚠️ Configurado pero verificar en producción
**Prioridad:** ALTA

```javascript
// server/index.js - Mejorar configuración actual
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 8. Logging Seguro
**Estado:** ⚠️ Console.log básico
**Prioridad:** MEDIA

```bash
cd server && npm install winston
```

```javascript
// server/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

### 9. Variables de Entorno Validadas
**Estado:** ❌ No implementado
**Prioridad:** MEDIA

```javascript
// server/config.js
const requiredEnvVars = [
  'JWT_SECRET',
  'GROQ_API_KEY',
  'MERCADOPAGO_ACCESS_TOKEN',
  'EMAIL_USER',
  'EMAIL_PASSWORD'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName] || process.env[varName].includes('your_')) {
    console.error(`❌ Variable de entorno ${varName} no configurada correctamente`);
    process.exit(1);
  }
});

module.exports = {
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET,
  groqApiKey: process.env.GROQ_API_KEY,
  // ... etc
};
```

### 10. SQL Injection Prevention
**Estado:** ✅ Usando prepared statements (better-sqlite3)
**Prioridad:** ✅ IMPLEMENTADO

Better-sqlite3 usa prepared statements por defecto, lo cual previene SQL injection.

## 🛡️ Checklist de Seguridad

### Antes de Producción
- [ ] HTTPS configurado y forzado
- [ ] Helmet.js instalado y configurado
- [ ] Rate limiting implementado
- [ ] JWT_SECRET cambiado por uno seguro (64 caracteres)
- [ ] CORS configurado con dominio específico
- [ ] Variables de entorno validadas al inicio
- [ ] Logging estructurado implementado
- [ ] Validación de inputs en todas las rutas
- [ ] Sanitización de datos implementada

### Monitoreo Continuo
- [ ] Logs de errores monitoreados
- [ ] Alertas configuradas para errores críticos
- [ ] Backups automáticos de la base de datos
- [ ] Monitoreo de uso de APIs (Groq, Mercado Pago)
- [ ] Revisión periódica de dependencias (npm audit)

## 🔐 Mejores Prácticas Adicionales

### 1. Secrets Management
Considerar usar servicios como:
- AWS Secrets Manager
- HashiCorp Vault
- Azure Key Vault

### 2. Backups
```bash
# Script de backup automático
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp server/agency.db backups/agency_$DATE.db
# Mantener solo últimos 30 días
find backups/ -name "agency_*.db" -mtime +30 -delete
```

Configurar cron job:
```bash
# Backup diario a las 3 AM
0 3 * * * /path/to/backup-script.sh
```

### 3. Monitoreo de Dependencias
```bash
# Revisar vulnerabilidades
npm audit

# Actualizar dependencias
npm update

# Revisar dependencias desactualizadas
npm outdated
```

### 4. Pruebas de Seguridad
- [ ] Escaneo de vulnerabilidades (npm audit)
- [ ] Pruebas de penetración básicas
- [ ] Revisión de código de seguridad
- [ ] Verificar headers de seguridad (securityheaders.com)

## 📋 Implementación Rápida (30 minutos)

### Paso 1: Instalar Dependencias (5 min)
```bash
cd server
npm install helmet express-rate-limit express-validator winston xss
```

### Paso 2: Actualizar server/index.js (10 min)
```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// Seguridad
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', generalLimiter);

// ... resto del código
```

### Paso 3: Generar JWT Secret (2 min)
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Copiar resultado a .env
```

### Paso 4: Validar Variables de Entorno (5 min)
Crear `server/config.js` con validación

### Paso 5: Probar (8 min)
```bash
# Reiniciar servidor
node server/index.js

# Verificar que todo funciona
curl http://localhost:5000/health
```

## ⚡ Prioridades

### CRÍTICO (Implementar HOY)
1. ✅ Cambiar JWT_SECRET
2. ✅ Configurar HTTPS
3. ✅ Validar variables de entorno

### ALTO (Implementar ESTA SEMANA)
4. ✅ Helmet.js
5. ✅ Rate limiting
6. ✅ CORS restrictivo

### MEDIO (Implementar ESTE MES)
7. ✅ Logging estructurado
8. ✅ Validación de inputs
9. ✅ Backups automáticos

---

**Nota:** Este documento debe actualizarse conforme se implementen las mejoras.
