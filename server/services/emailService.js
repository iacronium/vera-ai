const nodemailer = require('nodemailer');

// ─── Email Configuration ──────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// ─── Plan Details ─────────────────────────────────────────────────────────────

const PLAN_DETAILS = {
  starter: {
    name: 'Plan Starter Autónomo',
    price: '$250.000 ARS',
    features: [
      'Landing Page Optimizada para Conversión',
      'Asistente IA de Captación 24/7',
      'Agenda Automatizada con Google Calendar',
      'Formularios Inteligentes de Contacto',
      'Analíticas Básicas',
    ],
    deliveryTime: '5-7 días hábiles',
  },
  business: {
    name: 'Plan Business Flow',
    price: '$350.000 ARS',
    features: [
      'Web Multipágina Inteligente',
      'IA de Cualificación de Leads Avanzada',
      'Integración con CRM y Slack',
      'Analíticas Pro con IA',
      'Dashboard de Métricas en Tiempo Real',
      'Chatbot Personalizado',
      'Optimización SEO Básica',
    ],
    deliveryTime: '7-10 días hábiles',
  },
  maintenance: {
    name: 'Mantenimiento IA',
    price: '$150.000 ARS/mes',
    features: [
      'Reentrenamiento Semanal de Modelos IA',
      'Optimización Continua de Prompts',
      'Hosting Premium con 99.9% Uptime',
      'Soporte Prioritario',
      'Actualizaciones de Seguridad',
      'Backups Diarios Automáticos',
    ],
    deliveryTime: 'Servicio continuo',
  },
};

// ─── Email Templates ──────────────────────────────────────────────────────────

