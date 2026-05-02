require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');
const dataRoutes = require('./routes/data');
const calendarRoutes = require('./routes/calendar');
const mercadoPagoRoutes = require('./routes/mercadoPago');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
}));
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/mercadopago', mercadoPagoRoutes);
// Webhook IPN de Mercado Pago — el handler interno aplica su propio express.json()
app.use('/api/webhooks/mercadopago', mercadoPagoRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
