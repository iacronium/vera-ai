const express = require('express');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const db = require('../db');
const { optionalAuth, authenticateToken } = require('../middleware/auth');
const { sendCheckoutEmail, sendThankYouEmail } = require('../services/emailService');

const router = express.Router();

// ─── Configuration ────────────────────────────────────────────────────────────

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

const PLANS = {
  starter: {
    name: 'Plan Starter Autónomo',
    price: 250000, // $250.000 ARS
    description: 'Landing Page + Asistente IA + Agenda Automatizada',
  },
  business: {
    name: 'Plan Business Flow',
    price: 350000, // $350.000 ARS
    description: 'Web Multipágina + IA Cualificación + CRM + Analíticas Pro',
  },
  maintenance: {
    name: 'Mantenimiento IA',
    price: 150000, // $150.000 ARS/mes
    description: 'Reentrenamiento semanal + Optimización + Hosting Premium',
    recurring: true,
  },
};

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * POST /api/mercadopago/checkout
 * Creates a Mercado Pago payment preference.
 */
router.post('/checkout', optionalAuth, async (req, res) => {
  console.log('[mercadopago] Checkout request received:', req.body);
  
  const { planId, userEmail, deviceType } = req.body;

  if (!planId || !PLANS[planId]) {
    console.log('[mercadopago] Invalid plan:', planId);
    return res.status(400).json({ error: 'Plan inválido.' });
  }

  if (!userEmail) {
    console.log('[mercadopago] Missing email');
    return res.status(400).json({ error: 'Email requerido.' });
  }

  const plan = PLANS[planId];
  const userId = req.user?.id || null;
  const externalReference = `order_${Date.now()}_${userId || 'guest'}`;
  const isMobile = deviceType === 'mobile';

  console.log('[mercadopago] Processing checkout for plan:', planId, 'email:', userEmail, 'device:', deviceType);

  try {
    const preference = new Preference(client);

    const preferenceData = {
      items: [
        {
          title: plan.name,
          description: plan.description,
          quantity: 1,
          unit_price: plan.price,
          currency_id: 'ARS',
        },
      ],
      payer: {
        email: userEmail,
      },
      external_reference: externalReference,
      back_urls: {
        success: `${FRONTEND_URL}/success?order_id=${externalReference}`,
        failure: `${FRONTEND_URL}/`,
        pending: `${FRONTEND_URL}/`,
      },
    };

    // Log device type for analytics but use same config for now
    console.log(`[mercadopago] Device type: ${deviceType}`);

    console.log('[mercadopago] Creating preference with data:', JSON.stringify(preferenceData, null, 2));

    const response = await preference.create({ body: preferenceData });

    // Save payment in DB as pending
    db.prepare(
      'INSERT INTO payments (user_email, plan_id, amount, status, external_reference, preference_id) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(userEmail, planId, plan.price, 'pending', externalReference, response.id);

    // Send checkout email with payment link
    const checkoutUrl = response.sandbox_init_point || response.init_point;
    try {
      await sendCheckoutEmail(userEmail, planId, checkoutUrl);
      console.log(`[mercadopago] Checkout email sent to ${userEmail}`);
    } catch (emailError) {
      console.error('[mercadopago] Failed to send checkout email:', emailError.message);
      // Don't fail the checkout if email fails - just log it
    }

    res.json({
      preferenceId: response.id,
      initPoint: response.init_point,
      sandboxInitPoint: response.sandbox_init_point,
      externalReference,
      deviceType,
    });
  } catch (error) {
    console.error('[mercadopago] checkout error:', error);
    console.error('[mercadopago] error response:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Error al crear la preferencia de pago.',
      details: error.response?.data?.message || error.message,
    });
  }
});

/**
 * POST /api/webhooks/mercadopago
 * Handles Mercado Pago webhook notifications (IPN).
 */
