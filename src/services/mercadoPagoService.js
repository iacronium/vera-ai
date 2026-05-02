/**
 * mercadoPagoService.js
 * Wrappers over the backend Mercado Pago API (Argentina).
 */

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Creates a Mercado Pago checkout preference and opens payment page optimized for device.
 * @param {string} planId - 'starter', 'business', or 'maintenance'
 * @param {string} userEmail - Customer email
 * @param {string} token - JWT token (optional)
 */
export async function createMercadoPagoCheckout(planId, userEmail, token) {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Detect mobile device
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isTablet = /iPad|Android(?=.*Tablet)/i.test(navigator.userAgent);
  
  console.log('[Checkout] Device detection:', { isMobile, isTablet, userAgent: navigator.userAgent });

  const res = await fetch(`${BACKEND_URL}/api/mercadopago/checkout`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ 
      planId, 
      userEmail,
      deviceType: isMobile && !isTablet ? 'mobile' : 'web'
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al crear el checkout.');
  }

  const { initPoint, sandboxInitPoint, externalReference } = await res.json();

  // Choose checkout URL based on environment
  const checkoutUrl = sandboxInitPoint || initPoint;
  
  if (isMobile && !isTablet) {
    // Mobile: For now, use same behavior as web (new window) for reliability
    // TODO: Implement native mobile experience once Mercado Pago config is optimized
    console.log('[Checkout] Opening mobile checkout in new window (optimized size)');
    window.open(checkoutUrl, '_blank', 'width=400,height=700,scrollbars=yes,resizable=yes');
  } else {
    // Web/Tablet: Open in new window
    console.log('[Checkout] Opening web checkout in new window');
    window.open(checkoutUrl, '_blank', 'width=800,height=900,scrollbars=yes,resizable=yes');
  }
  
  return { externalReference, checkoutUrl, deviceType: isMobile && !isTablet ? 'mobile' : 'web' };
}

/**
 * Fetches payment details by external reference.
 * @param {string} externalReference - Payment external reference
 */
export async function getPaymentByExternalReference(externalReference) {
  const res = await fetch(`${BACKEND_URL}/api/mercadopago/order/${externalReference}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al obtener el pago.');
  }
  return res.json();
}

/**
 * Checks payment status directly from Mercado Pago API.
 * @param {string} paymentId - Mercado Pago payment ID
 */
export async function checkPaymentStatus(paymentId) {
  const res = await fetch(`${BACKEND_URL}/api/mercadopago/payment-status/${paymentId}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al consultar el estado del pago.');
  }
  return res.json();
}

/**
 * Fetches all payments for the authenticated user.
 * @param {string} token - JWT token
 */
export async function getUserPayments(token) {
  const res = await fetch(`${BACKEND_URL}/api/mercadopago/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al obtener los pagos.');
  }
  return res.json();
}
