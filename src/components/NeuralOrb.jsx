import React, { useEffect, useRef } from 'react';

/**
 * NeuralOrb (2040 Biokinetic Core)
 * Renderiza una entidad cuántica procedural en Canvas 2D sin dependencias pesadas.
 * Reacciona dinámicamente al estado de la IA (idle, reasoning, listening, speaking).
 */
export default function NeuralOrb({
  state = 'idle',
  audioLevel = 0,
  size = 120,
  className = ''
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;

    const render = () => {
      time += 0.035;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Parámetros dinámicos según el estado cognitivo
      const isReasoning = state === 'reasoning';
      const isSpeaking = state === 'speaking';
      const isListening = state === 'listening';

      const speedMultiplier = isReasoning ? 3.2 : isListening ? 2.0 : isSpeaking ? 2.5 : 1.0;
      const baseRadius = (size * 0.26) + (audioLevel * 14);
      const numPoints = 48;

      // 1. Campo de energía exterior (Aura volumétrica con gradiente radial)
      const gradient = ctx.createRadialGradient(
        centerX, centerY, baseRadius * 0.2,
        centerX, centerY, size * 0.48
      );

      if (isReasoning) {
        gradient.addColorStop(0, 'rgba(235, 178, 255, 0.7)');   // Púrpura sináptico
        gradient.addColorStop(0.4, 'rgba(164, 230, 255, 0.3)'); // Cian primario
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else if (isSpeaking) {
        gradient.addColorStop(0, 'rgba(164, 230, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(235, 178, 255, 0.35)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        gradient.addColorStop(0, 'rgba(164, 230, 255, 0.5)');
        gradient.addColorStop(0.6, 'rgba(235, 178, 255, 0.15)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      }

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, size * 0.48, 0, Math.PI * 2);
      ctx.fill();

      // 2. Malla deformable biocinética (Harmonic Wave Membrane)
      ctx.beginPath();
      for (let i = 0; i <= numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        const wave1 = Math.sin(angle * 6 + time * speedMultiplier) * (isReasoning ? 7 : 4);
        const wave2 = Math.cos(angle * 4 - time * 1.8) * 3;
        const wave3 = Math.sin(angle * 2 + time * 0.8) * 2;
        const radius = baseRadius + wave1 + wave2 + wave3;

        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = isReasoning ? '#ebb2ff' : '#a4e6ff';
      ctx.lineWidth = 1.6;
      ctx.shadowBlur = isReasoning ? 18 : 12;
      ctx.shadowColor = isReasoning ? '#ebb2ff' : '#a4e6ff';
      ctx.stroke();

      // 3. Órbitas secundarias de partículas de datos (Data Synapses)
      const numParticles = isReasoning ? 12 : 6;
      for (let p = 0; p < numParticles; p++) {
        const pAngle = (time * (0.8 + p * 0.1) + (p * Math.PI * 2) / numParticles);
        const pDist = baseRadius * (1.15 + 0.25 * Math.sin(time + p));
        const px = centerX + Math.cos(pAngle) * pDist;
        const py = centerY + Math.sin(pAngle) * pDist;

        ctx.beginPath();
        ctx.arc(px, py, isReasoning ? 2.2 : 1.5, 0, Math.PI * 2);
        ctx.fillStyle = p % 2 === 0 ? '#a4e6ff' : '#ebb2ff';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#ffffff';
        ctx.fill();
      }

      // 4. Núcleo central hiperdenso (Singularity Core)
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 22;
      ctx.shadowColor = '#a4e6ff';
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [state, audioLevel, size]);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="pointer-events-none drop-shadow-[0_0_25px_rgba(164,230,255,0.45)]"
      />
    </div>
  );
}