router.post('/webhook', express.json(), async (req, res) => {
  const { type, data } = req.body;

  console.log('[mercadopago] Webhook received:', { type, data });

  // Mercado Pago sends different notification types
  if (type === 'payment') {
    try {
      const paymentId = data.id;
      const payment = new Payment(client);
      const paymentInfo = await payment.get({ id: paymentId });

      console.log('[mercadopago] Payment info:', paymentInfo);

      const externalReference = paymentInfo.external_reference;
      const status = paymentInfo.status;
      const userEmail = paymentInfo.payer?.email;

      // Only process approved payments
      if (status === 'approved') {
        console.log(`[mercadopago] Payment approved for ${userEmail} (Ref: ${externalReference})`);

        // Update payment status in DB
        const result = db.prepare(
          'UPDATE payments SET status = ?, paid_at = CURRENT_TIMESTAMP, payment_id = ? WHERE external_reference = ?'
        ).run('approved', paymentId, externalReference);

        if (result.changes > 0) {
          console.log(`[mercadopago] Payment ${externalReference} updated to approved`);

          // Update user plan status
          const paymentRecord = db.prepare(
            'SELECT plan_id, user_email FROM payments WHERE external_reference = ?'
          ).get(externalReference);

          if (paymentRecord) {
            const planId = paymentRecord.plan_id;
            const isMaintenancePlan = planId === 'maintenance';

            // Update or create user record with plan status
            const user = db.prepare('SELECT id FROM users WHERE email = ?').get(userEmail);

            if (user) {
              if (isMaintenancePlan) {
                db.prepare(
                  'UPDATE users SET maintenance_active = 1 WHERE email = ?'
                ).run(userEmail);
              } else {
                db.prepare(
                  'UPDATE users SET plan_status = ? WHERE email = ?'
                ).run(planId, userEmail);
              }
              console.log(`[mercadopago] User plan updated: ${userEmail} -> ${planId}`);
              
              // Send thank you email
              try {
                await sendThankYouEmail(userEmail, planId);
                console.log(`[mercadopago] Thank you email sent to ${userEmail}`);
              } catch (emailError) {
                console.error('[mercadopago] Failed to send thank you email:', emailError);
              }
            }
          }
        } else {
          console.warn(`[mercadopago] No payment found for external_reference: ${externalReference}`);
        }
      } else {
        console.log(`[mercadopago] Payment status: ${status} (not approved yet)`);
      }
    } catch (error) {
      console.error('[mercadopago] Error processing webhook:', error);
    }
  }

  // Always respond 200 to acknowledge receipt
  res.sendStatus(200);
});

/**
 * GET /api/mercadopago/orders
 * Returns all payments for the authenticated user.
 */
router.get('/orders', authenticateToken, (req, res) => {
  const userEmail = req.user.email;

  const payments = db.prepare(
    'SELECT id, plan_id, status, amount, created_at, paid_at FROM payments WHERE user_email = ? ORDER BY created_at DESC'
  ).all(userEmail);

  res.json(payments);
});

/**
 * GET /api/mercadopago/order/:externalReference
 * Returns payment details by external reference (for success page).
 */
router.get('/order/:externalReference', (req, res) => {
  const { externalReference } = req.params;

  const payment = db.prepare(
    'SELECT id, user_email, plan_id, status, amount, created_at, paid_at FROM payments WHERE external_reference = ?'
  ).get(externalReference);

  if (!payment) {
    return res.status(404).json({ error: 'Pago no encontrado.' });
  }

  res.json(payment);
});

/**
 * GET /api/mercadopago/payment-status/:paymentId
 * Checks payment status directly from Mercado Pago API.
 */
router.get('/payment-status/:paymentId', async (req, res) => {
  const { paymentId } = req.params;

  try {
    const payment = new Payment(client);
    const paymentInfo = await payment.get({ id: paymentId });

    res.json({
      status: paymentInfo.status,
      statusDetail: paymentInfo.status_detail,
      amount: paymentInfo.transaction_amount,
      currency: paymentInfo.currency_id,
      approved: paymentInfo.status === 'approved',
    });
  } catch (error) {
    console.error('[mercadopago] payment-status error:', error);
    res.status(500).json({ error: 'Error al consultar el estado del pago.' });
  }
});

module.exports = router;
