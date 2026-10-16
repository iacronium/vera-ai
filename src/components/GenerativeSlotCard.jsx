import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Check, Sparkles, ArrowRight } from 'lucide-react';
import { cyberAudio } from '../services/cyberAudio';

const AVAILABLE_SLOTS = [
  { id: 'slot-1', date: 'Mañana', time: '11:00 hs', tz: 'ART' },
  { id: 'slot-2', date: 'Mañana', time: '15:30 hs', tz: 'ART' },
  { id: 'slot-3', date: 'Pasado mañana', time: '17:00 hs', tz: 'ART' },
];

export default function GenerativeSlotCard({ onSelectSlot }) {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleSelect = (slot) => {
    setSelectedSlot(slot.id);
    cyberAudio.playTap();
  };

  const handleConfirm = (slot) => {
    setIsConfirmed(true);
    cyberAudio.playSuccessArpeggio();
    if (onSelectSlot) {
      onSelectSlot(slot);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="p-4 my-3 rounded-2xl border border-primary/30 bg-surface-container/80 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] max-w-md"
    >
      <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white tracking-wide uppercase font-mono">
              Agenda Sincronizada // Google Calendar
            </h4>
            <p className="text-[11px] text-slate-400">Slots prioritarios con Oliver</p>
          </div>
        </div>
        <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          DISPONIBLE
        </span>
      </div>

      {!isConfirmed ? (
        <div className="space-y-2">
          <p className="text-xs text-slate-300">
            Selecciona un horario conveniente para tu sesión de consultoría técnica y automatización:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            {AVAILABLE_SLOTS.map((slot) => {
              const isSelected = selectedSlot === slot.id;
              return (
                <button
                  key={slot.id}
                  onClick={() => handleSelect(slot)}
                  className={`p-2 rounded-xl text-left border transition-all text-xs font-mono relative overflow-hidden ${
                    isSelected
                      ? 'border-primary bg-primary/20 text-white shadow-[0_0_15px_rgba(164,230,255,0.4)]'
                      : 'border-white/10 bg-surface/50 text-slate-300 hover:border-primary/40 hover:bg-surface/80'
                  }`}
                >
                  <div className="text-[10px] text-slate-400">{slot.date}</div>
                  <div className="font-semibold text-primary">{slot.time}</div>
                </button>
              );
            })}
          </div>

          {selectedSlot && (
            <motion.button
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => {
                const slot = AVAILABLE_SLOTS.find((s) => s.id === selectedSlot);
                if (slot) handleConfirm(slot);
              }}
              className="w-full mt-2 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_0_20px_rgba(164,230,255,0.5)]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Confirmar Reserva Inmediata
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </motion.button>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div>
            <div className="font-semibold text-white">¡Slot bloqueado exitosamente!</div>
            <div className="text-[11px] text-slate-300">
              Notificación enviada al servidor de calendario. Recibirás el enlace de Meet en tu correo.
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}\n