# 🔄 Migración SQLite → PostgreSQL (Supabase)

## ¿Por qué migrar?

| | SQLite | PostgreSQL (Supabase) |
|--|--------|----------------------|
| Hosting | Solo local/VPS | Cloud gratuito |
| Escalabilidad | Limitada | Alta |
| Concurrencia | Baja | Alta |
| Backups | Manual | Automático |
| Dashboard | No | Sí (Supabase UI) |
| Costo | Gratis (local) | Gratis (Supabase) |

---

## Cambios Necesarios

### 1. Instalar dependencia

```bash
cd server
npm install pg
```

### 2. Reemplazar `server/db.js`

**ANTES (SQLite):**
```javascript
const Database = require('better-sqlite3');
const db = new Database(path.join(__dirname, 'agency.db'));
module.exports = db;
```

**DESPUÉS (PostgreSQL):**
```javascript
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('[DB] Error conectando a PostgreSQL:', err.message);
  } else {
    console.log('[DB] Conectado a Supabase PostgreSQL ✅');
    release();
  }
});

module.exports = pool;
```

---

### 3. Cambios en `server/routes/auth.js`

**ANTES (SQLite - síncrono):**
```javascript
const db = require('../db');

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  // ...
});
```

**DESPUÉS (PostgreSQL - asíncrono):**
```javascript
const pool = require('../db');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    // ...
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

**Diferencias clave:**
- `?` → `$1, $2, $3...` (parámetros numerados)
- `.get()` → `await pool.query()` + `.rows[0]`
- `.all()` → `await pool.query()` + `.rows`
- `.run()` → `await pool.query()` + `.rowCount`
- Todo es `async/await`

---

### 4. Cambios en `server/routes/data.js`

**ANTES:**
```javascript
// Obtener leads
const leads = db.prepare('SELECT * FROM leads WHERE userId = ?').all(userId);

// Insertar lead
const result = db.prepare(
  'INSERT INTO leads (userId, name, email, status) VALUES (?, ?, ?, ?)'
).run(userId, name, email, status);
const newId = result.lastInsertRowid;

// Actualizar
db.prepare('UPDATE leads SET status = ? WHERE id = ? AND userId = ?')
  .run(status, id, userId);

// Eliminar
db.prepare('DELETE FROM leads WHERE id = ? AND userId = ?').run(id, userId);
```

**DESPUÉS:**
```javascript
// Obtener leads
const { rows: leads } = await pool.query(
  'SELECT * FROM leads WHERE "userId" = $1', [userId]
);

// Insertar lead
const result = await pool.query(
  'INSERT INTO leads ("userId", name, email, status) VALUES ($1, $2, $3, $4) RETURNING id',
  [userId, name, email, status]
);
const newId = result.rows[0].id;

// Actualizar
await pool.query(
  'UPDATE leads SET status = $1 WHERE id = $2 AND "userId" = $3',
  [status, id, userId]
);

// Eliminar
await pool.query(
  'DELETE FROM leads WHERE id = $1 AND "userId" = $2',
  [id, userId]
);
```

---

### 5. Cambios en `server/routes/mercadoPago.js`

**ANTES:**
```javascript
// Insertar pago
db.prepare(`
  INSERT INTO payments (user_email, plan_id, amount, external_reference, preference_id)
  VALUES (?, ?, ?, ?, ?)
`).run(email, planId, amount, externalRef, preferenceId);

// Buscar pago
const payment = db.prepare(
  'SELECT * FROM payments WHERE external_reference = ?'
).get(externalRef);

// Actualizar pago
db.prepare(`
  UPDATE payments SET status = ?, payment_id = ?, paid_at = CURRENT_TIMESTAMP
  WHERE external_reference = ?
`).run(status, paymentId, externalRef);
```

**DESPUÉS:**
```javascript
// Insertar pago
await pool.query(`
  INSERT INTO payments (user_email, plan_id, amount, external_reference, preference_id)
  VALUES ($1, $2, $3, $4, $5)
`, [email, planId, amount, externalRef, preferenceId]);

// Buscar pago
const result = await pool.query(
  'SELECT * FROM payments WHERE external_reference = $1',
  [externalRef]
);
const payment = result.rows[0];

// Actualizar pago
await pool.query(`
  UPDATE payments SET status = $1, payment_id = $2, paid_at = NOW()
  WHERE external_reference = $3
`, [status, paymentId, externalRef]);
```

---

### 6. Cambios en `server/routes/calendar.js`

**ANTES:**
```javascript
// Guardar tokens de Google
db.prepare('UPDATE users SET google_tokens = ? WHERE id = ?')
  .run(JSON.stringify(tokens), userId);

// Obtener tokens
const user = db.prepare('SELECT google_tokens FROM users WHERE id = ?').get(userId);
const tokens = JSON.parse(user.google_tokens);
```

**DESPUÉS:**
```javascript
// Guardar tokens de Google
await pool.query(
  'UPDATE users SET google_tokens = $1 WHERE id = $2',
  [JSON.stringify(tokens), userId]
);

// Obtener tokens
const result = await pool.query(
  'SELECT google_tokens FROM users WHERE id = $1',
  [userId]
);
const tokens = JSON.parse(result.rows[0].google_tokens);
```

---

## Resumen de Diferencias de Sintaxis

| Operación | SQLite (better-sqlite3) | PostgreSQL (pg) |
|-----------|------------------------|-----------------|
| Parámetros | `?` | `$1, $2, $3...` |
| SELECT uno | `.prepare().get()` | `await pool.query()` + `.rows[0]` |
| SELECT varios | `.prepare().all()` | `await pool.query()` + `.rows` |
| INSERT/UPDATE/DELETE | `.prepare().run()` | `await pool.query()` |
| Último ID insertado | `.lastInsertRowid` | `RETURNING id` + `.rows[0].id` |
| Estilo | Síncrono | Async/Await |
| Timestamp actual | `CURRENT_TIMESTAMP` | `NOW()` |

---

## Verificar la Migración

### 1. Probar conexión local

```bash
# Agregar DATABASE_URL al server/.env local
DATABASE_URL=postgresql://postgres:[PASS]@db.[PROJECT].supabase.co:5432/postgres

# Iniciar servidor
cd server && node index.js
# Debe mostrar: [DB] Conectado a Supabase PostgreSQL ✅
```

### 2. Probar endpoints

```bash
# Health check
curl http://localhost:5000/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vera.ai","password":"admin123"}'
```

### 3. Verificar en Supabase

- Ir a Supabase → **Table Editor**
- Verificar que las tablas tienen datos

---

## Desarrollo Local con Supabase

Para desarrollo local puedes usar:

### Opción A: Conectar directo a Supabase (más simple)
```env
# server/.env
DATABASE_URL=postgresql://postgres:[PASS]@db.[PROJECT].supabase.co:5432/postgres
```

### Opción B: Supabase Local (más avanzado)
```bash
# Instalar Supabase CLI
npm install -g supabase

# Iniciar Supabase local
supabase start

# Usar la URL local
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
```

---

*Última actualización: 1 de Mayo, 2026 | Vera AI v1.0.0*
