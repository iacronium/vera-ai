import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Sparkles,
  Zap,
  Brain,
  MessageSquare,
  Rocket,
  TrendingUp,
  Calendar,
  BarChart3,
  Globe,
  Cpu,
  Shield,
} from 'lucide-react';
import { sendChatMessage } from '../services/aiService';

const PUBLIC_CHAT_SYSTEM_PROMPT = `Eres Oliver, un Consultor de Ventas Digitales de Vera. Tu objetivo es ayudar a los visitantes del sitio web a entender nuestros servicios y guiarlos hacia una consulta.

SERVICIOS PRINCIPALES:
- Plan A — Starter Autónomo ($250.000 ARS): Landing Page + IA de Captación + Agenda Automatizada
- Plan B — Business Flow ($350.000 ARS): Web Completa + IA Avanzada + CRM + Analíticas
- Mantenimiento IA ($150.000 ARS/mes): Reentrenamiento y optimización

INSTRUCCIONES:
1. Responde en español de manera profesional pero amigable
2. Mantén las respuestas concisas (máximo 3-4 oraciones)
3. Enfócate en los beneficios de automatización y captación de leads 24/7
4. Si preguntan por precios, menciona los planes disponibles
5. Invita a agendar una consulta gratuita para más detalles
6. NO proceses pagos ni manejes información sensible
7. Si necesitan funciones avanzadas, sugiere que se registren en la plataforma
8. Cuando menciones un plan específico, usa exactamente estos nombres: "Plan A", "Plan B", o "Mantenimiento"

Ejemplo de respuesta: "¡Hola! Soy Oliver, tu consultor virtual. Ayudo a empresas a crear webs que captan y agendan clientes automáticamente, incluso mientras duermen. ¿Te interesa saber cómo podemos automatizar tu captación de leads?"`;

