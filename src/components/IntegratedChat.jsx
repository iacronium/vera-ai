import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Sparkles, Zap, Brain, MessageSquare, Rocket, 
  TrendingUp, Calendar, BarChart3, Globe, Cpu, Shield,
  Volume2, VolumeX, Mic, MicOff, RefreshCw, Radio
} from 'lucide-react';
import { sendChatMessage } from '../services/aiService';
import NeuralOrb from './NeuralOrb';
import CognitiveTrace from './CognitiveTrace';
import GenerativeSlotCard from './GenerativeSlotCard';
import { cyberAudio } from '../services/cyberAudio';

const PUBLIC_CHAT_SYSTEM_PROMPT = `Eres Oliver, un Consultor de Ventas Digitales de Vera. Tu objetivo es ayudar a los visitantes del sitio web a entender nuestros servicios y guiarlos hacia una consulta.

SERVICIOS PRINCIPALES:
- Plan A – Starter Autónomo ($250.000 ARS): Landing Page + IA de Captación + Agenda Automatizada
- Plan B – Business Flow ($350.000 ARS): Web Completa + IA Avanzada + CRM + Analiticas
- Mantenimiento IA ($150.000 ARS/mes): Reentrenamiento y optimización

INSTRUCCIONES:
1. Responde en español de manera profesional pero amigable
2. Mantén las respuestas concisas (máximo 3-4 oraciones)
3. Enfócate en los beneficios de automatización y captación de leads 24/7
4. Si preguntan por precios, menciona los planes disponibles
5. Invita a agendar una consulta gratuita para más detalles
6. NO proceses pagos ni manejes información sensible
7. Si necesitan funciones avanzadas, sugiere que se registren en la plataforma
8. Cuando menciones un plan especifico, usa exactamente estos nombres: "Plan A", "Plan B", o "Mantenimiento"

Ejemplo de respuesta: "¡Hola! Soy Oliver, tu consultor virtual. Ayudo a empresas a crear webs que captan y agendan clientes automáticamente, incluso mientras duermen. ¿Te interesa saber cómo podemos automatizar tu captación de leads?"`;

const PLAN_CARDS = {
  'plan a': {
    id: 'starter',
    name: 'Plan A – Starter Autónomo',
    price: '$250.000',
    currency: 'ARS',
    subtitle: 'Pago único',
    description: 'Perfecto para emprendedores que necesitan captación inmediata',
    gradient: 'from-cyan-500 to-blue-500',
    icon: Rocket,
    features: [
      { icon: Globe, text: 'Landing Page Optimizada' },
      { icon: Brain, text: 'Asistente IA de Captación' },
      { icon: Calendar, text: 'Agenda Automatizada' },
      { icon: Zap, text: 'Respuesta en milisegundos' },
    ],
  },
  'plan b': {
    id: 'business',
    name: 'Plan B – Business Flow',
    price: '$350.000',
    currency: 'ARS',
    subtitle: 'Pago único • Recomendado',
    description: 'Para empresas que necesitan un embudo completo',
    gradient: 'from-blue-500 to-purple-500',
    icon: TrendingUp,
    features: [
      { icon: Globe, text: 'Web Multipágina Inteligente' },
      { icon: Brain, text: 'IA de Cualificación Avanzada' },
      { icon: BarChart3, text: 'Integración CRM + Slack' },
      { icon: Cpu, text: 'Analiticas Pro con IA' },
    ],
  },
  'mantenimiento': {
    id: 'maintenance',
    name: 'Mantenimiento IA',
    price: '$150.000',
    currency: 'ARS/mes',
    subtitle: 'Suscripción mensual',
    description: 'Mantén tu IA actualizada y optimizada',
    gradient: 'from-purple-500 to-pink-500',
    icon: Shield,
    features: [
      { icon: Cpu, text: 'Reentrenamiento semanal' },
      { icon: Zap, text: 'Optimización de Prompts' },
      { icon: Shield, text: 'Hosting Premium' },
      { icon: TrendingUp, text: 'Mejora continua' },
    ],
  },
};

const detectPlanMention = (text) => {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('plan a') || lowerText.includes('starter')) return 'plan a';
  if (lowerText.includes('plan b') || lowerText.includes('business')) return 'plan b';
  if (lowerText.includes('mantenimiento') || lowerText.includes('maintenance')) return 'mantenimiento';
  return null;
};

