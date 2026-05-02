import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Timer, 
  Sparkles, 
  User, 
  Brain, 
  BarChart3,
  TrendingUp,
  Share2,
  CalendarPlus,
  X,
  Check,
} from 'lucide-react';
import AIPulse from '../components/AIPulse';
import Avatar from '../components/Avatar';
import { sendChatMessage } from '../services/aiService';
import { createCalendarEvent, getCalendarStatus } from '../services/calendarService';
import { createMercadoPagoCheckout } from '../services/mercadoPagoService';
import {
  useAIPreferences,
  useIncrementInteraction,
  useAddLead,
  useSession,
  useAgentInstructions,
  useAnalyzeSentiment,
  useUpdateSessionTime,
} from '../store/useAppStore';

// ─── Constants ────────────────────────────────────────────────────────────────

const SALES_SYSTEM_PROMPT =
`Identidad del Agente de Ventas: Experto de Vera

1. IDENTIDAD CENTRAL Y MISIÓN
Eres Oliver, un Consultor Senior de Ventas Digitales en Vera. Tu comunicación con los clientes es completamente en español. Tu objetivo no es solo vender, sino diseñar la máquina de ventas autónoma perfecta para tus clientes.
Lema: "Tu Web Debería Estar Vendiendo Mientras Duermes."
Propuesta de Valor: Creamos webs autónomas que captan, cualifican y agendan clientes por ti. Sin sueldos, sin descansos.

2. TONO Y ESTILO PROFESIONAL
- Experto y Autoritario: No pides permiso; sugieres el mejor camino para el crecimiento del negocio.
- Solucionador de Problemas: Te enfocas en los puntos de dolor del cliente (falta de tiempo, leads perdidos, agendamiento manual).
- Urgencia: Enfatiza que cada día sin un sistema autónomo es un día de ingresos perdidos.
- Formal pero Accesible: Mantén un vocabulario empresarial de alto nivel.
- Respuestas concisas: máximo 3-4 oraciones por mensaje, a menos que el cliente pida más detalle.

3. CATÁLOGO DE PRODUCTOS (Planes de Evolución)

Plan A — Starter Autónomo ($250.000 ARS · Pago único)
Ideal para: Emprendedores o negocios nuevos que necesitan captación inmediata de leads.
Incluye: Landing Page Optimizada · Asistente de Captación IA · Agenda Automatizada.

Plan B — Business Flow ($350.000 ARS · Pago único) ★ RECOMENDADO
Ideal para: Empresas en crecimiento que necesitan un embudo de conversión completo.
Incluye: Web Multipágina Inteligente · IA de Cualificación de Leads · Integración con CRM y Slack · Analíticas Pro con IA.

Mantenimiento IA ($150.000 ARS/mes)
Obligatorio para sistemas de alto rendimiento.
Incluye: Reentrenamiento semanal de modelos IA · Optimización de Prompts · Hosting Premium.

4. EL VALOR AGREGADO
Al hablar con los clientes, destaca siempre la ventaja del Asistente IA 24/7:
- "Mientras tu competencia duerme, tu agente de Vera responde preguntas y cierra tratos."
- "Es como tener a tu mejor vendedor trabajando 168 horas a la semana sin cobrar un sueldo."

5. FLUJO DE VENTAS Y CONSULTORÍA
Tu CTA definitiva es Reservar una Consultoría Gratuita. El proceso:
1. Identificar Necesidad: Pregunta sobre el rendimiento actual de su web y cómo gestionan sus leads.
2. Recomendar: Sugiere el plan Starter o Business Flow según el tamaño de su empresa.
3. El Gancho: Explica que instalamos el sistema en menos de 7 días.
4. El Cierre: "Organizaré una propuesta formal y una llamada de descubrimiento. Por favor, bríndeme su correo y nuestro sistema enviará la documentación oficial y la invitación al calendario de inmediato."

6. PROCESO DE PAGO (IMPORTANTE)
SOLO cuando el cliente confirme EXPLÍCITAMENTE que quiere proceder con el pago:
- El cliente debe decir algo como: "quiero pagar", "proceder con el pago", "cómo pago", "método de pago"
- ENTONCES menciona: "Perfecto, procederemos con el pago del Plan [A/B] a través de Mercado Pago"
- Usa las palabras clave: "proceder con el pago", "Mercado Pago", "enlace de pago"
- Ejemplo: "Excelente. Procederé a generar el enlace de pago del Plan B a través de Mercado Pago. En un momento se abrirá la ventana de pago."

IMPORTANTE: NO menciones pago automáticamente. Solo cuando el cliente lo solicite explícitamente.

7. PREGUNTAS FRECUENTES
- ¿Cuánto tiempo toma? → Menos de 7 días.
- ¿Debo pagar mensualmente? → La construcción es pago único. El Mantenimiento IA ($150/mes) es muy recomendado para mantener la IA actualizada.
- ¿Qué es una "Web Autónoma"? → Un sitio que no solo muestra información, sino que interactúa, cualifica y agenda reuniones sin intervención humana.

REGLAS IMPORTANTES:
- Siempre responde en español.
- NO inventes contexto previo. Trata cada conversación como nueva.
- Si el cliente da su correo, responde: "Perfecto, he registrado su correo."
- Cuando el cliente confirme que quiere PAGAR, usa las palabras "pago", "Mercado Pago" y el nombre del plan en tu respuesta para activar el sistema automático.`;

