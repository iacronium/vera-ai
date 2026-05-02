import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Sparkles,
  AlertCircle,
  Settings,
  FileText,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { sendSandboxMessage } from '../services/aiService';
import { useAIPreferences, useSession } from '../store/useAppStore';

const Sandbox = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'Llama 3',
      role: 'AI',
      text: '¡Hola! Soy tu asistente de documentos. Para comenzar, necesitas subir un PDF en la sección de Configuración > Gestión de Documentos. Una vez que hayas subido un documento, podrás hacerme preguntas sobre su contenido.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasDocument, setHasDocument] = useState(false); // TODO: Connect to actual document state

  const chatRef = useRef(null);
  const session = useSession();
  const { groqKey, sandboxModel, temperature, maxTokens } = useAIPreferences();

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    if (!hasDocument) {
      // Show warning that document is needed
      const warningMsg = {
        id: Date.now(),
        sender: 'Sistema',
        role: 'AI',
        text: 'Necesitas subir un documento PDF primero. Ve a Configuración > Gestión de Documentos para subir tu archivo.',
        isError: true,
      };
      setMessages((prev) => [...prev, warningMsg]);
      return;
    }

    const userMsg = {
      id: Date.now(),
      sender: 'Tú',
      text: inputText.trim(),
      role: 'User',
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentInput = inputText.trim();
    setInputText('');
    setIsLoading(true);

    // Build conversation history
    const history = [...messages, userMsg]
      .filter((m) => !m.isError)
      .map((m) => ({
        role: m.role === 'User' ? 'user' : 'assistant',
        content: m.text,
      }));

    try {
      const { content } = await sendSandboxMessage({
        messages: history,
        context: 'TODO: Get document content from settings', // TODO: Connect to actual document
        model: sandboxModel || 'llama-3.3-70b-versatile',
        temperature: temperature ?? 0.7,
        maxTokens: maxTokens ?? 1024,
        token: session?.token,
        apiKey: groqKey,
      });

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'Llama 3',
        text: content,
        role: 'AI',
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'Llama 3',
        text: err.message || 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.',
        role: 'AI',
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-[calc(100vh-80px)] overflow-hidden bg-surface">
      <div className="h-full flex flex-col p-8">
        
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight mb-2">Chat con Documentos</h1>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Haz preguntas sobre tus documentos PDF usando IA avanzada.
              </p>
            </div>
            <Link
              to="/settings"
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/20 text-primary hover:bg-primary/5 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Configurar Documentos
            </Link>
          </div>
        </header>

        {/* Document Status */}
        {!hasDocument && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-500">No hay documentos cargados</p>
              <p className="text-xs text-amber-500/80">
                Ve a <Link to="/settings" className="underline">Configuración > Gestión de Documentos</Link> para subir un PDF.
              </p>
            </div>
          </div>
        )}

        {hasDocument && (
          <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-3">
            <FileText className="w-5 h-5 text-primary flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-primary">Documento cargado</p>
              <p className="text-xs text-primary/80">
                Puedes hacer preguntas sobre el contenido de tu documento.
              </p>
            </div>
          </div>
        )}

        {/* Chat Interface */}
        <main className="flex-1 flex flex-col glass-card rounded-2xl border border-white/10 overflow-hidden">
          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
            ref={chatRef}
          >
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: msg.role === 'User' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex gap-4 ${msg.role === 'User' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'AI' && (
                    <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0 border border-white/10">
                      <Sparkles className="text-primary w-4 h-4" />
                    </div>
                  )}
                  <div className={`max-w-[85%] ${msg.role === 'User' ? 'text-right' : ''}`}>
                    <div
                      className={`p-4 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'User'
                          ? 'bg-surface-container-high rounded-tr-none'
                          : msg.isError
                          ? 'bg-error/10 border border-error/20 text-error rounded-tl-none'
                          : 'bg-surface-container-highest rounded-tl-none border border-white/5'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <p className="text-xs text-on-surface-variant/60 mt-1 px-1">
                      {msg.sender} • {msg.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-4 justify-start"
                >
                  <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0 border border-white/10">
                    <Sparkles className="text-primary w-4 h-4 animate-pulse" />
                  </div>
                  <div className="p-4 bg-surface-container-highest rounded-2xl rounded-tl-none border border-white/5">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input */}
          <footer className="p-6 border-t border-white/5">
            <div className="flex gap-3">
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={hasDocument ? "Pregunta sobre tu documento..." : "Sube un documento primero en Configuración"}
                disabled={isLoading || !hasDocument}
                className="flex-1 bg-surface-container-highest border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/40 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !inputText.trim() || !hasDocument}
                className="bg-gradient-to-br from-primary to-primary-container text-on-primary-fixed w-12 h-12 rounded-xl flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Sandbox;