const detectCalendarMention = (text) => {
  const lowerText = text.toLowerCase();
  return lowerText.includes('agendar') || lowerText.includes('agenda') || 
         lowerText.includes('consulta') || lowerText.includes('reunión') || 
         lowerText.includes('reunion') || lowerText.includes('cita');
};

const SUGGESTED_QUERIES = [
  "¿Cuáles son los planes y precios?",
  "¿Cómo funciona la captura 24/7?",
  "Quiero agendar una consulta gratuita",
  "¿Qué incluye el Plan B Business Flow?"
];

export default function IntegratedChat() {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      sender: 'Oliver', 
      role: 'AI', 
      text: '¡Hola! Soy Oliver, el consultor virtual de Vera. Conecto tu negocio a infraestructura de automatización inteligente que capta y agenda clientes en tiempo real. ¿En qué objetivo o proyecto te gustaría enfocarte hoy?', 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activePlan, setActivePlan] = useState(null);
  const [showSlotPicker, setShowSlotPicker] = useState(false);
  const [aiState, setAiState] = useState('idle'); // idle | reasoning | speaking
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  const chatRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: 'smooth'
    });
  }, [messages, isLoading, activePlan, showSlotPicker]);

  const toggleSound = () => {
    const muted = cyberAudio.toggleMute();
    setIsAudioMuted(muted);
    if (!muted) cyberAudio.playTap();
  };

  const handleSendMessage = async (textToSend) => {
    const trimmed = (textToSend || inputText).trim();
    if (!trimmed || isLoading) return;

    cyberAudio.playSend();

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newUserMessage = {
      id: Date.now(),
      sender: 'Tú',
      role: 'User',
      text: trimmed,
      time: now,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputText('');
    setIsLoading(true);
    setAiState('reasoning');

    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);

    const allMessages = [...messages, newUserMessage];
    const apiMessages = [
      { role: 'system', content: PUBLIC_CHAT_SYSTEM_PROMPT },
      ...allMessages.map((m) => ({
        role: m.role === 'User' ? 'user' : 'assistant',
        content: m.text,
      })),
    ];

    try {
      const { content } = await sendChatMessage({
        messages: apiMessages,
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        maxTokens: 512,
        provider: 'groq',
      });

      setAiState('speaking');
      cyberAudio.playReceive();

      const aiResponse = {
        id: Date.now() + 1,
        sender: 'Oliver',
        role: 'AI',
        text: content,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiResponse]);

      // Detección generativa de planes
      const mentionedPlan = detectPlanMention(content);
      if (mentionedPlan) {
        setActivePlan(mentionedPlan);
        cyberAudio.playTap();
      }

      // Detección generativa de agenda de citas
      if (detectCalendarMention(content) || detectCalendarMention(trimmed)) {
        setShowSlotPicker(true);
      }

      setTimeout(() => {
        setAiState('idle');
      }, 1500);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      setAiState('idle');
      const errorResponse = {
        id: Date.now() + 1,
        sender: 'Oliver',
        role: 'AI',
        text: 'Disculpa, ocurrió una fluctuación cuántica en la conexión. Por favor reintenta en un instante o selecciona un plan directo.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSlotSelected = (slot) => {
    const confirmationText = `He seleccionado el horario de ${slot.date} a las ${slot.time} (${slot.tz}).`;
    handleSendMessage(confirmationText);
  };

  return (
    <div className="flex flex-col h-[650px] w-full max-w-4xl mx-auto rounded-3xl border border-primary/20 bg-surface/90 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] overflow-hidden relative">
      {/* Luz ambiental de fondo */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header 2040 Cybernetic Core */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-surface-container/60 backdrop-blur-xl z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <NeuralOrb state={aiState} size={44} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white tracking-wide text-sm flex items-center gap-1.5">
                Oliver // Vera AI
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 border border-primary/25 text-primary">
                QUANTUM_AGENT
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
              <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
              Estado: <span className="text-white capitalize">{aiState === 'reasoning' ? 'Procesando sinapsis...' : aiState === 'speaking' ? 'Transmitiendo...' : 'Conectado 24/7'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className={`p-2 rounded-xl border transition-all ${
              isAudioMuted 
                ? 'border-white/10 text-slate-500 bg-surface/50' 
                : 'border-primary/40 text-primary bg-primary/10 shadow-[0_0_12px_rgba(164,230,255,0.25)]'
            }`}
            title={isAudioMuted ? "Activar audio háptico" : "Silenciar audio háptico"}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Chat Messages Flow */}
      <div ref={chatRef} className="flex-1 p-5 overflow-y-auto space-y-4 relative z-0">
        <AnimatePresence>
          {messages.map((message) => {
            const isUser = message.role === 'User';
            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 450, damping: 28 }}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-surface-container border border-primary/30 flex items-center justify-center flex-shrink-0 text-primary shadow-[0_0_10px_rgba(164,230,255,0.2)]">
                    <Brain className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[80%] rounded-2xl p-4 shadow-xl relative ${
                  isUser
                    ? 'bg-gradient-to-r from-primary/20 to-blue-600/25 border border-primary/40 text-white rounded-br-none'
                    : 'bg-surface-container/85 border border-white/10 text-slate-200 rounded-bl-none backdrop-blur-xl'
                }`}>
                  <div className="text-[11px] font-mono mb-1.5 opacity-60 flex justify-between items-center gap-4">
                    <span>{message.sender}</span>
                    <span>{message.time}</span>
                  </div>
                  <div className="text-sm leading-relaxed whitespace-pre-line">
                    {message.text}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Cognitive Trace (Razonamiento transparente durante el cálculo) */}
        {isLoading && (
          <div className="pl-11">
            <CognitiveTrace isThinking={isLoading} />
          </div>
        )}

        {/* Generative Slot Card (Calendar Picker Embebido) */}
        {showSlotPicker && (
          <div className="pl-11">
            <GenerativeSlotCard onSelectSlot={handleSlotSelected} />
          </div>
        )}

        {/* Card interactiva de Plan si se detecta mención */}
        {activePlan && PLAN_CARDS[activePlan] && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pl-11 my-2 max-w-md"
          >
            {(() => {
              const plan = PLAN_CARDS[activePlan];
              const IconComponent = plan.icon;
              return (
                <div className="p-4 rounded-2xl border border-secondary/30 bg-surface-container/90 backdrop-blur-2xl shadow-[0_10px_35px_rgba(235,178,255,0.2)]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-secondary/20 border border-secondary/40 flex items-center justify-center text-secondary">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase font-mono">{plan.name}</h4>
                        <span className="text-[10px] text-slate-400">{plan.subtitle}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-secondary font-mono">{plan.price}</div>
                      <div className="text-[9px] text-slate-400">{plan.currency}</div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 mb-3">{plan.description}</p>
                  <div className="grid grid-cols-2 gap-1.5 mb-3 text-[11px] font-mono text-slate-300">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <feat.icon className="w-3 h-3 text-primary flex-shrink-0" />
                        <span className="truncate">{feat.text}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      cyberAudio.playTap();
                      setShowSlotPicker(true);
                    }}
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-secondary to-primary hover:opacity-90 text-black font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_0_20px_rgba(235,178,255,0.4)]"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Agendar reunión para este plan
                  </button>
                </div>
              );
            })()}
          </motion.div>
        )}
      </div>

      {/* Sugerencias Rápidas Cuánticas */}
      <div className="px-5 py-2 flex items-center gap-2 overflow-x-auto border-t border-white/5 bg-surface-container/30">
        <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-primary" />
          Sugerencias:
        </span>
        {SUGGESTED_QUERIES.map((query, index) => (
          <button
            key={index}
            onClick={() => {
              cyberAudio.playTap();
              handleSendMessage(query);
            }}
            className="text-[11px] px-2.5 py-1 rounded-full border border-white/10 bg-surface/60 hover:border-primary/50 hover:bg-primary/10 text-slate-300 hover:text-white transition-all whitespace-nowrap flex-shrink-0"
          >
            {query}
          </button>
        ))}
      </div>

      {/* Input Area Cyber-Glass */}
      <div className="p-4 border-t border-white/10 bg-surface-container/70 backdrop-blur-2xl z-10">
        <div className="flex items-center gap-2 relative">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Conversa con Oliver o pregunta por automatización de leads..."
            disabled={isLoading}
            className="w-full bg-surface/90 border border-white/15 focus:border-primary focus:shadow-[0_0_20px_rgba(164,230,255,0.3)] rounded-2xl py-3 pl-4 pr-12 text-sm text-white placeholder-slate-400 focus:outline-none transition-all"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className={`absolute right-2 p-2 rounded-xl transition-all ${
              inputText.trim() && !isLoading
                ? 'bg-primary text-black shadow-[0_0_15px_rgba(164,230,255,0.6)] hover:scale-105 active:scale-95'
                : 'text-slate-500 bg-white/5 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
