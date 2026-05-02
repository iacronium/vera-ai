# 🛠️ Comandos Útiles - Vera AI

## 🚀 Desarrollo Local

### Iniciar Todo el Sistema
```bash
# Windows PowerShell
.\iniciar-todo.ps1

# O manualmente:
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd server && node index.js
```

### Build para Producción
```bash
# Frontend
npm run build

# Resultado en: dist/
```

### Linting
```bash
npm run lint
```

### Tests
```bash
npm test
```

---

## 🔐 Seguridad

### Generar JWT Secret Seguro
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Verificar Vulnerabilidades
```bash
npm audit

# Arreglar automáticamente
npm audit fix
```

### Actualizar Dependencias
```bash
# Ver dependencias desactualizadas
npm outdated

# Actualizar
npm update
```

---

## 🗄️ Base de Datos

### Backup Manual
```bash
# Crear backup
cp server/agency.db server/agency_backup_$(date +%Y%m%d).db

# O con fecha y hora
cp server/agency.db server/agency_backup_$(date +%Y%m%d_%H%M%S).db
```

### Ver Contenido de la Base de Datos
```bash
# Instalar sqlite3 CLI
npm install -g sqlite3

# Abrir base de datos
sqlite3 server/agency.db

# Comandos útiles dentro de sqlite3:
.tables                    # Ver todas las tablas
.schema users              # Ver esquema de tabla users
SELECT * FROM users;       # Ver todos los usuarios
SELECT * FROM leads;       # Ver todos los leads
SELECT * FROM payments;    # Ver todos los pagos
.exit                      # Salir
```

---

## 📦 Deploy

### Vercel (Frontend)
```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy a producción
vercel --prod
```

### Railway (Backend)
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Inicializar proyecto
railway init

# Deploy
railway up

# Ver logs
railway logs
```

---

## 🔍 Debugging

### Ver Logs del Backend (Local)
```bash
cd server && node index.js
# Los logs aparecerán en la consola
```

### Ver Logs con PM2 (Producción)
```bash
# Ver logs en tiempo real
pm2 logs vera-backend

# Ver últimas 100 líneas
pm2 logs vera-backend --lines 100

# Ver solo errores
pm2 logs vera-backend --err

# Limpiar logs
pm2 flush
```

### Verificar Estado del Servidor
```bash
# Health check
curl http://localhost:5000/health

# O en producción
curl https://tu-backend.com/health
```

### Probar Endpoints
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Chat (sin auth)
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "groq",
    "model": "llama-3.3-70b-versatile",
    "messages": [{"role": "user", "content": "Hola"}],
    "temperature": 0.7,
    "maxTokens": 512
  }'
```

---

## 🌐 Nginx (Si usas VPS)

### Verificar Configuración
```bash
sudo nginx -t
```

### Recargar Configuración
```bash
sudo systemctl reload nginx
```

### Reiniciar Nginx
```bash
sudo systemctl restart nginx
```

### Ver Logs
```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

---

## 🔄 PM2 (Gestión de Procesos)

### Iniciar Aplicación
```bash
pm2 start server/index.js --name vera-backend
```

### Ver Estado
```bash
pm2 status
```

### Reiniciar
```bash
pm2 restart vera-backend
```

### Detener
```bash
pm2 stop vera-backend
```

### Eliminar
```bash
pm2 delete vera-backend
```

### Guardar Configuración
```bash
pm2 save
```

### Configurar Inicio Automático
```bash
pm2 startup
# Seguir las instrucciones que aparecen
```

### Monitoreo en Tiempo Real
```bash
pm2 monit
```

---

## 📊 Monitoreo

### Ver Uso de Recursos
```bash
# CPU y memoria
htop

# O con top
top

# Espacio en disco
df -h

# Uso de memoria
free -h
```

### Ver Procesos de Node
```bash
ps aux | grep node
```

### Ver Puertos en Uso
```bash
# Linux/Mac
lsof -i :5000

# Windows
netstat -ano | findstr :5000
```

---

## 🔧 Mantenimiento

### Limpiar node_modules
```bash
# Frontend
rm -rf node_modules package-lock.json
npm install