const HIGH_INTENT_KEYWORDS = [
  'buy', 'purchase', 'price', 'cost', 'demo', 'trial', 'sign up', 'subscribe',
  'comprar', 'precio', 'costo', 'cotización', 'demostración', 'prueba', 'contratar', 'plan',
];

const BOOKING_KEYWORDS = [
  'agendar', 'agenda', 'cita', 'reunión', 'reunion', 'consultoría', 'consultoria',
  'llamada', 'schedule', 'meeting', 'appointment', 'book', 'reservar', 'reserva',
  'disponibilidad', 'cuando podemos', 'cuándo podemos', 'me interesa hablar',
];

const PAYMENT_KEYWORDS = [
  'proceder con el pago',
  'realizar el pago', 
  'método de pago',
  'pagar ahora',
  'quiero pagar',
  'mercado pago',
  'mercadopago',
  'checkout',
  'factura',
  'enlace de pago',
  'ventana de pago',
  'generar.*pago',
  'abrir.*pago'
];

/**
 * Returns true if the message contains booking/scheduling intent.
 */
function hasBookingIntent(text) {
  const lower = text.toLowerCase();
  return BOOKING_KEYWORDS.some((kw) => lower.includes(kw));
}

/**
 * Returns true if the message contains payment/checkout intent.
 * Now more strict to avoid false positives.
 */
function hasPaymentIntent(text) {
  const lower = text.toLowerCase();
  
  // Must contain explicit payment words AND plan reference together
  const hasExplicitPayment = PAYMENT_KEYWORDS.some((kw) => {
    if (kw.includes('.*')) {
      // Handle regex patterns
      const regex = new RegExp(kw);
      return regex.test(lower);
    }
    return lower.includes(kw);
  });
  
  // Additional check: must be in Oliver's response AND contain payment context
  const hasPaymentContext = lower.includes('pago') && (
    lower.includes('mercado pago') || 
    lower.includes('enlace') || 
    lower.includes('ventana') ||
    lower.includes('proceder')
  );
  
  return hasExplicitPayment || hasPaymentContext;
  return PAYMENT_KEYWORDS.some((kw) => lower.includes(kw));
}

/**
 * Extracts plan ID from text (starter, business, maintenance).
 * Returns null if no plan detected.
 * Now more specific to avoid false positives.
 */
function extractPlanFromText(text) {
  const lower = text.toLowerCase();
  
  // Only extract plan if it's in a payment context
  if (lower.includes('plan a') && (lower.includes('pago') || lower.includes('mercado'))) return 'starter';
  if (lower.includes('plan b') && (lower.includes('pago') || lower.includes('mercado'))) return 'business';
  if ((lower.includes('starter') || lower.includes('autónomo')) && (lower.includes('pago') || lower.includes('mercado'))) return 'starter';
  if ((lower.includes('business') || lower.includes('flow')) && (lower.includes('pago') || lower.includes('mercado'))) return 'business';
  if (lower.includes('mantenimiento') && (lower.includes('pago') || lower.includes('mercado'))) return 'maintenance';
  
  return null;
}

/**
 * Tries to extract a date/time from a natural language message.
 * Handles: "mañana a las 5 de la tarde", "el lunes a las 17:00", "hoy a las 3pm", etc.
 * Returns a Date object or null.
 */
