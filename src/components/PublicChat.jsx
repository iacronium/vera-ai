import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Sparkles,
  MessageCircle,
  X,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import AIPulse from './AIPulse';
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

Ejemplo de respuesta: "¡Hola! Soy Oliver, tu consultor virtual. Ayudo a empresas a crear webs que captan y agendan clientes automáticamente, incluso mientras duermen. ¿Te interesa saber cómo podemos automatizar tu captación de leads?"`;

const PublicChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'Oliver',
      role: 'AI',
      text: '¡Hola! Soy Oliver, tu consultor virtual de Vera. ¿En qué puedo ayudarte hoy? Puedo contarte sobre nuestros servicios de webs autónomas que captan clientes 24/7.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef(null);

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
        // No token needed for public chat - backend should handle this
      });

      const aiResponse = {
        id: Date.now() + 1,
        sender: 'Oliver',
        role: 'AI',
        text: content,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiResponse]);
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

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-primary to-primary-container text-on-primary-fixed rounded-full shadow-2xl flex items-center justify-center group"
      >
        <MessageCircle className="w-7 h-7" />
        <div className="absolute -top-2 -right-2">
          <AIPulse className="w-4 h-4" />
        </div>
        
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-surface-container-highest text-on-surface text-sm rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Chatea con Oliver
        </div>
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: 0,
        height: isMinimized ? '60px' : '500px',
        width: isMinimized ? '300px' : '400px'
      }}
      className="fixed bottom-6 right-6 z-50 bg-surface border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="h-15 bg-surface-container-low border-b border-white/5 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <AIPulse className="absolute -bottom-1 -right-1 w-3 h-3" />
          </div>
          <div>
            <p className="text-sm font-bold">Oliver</p>
            <p className="text-xs text-on-surface-variant">Consultor Virtual</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 rounded-lg hover:bg-white/5 text-on-surface-variant"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-white/5 text-on-surface-variant"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div
            ref={chatRef}
            className="h-80 overflow-y-auto p-4 space-y-4 custom-scrollbar"
          >
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === 'User' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'User' 
                      ? 'bg-surface-container-high' 
                      : 'bg-primary/20'
                  }`}>
                    {msg.role === 'User' ? (
                      <div className="w-4 h-4 bg-secondary rounded-full" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div className={`flex-1 ${msg.role === 'User' ? 'text-right' : ''}`}>
                    <div className={`inline-block p-3 rounded-2xl max-w-[85%] text-sm ${
                      msg.role === 'User'
                        ? 'bg-surface-container-high rounded-tr-none'
                        : msg.isError
                        ? 'bg-error/10 border border-error/20 text-error rounded-tl-none'
                        : 'bg-surface-container-highest rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                    <p className="text-xs text-on-surface-variant/60 mt-1 px-1">
                      {msg.sender} • {msg.time}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                </div>
                <div className="flex items-center space-x-1 py-3">
                  <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                  <div className="w-2 h-2 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </motion.div>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/5">
            <div className="flex gap-2">
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu mensaje..."
                disabled={isLoading}
                className="flex-1 bg-surface-container-highest border border-white/5 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/40 disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputText.trim()}
                className="bg-gradient-to-br from-primary to-primary-container text-on-primary-fixed w-10 h-10 rounded-xl flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default PublicChat;