# Backend
cd server
rm -rf node_modules package-lock.json
npm install
```

### Limpiar Caché de npm
```bash
npm cache clean --force
```

### Limpiar Build
```bash
rm -rf dist
npm run build
```

---

## 🌍 Variables de Entorno

### Ver Variables de Entorno (Linux/Mac)
```bash
# Ver todas
env

# Ver una específica
echo $GROQ_API_KEY
```

### Ver Variables de Entorno (Windows)
```powershell
# Ver todas
Get-ChildItem Env:

# Ver una específica
$env:GROQ_API_KEY
```

### Cargar .env Temporalmente
```bash
# Linux/Mac
export $(cat server/.env | xargs)

# Windows PowerShell
Get-Content server/.env | ForEach-Object {
  $name, $value = $_.split('=')
  Set-Content env:\$name $value
}
```

---

## 🔐 SSL/TLS (Certbot)

### Obtener Certificado
```bash
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
```

### Renovar Certificado
```bash
sudo certbot renew
```

### Probar Renovación
```bash
sudo certbot renew --dry-run
```

### Ver Certificados
```bash
sudo certbot certificates
```

---

## 📧 Probar Emails

### Enviar Email de Prueba (Node.js)
```javascript
// test-email.js
require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: 'tu-email@example.com',
  subject: 'Test Email - Vera AI',
  text: 'Este es un email de prueba'
}, (error, info) => {
  if (error) {
    console.log('Error:', error);
  } else {
    console.log('Email enviado:', info.response);
  }
});
```

```bash
node test-email.js
```

---

## 🔍 Troubleshooting

### Puerto en Uso
```bash
# Encontrar proceso usando puerto 5000
# Linux/Mac
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Permisos Denegados
```bash
# Dar permisos de ejecución
chmod +x start-production.sh

# Ejecutar con sudo si es necesario
sudo ./start-production.sh
```

### Error de Módulos
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

---

## 📱 Probar en Móvil (Local)

### Obtener IP Local
```bash
# Linux/Mac
ifconfig | grep "inet "

# Windows
ipconfig
```

### Acceder desde Móvil
```
http://TU_IP_LOCAL:5173
```

**Nota:** Asegúrate de que el móvil esté en la misma red WiFi.

---

## 🚀 Scripts Personalizados

### Crear Script de Backup Automático
```bash
# backup.sh
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$HOME/vera-backups"
mkdir -p $BACKUP_DIR

# Backup de base de datos
cp server/agency.db $BACKUP_DIR/agency_$DATE.db

# Comprimir
tar -czf $BACKUP_DIR/vera_backup_$DATE.tar.gz $BACKUP_DIR/agency_$DATE.db

# Eliminar backups antiguos (más de 30 días)
find $BACKUP_DIR -name "vera_backup_*.tar.gz" -mtime +30 -delete

echo "Backup completado: $DATE"
```

```bash
# Hacer ejecutable
chmod +x backup.sh

# Ejecutar
./backup.sh

# Configurar cron (diario a las 3 AM)
crontab -e
# Agregar:
0 3 * * * /path/to/backup.sh >> /path/to/backup.log 2>&1
```

---

## 📊 Análisis de Performance

### Lighthouse (Chrome DevTools)
```bash
# Instalar Lighthouse CLI
npm install -g lighthouse

# Analizar sitio
lighthouse https://tu-sitio.com --view

# Guardar reporte
lighthouse https://tu-sitio.com --output html --output-path ./report.html
```

### Analizar Bundle Size
```bash
# Instalar analyzer
npm install -D rollup-plugin-visualizer

# Agregar a vite.config.js y hacer build
npm run build
```

---

## 🔄 Git

### Comandos Útiles
```bash
# Ver estado
git status

# Agregar cambios
git add .

# Commit
git commit -m "Descripción del cambio"

# Push
git push origin main

# Pull
git pull origin main

# Ver historial
git log --oneline

# Crear rama
git checkout -b feature/nueva-funcionalidad

# Cambiar de rama
git checkout main

# Merge
git merge feature/nueva-funcionalidad
```

---

## 📝 Notas

- Todos los comandos asumen que estás en la raíz del proyecto
- Para comandos de servidor, usa `cd server` primero
- Reemplaza `tu-dominio.com` con tu dominio real
- Reemplaza `tu-email@example.com` con tu email real

---

**Última actualización:** 29 de Abril, 2026