function extractDateTimeFromText(text) {
  const lower = text.toLowerCase();
  const now = new Date();

  // Base date
  let base = new Date(now);
  if (lower.includes('mañana') || lower.includes('manana')) {
    base.setDate(base.getDate() + 1);
  } else if (lower.includes('pasado mañana') || lower.includes('pasado manana')) {
    base.setDate(base.getDate() + 2);
  } else if (lower.includes('hoy')) {
    // keep today
  } else {
    // Try day names
    const days = ['domingo','lunes','martes','miércoles','miercoles','jueves','viernes','sábado','sabado'];
    const dayIndex = days.findIndex((d) => lower.includes(d));
    if (dayIndex !== -1) {
      const targetDay = dayIndex % 7; // miércoles/miercoles both → 3
      const currentDay = base.getDay();
      let diff = targetDay - currentDay;
      if (diff <= 0) diff += 7;
      base.setDate(base.getDate() + diff);
    } else {
      // No date found — default to tomorrow
      base.setDate(base.getDate() + 1);
    }
  }

  // Extract hour
  let hour = null;

  // "5 de la tarde" / "3 de la tarde" → PM
  const tardeMatch = lower.match(/(\d{1,2})\s*(?:de\s*la\s*tarde|pm)/);
  if (tardeMatch) {
    hour = parseInt(tardeMatch[1]);
    if (hour < 12) hour += 12;
  }

  // "10 de la mañana" / "am"
  const mananaMatch = lower.match(/(\d{1,2})\s*(?:de\s*la\s*ma[ñn]ana|am)/);
  if (!tardeMatch && mananaMatch) {
    hour = parseInt(mananaMatch[1]);
    if (hour === 12) hour = 0;
  }

  // "17:00" / "5:30"
  const timeMatch = lower.match(/(\d{1,2}):(\d{2})/);
  if (!tardeMatch && !mananaMatch && timeMatch) {
    hour = parseInt(timeMatch[1]);
  }

  // "a las 5" without am/pm — assume PM if < 8
  if (hour === null) {
    const alasMatch = lower.match(/a\s*las\s*(\d{1,2})/);
    if (alasMatch) {
      hour = parseInt(alasMatch[1]);
      if (hour < 8) hour += 12;
    }
  }

  if (hour === null) return null;

  base.setHours(hour, 0, 0, 0);
  return base;
}

/**
 * Builds a chat summary from the last N messages for the event description.
 */
function buildChatSummary(messages) {
  const relevant = messages
    .filter((m) => m.role === 'User' || m.role === 'AI')
    .slice(-6); // last 3 exchanges
  return relevant
    .map((m) => `${m.role === 'User' ? 'Cliente' : 'Oliver'}: ${m.text}`)
    .join('\n');
}

// ─── Booking Modal ────────────────────────────────────────────────────────────