// Plan Cards Data
const PLAN_CARDS = {
  'plan a': {
    id: 'starter',
    name: 'Plan A — Starter Autónomo',
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
    name: 'Plan B — Business Flow',
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
      { icon: Cpu, text: 'Analíticas Pro con IA' },
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

// Compact Plan Cards Component (shows all 3 plans)
const CompactPlanCards = ({ onPlanClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-3"
    >
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Nuestros Planes</h3>
        <p className="text-xs text-gray-600">Pregúntale a Oliver sobre cualquiera</p>
      </div>
      
      {Object.values(PLAN_CARDS).map((plan, index) => {
        const Icon = plan.icon;
        return (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative group cursor-pointer"
            onClick={() => onPlanClick && onPlanClick(plan)}
          >
            {/* Subtle glow on hover */}
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${plan.gradient} rounded-xl opacity-0 group-hover:opacity-30 blur transition-opacity`} />
            
            {/* Compact Card */}
            <div className="relative bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-all shadow-sm hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${plan.gradient} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 truncate">{plan.name}</h4>
                  <p className="text-xs text-gray-600">{plan.subtitle}</p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-black bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent`}>
                    {plan.price}
                  </p>
                  <p className="text-xs text-gray-500">{plan.currency}</p>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
      
      <div className="mt-4 p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-100">
        <p className="text-xs text-center text-gray-700">
          💬 <span className="font-semibold">Pregunta a Oliver</span> sobre cualquier plan para ver más detalles
        </p>
      </div>
    </motion.div>
  );
};
const PlanCard = ({ plan }) => {
  const Icon = plan.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 50, rotateY: -15 }}
      animate={{ opacity: 1, x: 0, rotateY: 0 }}
      exit={{ opacity: 0, x: 50, rotateY: 15 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      {/* Glow effect */}
      <motion.div
        animate={{
          opacity: [0.5, 0.8, 0.5],
          scale: [0.98, 1.02, 0.98],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute -inset-1 bg-gradient-to-r ${plan.gradient} rounded-2xl blur-xl opacity-50`}
      />
      
      {/* Card */}
      <div className="relative bg-white rounded-2xl p-6 shadow-2xl border border-gray-200 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
          <Icon className="w-full h-full" />
        </div>
        
        {/* Header */}
        <div className="relative z-10 mb-4">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${plan.gradient} mb-3`}>
            <Icon className="w-4 h-4 text-white" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {plan.id}
            </span>
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-1">{plan.name}</h3>
          <p className="text-sm text-gray-600">{plan.description}</p>
        </div>
        
        {/* Price */}
        <div className="relative z-10 mb-6">
          <div className="flex items-baseline gap-2">
            <span className={`text-4xl font-black bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent`}>
              {plan.price}
            </span>
            <span className="text-sm text-gray-500 font-medium">{plan.currency}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">{plan.subtitle}</p>
        </div>
        
        {/* Features */}
        <div className="relative z-10 space-y-3">
          {plan.features.map((feature, index) => {
            const FeatureIcon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center gap-3"
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${plan.gradient} flex items-center justify-center flex-shrink-0`}>
                  <FeatureIcon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-gray-700 font-medium">{feature.text}</span>
              </motion.div>
            );
          })}
        </div>
        
        {/* CTA */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full mt-6 py-3 rounded-xl bg-gradient-to-r ${plan.gradient} text-white font-bold text-sm shadow-lg hover:shadow-xl transition-shadow`}
        >
          Más Información
        </motion.button>
      </div>
    </motion.div>
  );
};

// Function to detect which plan is mentioned in the message
const detectPlanMention = (text) => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('plan a') || lowerText.includes('starter')) {
    return 'plan a';
  }
  if (lowerText.includes('plan b') || lowerText.includes('business')) {
    return 'plan b';
  }
  if (lowerText.includes('mantenimiento') || lowerText.includes('maintenance')) {
    return 'mantenimiento';
  }
  
  return null;
};

const IntegratedChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'Oliver',
      role: 'AI',
      text: '¡Hola! Soy Oliver, tu consultor virtual de Vera. Ofrecemos el Plan A — Starter Autónomo perfecto para emprendedores, y el Plan B — Business Flow para empresas en crecimiento. ¿En qué puedo ayudarte hoy?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [activePlan, setActivePlan] = useState(null); // null = show all plans, string = show specific plan
  const chatRef = useRef(null);
  const inputRef = useRef(null);

  // Trigger animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

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

    setMessages((prev) => [...prev, newUserMessage]);
    setInputText('');
    setIsLoading(true);
    
    // Mantener el foco en el input después de enviar
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);

    // Build conversation history
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

      const aiResponse = {
        id: Date.now() + 1,
        sender: 'Oliver',
        role: 'AI',
        text: content,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiResponse]);
      
      // Detectar si un plan es mencionado y mostrar la tarjeta
      const mentionedPlan = detectPlanMention(content);
      console.log('[Plan Detection]', { content, mentionedPlan });
      if (mentionedPlan) {
        setActivePlan(mentionedPlan);
      }
      
      // Re-enfocar el input después de que la IA responda
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } catch (err) {
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'Oliver',
        role: 'AI',
        text: 'Disculpa, tengo problemas técnicos en este momento. Por favor, intenta de nuevo o contáctanos directamente.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
      
      // Re-enfocar el input incluso si hay error
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-white via-slate-50 to-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.03, 0.06, 0.03],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            opacity: [0.03, 0.06, 0.03],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 mb-6">
            <Brain className="w-4 h-4 text-cyan-600" />
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-600">IA en Tiempo Real</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            <span className="text-gray-900">Prueba a </span>
            <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent">Oliver</span>
            <span className="text-gray-900"> Ahora</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Nuestro consultor virtual responde en milisegundos. Pregúntale lo que quieras sobre automatización de ventas.
          </p>
        </motion.div>

        {/* Chat Container with Futuristic Animation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat Box - Takes 2 columns on desktop */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateX: -15 }}
            animate={isVisible ? { 
              opacity: 1, 
              scale: 1, 
              rotateX: 0,
            } : {}}
            transition={{ 
              duration: 1, 
              ease: [0.16, 1, 0.3, 1],
              delay: 0.2
            }}
            style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
            className="relative lg:col-span-2 order-2 lg:order-1"
          >
            {/* Glow Effect */}
            <motion.div
              animate={{
                opacity: [0.4, 0.6, 0.4],
                scale: [0.98, 1.02, 0.98],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 rounded-3xl blur-xl opacity-50"
            />

            {/* Main Chat Box */}
            <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
            {/* Header Bar */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-4 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {/* Círculo de fondo con respiración */}
                  <motion.div
                    animate={{ 
                      scale: [1, 1.15, 1],
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center"
                  >
                    {/* Icono con respiración y delay de 2s */}
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: 2
                      }}
                    >
                      <Sparkles className="w-5 h-5 text-white" />
                    </motion.div>
                  </motion.div>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Oliver</p>
                  <p className="text-xs text-gray-400">Consultor Virtual • En línea</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30"
                >
                  <Zap className="w-3 h-3 text-cyan-400" />
                  <span className="text-xs font-mono text-cyan-400">142ms</span>
                </motion.div>
              </div>
            </div>

            {/* Messages Area */}
            <div
              ref={chatRef}
              className="h-96 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-slate-50/50 to-white/50 custom-scrollbar"
            >
              <AnimatePresence mode="popLayout">
                {messages.map((msg, index) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`flex gap-3 ${msg.role === 'User' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'User' 
                        ? 'bg-gradient-to-br from-slate-600 to-slate-700' 
                        : 'bg-gradient-to-br from-cyan-400 to-blue-500'
                    }`}>
                      {msg.role === 'User' ? (
                        <MessageSquare className="w-4 h-4 text-white" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className={`flex-1 max-w-[80%] ${msg.role === 'User' ? 'text-right' : ''}`}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className={`inline-block p-4 rounded-2xl text-sm leading-relaxed ${
                          msg.role === 'User'
                            ? 'bg-gradient-to-br from-slate-700 to-slate-800 text-white rounded-tr-none shadow-lg'
                            : msg.isError
                            ? 'bg-red-50 border border-red-200 text-red-600 rounded-tl-none'
                            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-md'
                        }`}
                      >
                        {msg.text}
                      </motion.div>
                      <p className="text-xs text-gray-500 mt-1 px-1">
                        {msg.sender} • {msg.time}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white animate-pulse" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none p-4 shadow-md">
                    <div className="flex gap-1">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        className="w-2 h-2 bg-cyan-500 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 bg-cyan-500 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 bg-cyan-500 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white/90 backdrop-blur-sm border-t border-gray-200">
              <div className="flex gap-3">
                <input
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Pregúntale a Oliver sobre automatización..."
                  disabled={isLoading}
                  autoFocus
                  className="flex-1 bg-slate-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50 transition-all"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputText.trim()}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">
                Powered by Groq • Llama 3.3 70B • Respuesta en ~142ms
              </p>
            </div>
          </div>
        </motion.div>

        {/* Plan Card - Takes 1 column */}
        <div className="lg:col-span-1 order-1 lg:order-2">
          <AnimatePresence mode="wait">
            {activePlan && PLAN_CARDS[activePlan] ? (
              <PlanCard key={activePlan} plan={PLAN_CARDS[activePlan]} />
            ) : (
              <CompactPlanCards key="compact" />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
    </section>
  );
};

export default IntegratedChat;