function getCheckoutEmailHTML(userEmail, planId, checkoutUrl) {
  const plan = PLAN_DETAILS[planId];
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
      margin: 0;
      padding: 40px 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #1a1a1a;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    }
    .header {
      background: linear-gradient(135deg, #00d1ff 0%, #b600f8 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .header p {
      color: rgba(255, 255, 255, 0.9);
      margin: 10px 0 0;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .content {
      padding: 40px 30px;
      color: #e5e2e1;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
      color: #ffffff;
    }
    .plan-box {
      background: #252525;
      border: 1px solid rgba(164, 230, 255, 0.1);
      border-radius: 16px;
      padding: 24px;
      margin: 24px 0;
    }
    .plan-name {
      font-size: 22px;
      font-weight: 700;
      color: #4cd6ff;
      margin: 0 0 8px;
    }
    .plan-price {
      font-size: 32px;
      font-weight: 900;
      color: #ffffff;
      margin: 0 0 20px;
    }
    .features {
      list-style: none;
      padding: 0;
      margin: 20px 0;
    }
    .features li {
      padding: 10px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      font-size: 14px;
      color: #bbc9cf;
    }
    .features li:before {
      content: "✓";
      color: #4cd6ff;
      font-weight: bold;
      margin-right: 12px;
    }
    .features li:last-child {
      border-bottom: none;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #4cd6ff 0%, #00d1ff 100%);
      color: #001f28;
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 16px;
      margin: 24px 0;
      text-align: center;
      box-shadow: 0 8px 24px rgba(76, 214, 255, 0.3);
    }
    .info-box {
      background: rgba(76, 214, 255, 0.05);
      border-left: 4px solid #4cd6ff;
      padding: 16px;
      margin: 24px 0;
      border-radius: 8px;
      font-size: 14px;
      color: #bbc9cf;
    }
    .footer {
      background: #0f0f0f;
      padding: 30px;
      text-align: center;
      color: #859399;
      font-size: 12px;
    }
    .footer a {
      color: #4cd6ff;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Vera</h1>
      <p>Autonomous Web Agency</p>
    </div>
    
    <div class="content">
      <p class="greeting">¡Hola! 👋</p>
      
      <p>Gracias por tu interés en <strong>Vera</strong>. Estamos emocionados de ayudarte a transformar tu presencia digital con inteligencia artificial.</p>
      
      <div class="plan-box">
        <h2 class="plan-name">${plan.name}</h2>
        <div class="plan-price">${plan.price}</div>
        
        <p style="color: #859399; font-size: 13px; margin-bottom: 16px;">
          <strong>Tiempo de entrega:</strong> ${plan.deliveryTime}
        </p>
        
        <h3 style="color: #ffffff; font-size: 16px; margin: 20px 0 12px;">✨ Incluye:</h3>
        <ul class="features">
          ${plan.features.map(f => `<li>${f}</li>`).join('')}
        </ul>
      </div>
      
      <div style="text-align: center;">
        <a href="${checkoutUrl}" class="cta-button">
          🚀 Completar Pago Ahora
        </a>
      </div>
      
      <div class="info-box">
        <strong>💳 Métodos de pago aceptados:</strong><br>
        Tarjetas de crédito/débito, transferencia bancaria, Rapipago, Pago Fácil, y saldo de Mercado Pago.
      </div>
      
      <p style="margin-top: 30px; font-size: 14px; line-height: 1.6;">
        Una vez completado el pago, nuestro equipo se pondrá en contacto contigo en las próximas <strong>24 horas</strong> para coordinar los detalles de implementación.
      </p>
      
      <p style="margin-top: 20px; font-size: 14px; color: #859399;">
        Si tienes alguna pregunta, no dudes en responder a este correo.
      </p>
      
      <p style="margin-top: 30px; font-size: 14px;">
        Saludos,<br>
        <strong style="color: #4cd6ff;">El equipo de Vera</strong>
      </p>
    </div>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} Vera. Todos los derechos reservados.</p>
      <p style="margin-top: 10px;">
        <a href="https://vera.com">vera.com</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

function getThankYouEmailHTML(userEmail, planId) {
  const plan = PLAN_DETAILS[planId];
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
      margin: 0;
      padding: 40px 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #1a1a1a;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    }
    .header {
      background: linear-gradient(135deg, #00d1ff 0%, #b600f8 100%);
      padding: 50px 30px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 32px;
      font-weight: 800;
    }
    .checkmark {
      width: 80px;
      height: 80px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      font-size: 48px;
    }
    .content {
      padding: 40px 30px;
      color: #e5e2e1;
    }
    .plan-box {
      background: #252525;
      border: 1px solid rgba(164, 230, 255, 0.1);
      border-radius: 16px;
      padding: 24px;
      margin: 24px 0;
      text-align: center;
    }
    .plan-name {
      font-size: 20px;
      font-weight: 700;
      color: #4cd6ff;
      margin: 0 0 8px;
    }
    .next-steps {
      background: rgba(76, 214, 255, 0.05);
      border-left: 4px solid #4cd6ff;
      padding: 20px;
      margin: 24px 0;
      border-radius: 8px;
    }
    .next-steps h3 {
      color: #ffffff;
      margin: 0 0 16px;
      font-size: 18px;
    }
    .next-steps ol {
      margin: 0;
      padding-left: 20px;
      color: #bbc9cf;
      line-height: 1.8;
    }
    .footer {
      background: #0f0f0f;
      padding: 30px;
      text-align: center;
      color: #859399;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="checkmark">✓</div>
      <h1>¡Pago Confirmado!</h1>
    </div>
    
    <div class="content">
      <p style="font-size: 18px; color: #ffffff; text-align: center; margin-bottom: 30px;">
        Gracias por confiar en <strong>Vera</strong>
      </p>
      
      <div class="plan-box">
        <p class="plan-name">${plan.name}</p>
        <p style="color: #859399; font-size: 14px; margin: 8px 0 0;">
          Tu inversión: <strong style="color: #ffffff;">${plan.price}</strong>
        </p>
      </div>
      
      <div class="next-steps">
        <h3>📋 Próximos pasos:</h3>
        <ol>
          <li>Nuestro equipo revisará tu pago en las próximas <strong>24 horas</strong></li>
          <li>Recibirás un correo con los detalles de implementación</li>
          <li>Agendaremos una llamada de descubrimiento para entender tus necesidades</li>
          <li>Comenzaremos el desarrollo de tu sistema autónomo</li>
        </ol>
      </div>
      
      <p style="margin-top: 30px; font-size: 14px; line-height: 1.6; text-align: center;">
        Mientras tanto, puedes preparar:<br>
        • Logo de tu empresa (PNG/SVG)<br>
        • Colores de marca<br>
        • Contenido y textos que quieras incluir
      </p>
      
      <p style="margin-top: 30px; font-size: 14px; color: #859399; text-align: center;">
        ¿Tienes preguntas? Responde a este correo y te ayudaremos.
      </p>
      
      <p style="margin-top: 40px; font-size: 14px; text-align: center;">
        Saludos,<br>
        <strong style="color: #4cd6ff;">El equipo de Vera</strong>
      </p>
    </div>
    
    <div class="footer">
      <p>© ${new Date().getFullYear()} Vera. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
  `;
}

// ─── Email Functions ──────────────────────────────────────────────────────────

/**
 * Sends checkout email with payment link
 */
async function sendCheckoutEmail(userEmail, planId, checkoutUrl) {
  const plan = PLAN_DETAILS[planId];
  
  const mailOptions = {
    from: `"Vera" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `🚀 Tu enlace de pago - ${plan.name}`,
    html: getCheckoutEmailHTML(userEmail, planId, checkoutUrl),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[email] Checkout email sent to ${userEmail}`);
    return { success: true };
  } catch (error) {
    console.error('[email] Error sending checkout email:', error);
    throw error;
  }
}

/**
 * Sends thank you email after successful payment
 */
async function sendThankYouEmail(userEmail, planId) {
  const plan = PLAN_DETAILS[planId];
  
  const mailOptions = {
    from: `"Vera" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `✓ ¡Gracias por tu compra! - ${plan.name}`,
    html: getThankYouEmailHTML(userEmail, planId),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[email] Thank you email sent to ${userEmail}`);
    return { success: true };
  } catch (error) {
    console.error('[email] Error sending thank you email:', error);
    throw error;
  }
}

module.exports = {
  sendCheckoutEmail,
  sendThankYouEmail,
};