const BookingModal = ({ onClose, onConfirm, attendeeEmail, suggestedDate, chatSummary }) => {
  const pad = (n) => String(n).padStart(2, '0');
  const toLocalInput = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

  // Use suggested date from chat, or default to tomorrow at 10am
  const defaultDate = suggestedDate || (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(10, 0, 0, 0);
    return d;
  })();

  const [startVal, setStartVal] = useState(toLocalInput(defaultDate));
  const [email, setEmail] = useState(attendeeEmail || '');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (!startVal) { setError('Selecciona una fecha y hora.'); return; }
    setLoading(true);
    setError('');
    try {
      const start = new Date(startVal);
      const end = new Date(start.getTime() + 60 * 60 * 1000); // +1 hora

      const description = chatSummary
        ? `Resumen de la conversación:\n\n${chatSummary}\n\n---\nAgendado desde el chat de ventas de Vera.`
        : 'Llamada de descubrimiento agendada desde el chat de ventas de Vera.';

      await onConfirm({
        summary: 'Consultoría Gratuita — Vera',
        description,
        startDateTime: start.toISOString(),
        endDateTime: end.toISOString(),
        attendeeEmail: email || undefined,
      });
      setDone(true);
    } catch (err) {
      setError(err.message || 'Error al agendar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass-panel rounded-3xl p-8 w-full max-w-md space-y-6 border border-primary/10"
      >
        {done ? (
          <div className="flex flex-col items-center text-center space-y-4 py-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Check className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-xl font-bold">¡Consultoría agendada!</h2>
            <p className="text-sm text-on-surface-variant">El evento fue creado en Google Calendar. El cliente recibirá una invitación en su correo.</p>
            <button onClick={onClose} className="btn-primary px-6 py-2.5 rounded-xl text-sm mt-2">Cerrar</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CalendarPlus className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold">Agendar Consultoría</h2>
              </div>
              <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat summary preview */}
            {chatSummary && (
              <div className="bg-surface-container-highest/30 rounded-2xl p-4 space-y-1 border border-white/5">
                <p className="text-[10px] text-primary uppercase tracking-widest font-bold mb-2">Resumen del chat</p>
                <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-4 whitespace-pre-line">{chatSummary}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">
                  Fecha y hora
                  {suggestedDate && <span className="ml-2 text-primary normal-case tracking-normal font-normal">· detectada del chat</span>}
                </label>
                <input
                  type="datetime-local"
                  value={startVal}
                  onChange={(e) => setStartVal(e.target.value)}
                  className="w-full bg-surface-container-highest/40 border border-white/5 focus:border-primary/40 rounded-xl px-4 py-3 text-sm outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">Correo del cliente (opcional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cliente@empresa.com"
                  className="w-full bg-surface-container-highest/40 border border-white/5 focus:border-primary/40 rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder:text-on-surface-variant/30"
                />
              </div>
              <p className="text-xs text-on-surface-variant/60">Duración: 1 hora. Se creará en tu Google Calendar principal.</p>
            </div>

            {error && <p className="text-xs text-error">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm border border-white/5 hover:border-white/10 transition-all">
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 btn-primary py-2.5 rounded-xl text-sm disabled:opacity-50"
              >
                {loading ? 'Agendando...' : 'Confirmar'}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

/**
 * Determines the AI provider and API key based on the selected model.
 */
function resolveProvider(salesModel, openaiKey, groqKey) {
  // Only use OpenAI if the user explicitly selected a GPT model AND has an OpenAI key
  if (salesModel.startsWith('gpt-') && openaiKey) {
    return { provider: 'openai', apiKey: openaiKey };
  }
  // Default everything to Groq
  return { provider: 'groq', apiKey: groqKey };
}

/**
 * Returns true if the message text contains any high-intent purchase keyword.
 */
function hasHighIntent(text) {
  const lower = text.toLowerCase();
  return HIGH_INTENT_KEYWORDS.some((kw) => lower.includes(kw));
}

/**
 * Extracts email addresses and phone numbers from a text message.
 */
function extractContactInfo(text) {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const phoneRegex = /(?:\+?\d{1,3}[\s-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g;
  
  const emails = text.match(emailRegex) || [];
  const phones = text.match(phoneRegex) || [];
  
  return { emails, phones };
}

// ─── Component ────────────────────────────────────────────────────────────────

const SalesChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'Oliver',
      role: 'AI',
      text: '👋 Bienvenido a Vera. Soy Oliver. Permítame preguntarle: ¿su web actual está captando y agendando clientes de forma automática, o aún depende de procesos manuales?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [engagement, setEngagement] = useState(15);
  const [purchaseIntentScore, setPurchaseIntentScore] = useState(5);
  const [sessionStartTime] = useState(Date.now());
  const [currentSessionTime, setCurrentSessionTime] = useState(0);
  const scrollRef = useRef(null);

  // AppStore hooks
  const aiPreferences = useAIPreferences();
  const incrementInteraction = useIncrementInteraction();
  const addLead = useAddLead();
  const session = useSession();
  const agentInstructions = useAgentInstructions();
  const analyzeSentiment = useAnalyzeSentiment();
  const updateSessionTime = useUpdateSessionTime();

  // Google Calendar
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingEmail, setBookingEmail] = useState('');
  const [bookingSuggestedDate, setBookingSuggestedDate] = useState(null);
  const [bookingChatSummary, setBookingChatSummary] = useState('');

  useEffect(() => {
    if (!session?.token) return;
    getCalendarStatus(session.token).then(({ connected }) => setCalendarConnected(connected));
  }, [session?.token]);

  // Track session time when component unmounts
  useEffect(() => {
    const handleBeforeUnload = () => {
      const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
      updateSessionTime(sessionDuration);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
        updateSessionTime(sessionDuration);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      // Update session time when component unmounts
      const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
      updateSessionTime(sessionDuration);
      
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [sessionStartTime, updateSessionTime]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Update session timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSessionTime(Math.floor((Date.now() - sessionStartTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  const handleSendMessage = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || isLoading) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newUserMessage = {
      id: Date.now(),
      sender: 'Tú',
      role: 'User',
      text: trimmed,
      time: now,
    };

    // Append user message and clear input
    setMessages((prev) => [...prev, newUserMessage]);
    setInputText('');

    // Disable input while API call is in progress
    setIsLoading(true);
    setIsTyping(true);

    // Extract contact info from user message
    const { emails, phones } = extractContactInfo(trimmed);
    const hasContact = emails.length > 0 || phones.length > 0;

    // Booking intent detection — open modal if calendar is connected
    if (hasBookingIntent(trimmed) && calendarConnected) {
      setBookingEmail(emails[0] || '');
      setBookingSuggestedDate(extractDateTimeFromText(trimmed));
      setBookingChatSummary(buildChatSummary([...messages, newUserMessage]));
      setShowBookingModal(true);
    }

    // Engagement scoring based on message interaction
    const messageLength = trimmed.length;
    const hasQuestions = trimmed.includes('?');
    const isDetailed = messageLength > 50;
    
    // Analizar sentimiento del mensaje del usuario
    analyzeSentiment(trimmed);
    
    // Increase engagement based on interaction quality
    let engagementIncrease = 5; // Base increase per message
    if (hasQuestions) engagementIncrease += 8; // Questions show interest
    if (isDetailed) engagementIncrease += 10; // Detailed messages show engagement
    if (hasContact) engagementIncrease += 15; // Contact info shows high engagement
    
    setEngagement((prev) => Math.min(prev + engagementIncrease, 100));

    // High-intent detection or contact info shared
    if (hasHighIntent(trimmed) || hasContact) {
      setPurchaseIntentScore((prev) => Math.min(prev + 15, 100));
      incrementInteraction();
      addLead({
        id: String(Date.now()),
        name: hasContact ? (emails[0] || phones[0]) : 'Visitante',
        company: 'Vía Sales Chat',
        intent: hasContact ? 'high' : 'medium',
        email: emails[0] || '',
        phone: phones[0] || '',
        capturedAt: new Date().toISOString(),
        sessionId: String(Date.now()),
      });
    } else {
      // Gradual increase in purchase intent based on conversation progression
      const messageCount = messages.length + 1;
      let intentIncrease = 2; // Base increase
      
      if (messageCount > 3) intentIncrease += 3; // Sustained conversation
      if (messageCount > 6) intentIncrease += 5; // Long conversation shows interest
      if (hasQuestions) intentIncrease += 4; // Questions about service
      
      setPurchaseIntentScore((prev) => Math.min(prev + intentIncrease, 100));
    }

    // Build conversation history for the API call
    const { salesModel, temperature, maxTokens, openaiKey, groqKey } = aiPreferences;
    const { provider, apiKey } = resolveProvider(salesModel, openaiKey, groqKey);

    // If provider is groq, ensure we send a valid Groq model name
    const VALID_GROQ_MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma2-9b-it'];
    const resolvedModel = (provider === 'groq' && !VALID_GROQ_MODELS.includes(salesModel))
      ? 'llama-3.3-70b-versatile'
      : salesModel;

    // Convert current messages + new user message to API format
    const allMessages = [...messages, newUserMessage];
    const systemContent = agentInstructions
      ? `${SALES_SYSTEM_PROMPT}\n\n---\n\n## Instrucciones personalizadas de la agencia:\n\n${agentInstructions}`
      : SALES_SYSTEM_PROMPT;
    const apiMessages = [
      { role: 'system', content: systemContent },
      ...allMessages.map((m) => ({
        role: m.role === 'User' ? 'user' : 'assistant',
        content: m.text,
      })),
    ];

    try {
      const { content } = await sendChatMessage({
        messages: apiMessages,
        model: resolvedModel,
        temperature,
        maxTokens,
        apiKey,
        provider,
        token: session?.token,
      });

      setIsTyping(false);

      const aiResponse = {
        id: Date.now() + 1,
        sender: 'Oliver',
        role: 'AI',
        text: content,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiResponse]);

      // ─── Payment Intent Detection ───────────────────────────────────────────
      // If Oliver mentions payment/checkout, automatically open Mercado Pago
      console.log('[Payment Detection Debug]', {
        content: content.substring(0, 100) + '...',
        hasPaymentIntent: hasPaymentIntent(content),
        detectedPlan: extractPlanFromText(content)
      });
      
      if (hasPaymentIntent(content)) {
        const detectedPlan = extractPlanFromText(content);
        
        // Try to get email from user message first, then from Oliver's response, then from all messages
        let detectedEmail = emails[0]; // From current user message
        if (!detectedEmail) {
          const emailsInResponse = extractContactInfo(content).emails;
          detectedEmail = emailsInResponse[0];
        }
        if (!detectedEmail) {
          // Search in previous messages
          for (let i = messages.length - 1; i >= 0; i--) {
            const msg = messages[i];
            const foundEmails = extractContactInfo(msg.text).emails;
            if (foundEmails.length > 0) {
              detectedEmail = foundEmails[0];
              break;
            }
          }
        }
        
        console.log('[Payment Detection]', { detectedPlan, detectedEmail, hasPaymentIntent: true });
        
        if (detectedPlan && detectedEmail) {
          // Open checkout in new window after a short delay
          setTimeout(() => {
            try {
              createMercadoPagoCheckout(detectedPlan, detectedEmail, session?.token);
            } catch (err) {
              console.error('Error opening checkout:', err);
            }
          }, 1500);
        } else {
          console.warn('[Payment Detection] Missing plan or email:', { detectedPlan, detectedEmail });
        }
      }
    } catch (err) {
      setIsTyping(false);

      const errorMessage = {
        id: Date.now() + 1,
        sender: 'Oliver',
        role: 'AI',
        text: err?.message || 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Derive purchase intent label from score with more realistic thresholds
  const purchaseIntentLabel =
    purchaseIntentScore >= 70 ? 'Alto' : purchaseIntentScore >= 35 ? 'Medio' : 'Bajo';

  const handleConfirmBooking = async (eventData) => {
    await createCalendarEvent(session.token, eventData);
  };

  return (
    <div className="flex h-[calc(100vh-80px)] bg-surface relative overflow-hidden">

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <BookingModal
            onClose={() => setShowBookingModal(false)}
            onConfirm={handleConfirmBooking}
            attendeeEmail={bookingEmail}
            suggestedDate={bookingSuggestedDate}
            chatSummary={bookingChatSummary}
          />
        )}
      </AnimatePresence>
      {/* Messages Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 glass-panel flex justify-between items-center px-12 z-20 sticky top-0 border-b border-white/5">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border border-outline-variant/30 overflow-hidden">
                <Avatar src={undefined} name="Oliver" size={48} />
              </div>
              <AIPulse className="absolute bottom-0 right-0 w-3 h-3" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Oliver <span className="text-[10px] font-normal text-on-surface-variant ml-2 uppercase tracking-[0.2em]">Consultor Virtual</span></h1>
              <p className="text-[10px] text-primary flex items-center tracking-wider font-bold">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2 animate-pulse"></span> ANALIZANDO INTENCIÓN DEL LEAD
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="hidden lg:flex items-center space-x-2 text-on-surface-variant text-sm font-medium">
              <Timer className="w-4 h-4" />
              <span>Sesión: {Math.floor(currentSessionTime / 60)}:{String(currentSessionTime % 60).padStart(2, '0')}</span>
            </div>
            {calendarConnected && (
              <button
                onClick={() => {
                  setBookingSuggestedDate(null);
                  setBookingChatSummary(buildChatSummary(messages));
                  setShowBookingModal(true);
                }}
                className="flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm border border-primary/20 text-primary hover:bg-primary/10 transition-all"
              >
                <CalendarPlus className="w-4 h-4" />
                Agendar
              </button>
            )}
            <button 
              onClick={async () => {
                // Extract email and plan from conversation
                let email = null;
                let plan = null;
                
                // Helper function to extract emails
                const getEmails = (text) => {
                  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
                  return text.match(emailRegex) || [];
                };
                
                // Helper function to extract plan
                const getPlan = (text) => {
                  const lower = text.toLowerCase();
                  if (lower.includes('plan a') || lower.includes('starter')) return 'starter';
                  if (lower.includes('plan b') || lower.includes('business')) return 'business';
                  if (lower.includes('mantenimiento') || lower.includes('maintenance')) return 'maintenance';
                  return null;
                };
                
                // Search in messages
                for (let i = messages.length - 1; i >= 0; i--) {
                  const msg = messages[i];
                  const foundEmails = getEmails(msg.text);
                  if (foundEmails.length > 0 && !email) {
                    email = foundEmails[0];
                  }
                  const foundPlan = getPlan(msg.text);
                  if (foundPlan && !plan) {
                    plan = foundPlan;
                  }
                  if (email && plan) break;
                }
                
                console.log('[Manual Checkout]', { email, plan });
                
                if (!email) {
                  alert('No se detectó un email en la conversación. Por favor, proporciona tu email primero.');
                  return;
                }
                if (!plan) {
                  alert('No se detectó un plan en la conversación. Por favor, menciona qué plan deseas (Plan A/Starter o Plan B/Business).');
                  return;
                }
                
                // Detect device type
                const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                const isTablet = /iPad|Android(?=.*Tablet)/i.test(navigator.userAgent);
                const deviceType = isMobile && !isTablet ? 'mobile' : 'web';
                
                // Open checkout
                try {
                  const result = await createMercadoPagoCheckout(plan, email, session?.token);
                  
                  if (deviceType === 'mobile') {
                    // Mobile users will be redirected, so show a different message
                    console.log('[Mobile Checkout] Redirecting to Mercado Pago app/mobile site');
                  } else {
                    // Web users get a new window
                    alert('Checkout abierto! Revisa la nueva ventana y tu email.');
                  }
                } catch (err) {
                  console.error('[Manual Checkout Error]', err);
                  alert('Error al abrir el checkout: ' + err.message);
                }
              }}
              className="flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm border border-secondary/20 text-secondary hover:bg-secondary/10 transition-all"
            >
              💳 Procesar Pago
            </button>
            <button 
              onClick={() => alert('¡Funcionalidad de toma de control humano próximamente!')}
              className="btn-primary py-2.5 px-6 rounded-xl text-sm shadow-[0_4px_20px_rgba(164,230,255,0.3)]"
            >
              Tomar Control del Chat
            </button>
          </div>
        </header>

        {/* Chat window */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-12 py-12 space-y-12 max-w-5xl mx-auto w-full custom-scrollbar"
        >
          <div className="flex flex-col items-center text-center space-y-2 py-4">
            <span className="text-[10px] text-on-surface-variant uppercase tracking-[0.3em] font-bold opacity-60">{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <p className="text-on-surface-variant italic text-sm max-w-md">Oliver está listo para asistirte. Escribe tu mensaje para comenzar la conversación.</p>
          </div>

          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start gap-6 ${msg.role === 'User' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border border-white/5 shadow-xl ${msg.role === 'User' ? 'bg-surface-container-low' : 'bg-surface-container-highest'}`}>
                  {msg.role === 'User' ? <User className="text-secondary w-5 h-5" /> : <Sparkles className="text-primary w-5 h-5" />}
                </div>
                <div className={`flex-1 flex flex-col space-y-2 ${msg.role === 'User' ? 'items-end' : ''}`}>
                  <div className={`p-6 rounded-3xl max-w-[85%] text-lg font-medium leading-relaxed shadow-2xl ${
                    msg.isError
                      ? 'glass-panel rounded-tl-none border-l-2 border-error/40 text-error'
                      : msg.role === 'User' 
                        ? 'bg-surface-container-high rounded-tr-none' 
                        : 'glass-panel rounded-tl-none border-l-2 border-primary/20'
                  }`}>
                    {msg.text}
                  </div>
                  <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-[0.2em] font-bold px-2">
                    {msg.sender} • {msg.role === 'User' ? 'Leído' : 'Entregado'} {msg.time}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="flex items-center space-x-6"
            >
              <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center border border-white/5">
                <Brain className="text-primary w-5 h-5 animate-pulse" />
              </div>
              <div className="flex items-center space-x-3 py-4 opacity-60">
                <span className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <div className="w-1.5 h-1.5 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </span>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-[0.2em] font-black ml-4">Oliver está sintetizando datos...</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Bar */}
        <footer className="h-28 glass-panel z-20 px-12 flex items-center border-t border-white/5">
          <div className="flex-1 flex items-center space-x-4 bg-surface-container-highest/50 p-2 rounded-2xl border border-white/5 group focus-within:border-primary/30 transition-all">
            <button
              className="w-12 h-12 flex items-center justify-center text-on-surface-variant hover:text-white transition-colors disabled:opacity-40"
              disabled={isLoading}
              aria-label="Adjuntar archivo"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <input 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
              className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-on-surface-variant/40 font-medium py-3 disabled:opacity-40 disabled:cursor-not-allowed" 
              placeholder="Responder como Agente o escribir comando..." 
              type="text"
              disabled={isLoading}
              aria-label="Entrada de mensaje"
            />
            <div className="flex items-center space-x-2 px-2">
              <button
                className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-white transition-colors disabled:opacity-40"
                disabled={isLoading}
                aria-label="Emoji"
              >
                <Smile className="w-5 h-5" />
              </button>
              <button 
                onClick={handleSendMessage}
                disabled={isLoading || !inputText.trim()}
                aria-label="Enviar mensaje"
                className="bg-gradient-to-br from-primary to-primary-container text-on-primary-fixed w-12 h-12 rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Intelligence Sidebar */}
      <aside className="w-80 bg-surface-container-low border-l border-white/5 hidden xl:flex flex-col p-8 space-y-10 sticky top-0 right-0 overflow-y-auto custom-scrollbar">
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.3em] font-black text-on-surface-variant mb-8 flex items-center gap-2">
            <BarChart3 className="w-3 h-3" /> Puntuación de Leads
          </h4>
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-sm font-bold text-white uppercase tracking-tighter">Compromiso</span>
                <motion.span 
                  key={engagement}
                  initial={{ scale: 1.2, color: '#a4e6ff' }}
                  animate={{ scale: 1, color: '#fff' }}
                  className="text-2xl font-black"
                >
                  {engagement}%
                </motion.span>
              </div>
              <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-primary"
                  animate={{ width: `${engagement}%` }}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-sm font-bold text-white uppercase tracking-tighter">Intención de Compra</span>
                <motion.span
                  key={purchaseIntentScore}
                  initial={{ scale: 1.2, color: '#a4e6ff' }}
                  animate={{ scale: 1, color: '#fff' }}
                  className="text-2xl font-black text-secondary"
                >
                  {purchaseIntentLabel}
                </motion.span>
              </div>
              <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-secondary"
                  animate={{ width: `${purchaseIntentScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-[10px] uppercase tracking-[0.3em] font-black text-on-surface-variant mb-6">Insights Detectados</h4>
          <div className="space-y-4">
            {[
              { text: 'Mencionó "Escalabilidad" dos veces—sistema marcó como Punto de Dolor Principal.', active: engagement > 60 },
              { text: 'Competidor "HubSpot AI" mencionado. Oliver redirigió a ventaja de Integraciones Personalizadas.', active: purchaseIntentScore > 40 },
              { text: 'Usuario hace preguntas específicas sobre implementación—interés genuino detectado.', active: engagement > 40 },
              { text: 'Conversación sostenida por más de 5 intercambios—lead calificado.', active: messages.length > 10 }
            ].filter(insight => insight.active).slice(0, 2).map((insight, i) => (
              <div key={i} className={`p-5 rounded-2xl border transition-colors ${insight.active ? 'bg-primary/5 border-primary/20 ring-1 ring-primary/10' : 'bg-white/5 border-white/5'}`}>
                <p className="text-xs text-on-surface leading-relaxed font-medium">
                  {insight.text.split('Punto de Dolor Principal').map((t, index) => index === 0 ? t : <strong className="text-primary" key={index}>Punto de Dolor Principal</strong>)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
           <h4 className="text-[10px] uppercase tracking-[0.3em] font-black text-on-surface-variant mb-6">Integración CRM</h4>
           <div className="flex items-center justify-between p-5 bg-surface-container-highest rounded-2xl border border-white/5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500">
                <Share2 className="w-5 h-5" />
              </div>
              <span className="text-sm font-black">Salesforce</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-black tracking-widest border border-green-500/20">CONECTADO</div>
           </div>
        </div>
      </aside>
    </div>
  );
};

export default SalesChat;
