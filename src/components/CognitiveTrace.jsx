import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Sparkles, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

const COGNITIVE_PHASES = [
  { text: "Decodificando vector semántico del usuario...", latency: "42ms" },
  { text: "Consultando parámetros del embudo y catálogo de planes Vera...", latency: "95ms" },
  { text: "Optimizando oferta personalizada y disponibilidad horaria...", latency: "160ms" },
  { text: "Sintetizando flujo de respuesta con Llama 3.3 Versatile...", latency: "215ms" },
];

export default function CognitiveTrace({
  isThinking = true,
  tokensPerSec = 82.5,
  latencyMs = 215,
  className = ''
}) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isThinking) {
      setCurrentStep(0);
      return;
    }
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < COGNITIVE_PHASES.length - 1 ? prev + 1 : prev));
    }, 420);
    return () => clearInterval(interval);
  }, [isThinking]);

  if (!isThinking) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={`p-3.5 mb-3 rounded-2xl border border-primary/25 bg-surface-container/70 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.6)] ${className}`}
    >
      {/* Barra de telemetría cuántica */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5 text-[11px] font-mono tracking-wider text-slate-400">
        <span className="flex items-center gap-1.5 text-primary font-medium">
          <Cpu className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
          <span>VERA_SYNAPSE_CORE // LATENCIA:</span>
          <span className="text-white">{latencyMs}ms</span>
        </span>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] bg-secondary/20 text-secondary border border-secondary/30">
            <Zap className="w-2.5 h-2.5 mr-1" />
            {tokensPerSec} t/s
          </span>
        </div>
      </div>

      {/* Traza de micro-razonamiento paso a paso */}
      <div className="space-y-1.5 font-mono text-[12px]">
        {COGNITIVE_PHASES.slice(0, currentStep + 1).map((phase, idx) => {
          const isLatest = idx === currentStep;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex items-center justify-between gap-2 ${
                isLatest ? 'text-white font-medium' : 'text-slate-400 opacity-80'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                {isLatest ? (
                  <Sparkles className="w-3.5 h-3.5 text-secondary animate-pulse flex-shrink-0" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                )}
                <span className="truncate">{phase.text}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">
                {phase.latency}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}\n