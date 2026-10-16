import React from 'react';
import NeuralOrb from './NeuralOrb';

/**
 * AIPulse (Versión 2040)
 * Reemplazo retrocompatible que preserva la interfaz { className }
 * y proyecta el nuevo NeuralOrb cuántico con micro-animaciones procedurales.
 */
const AIPulse = ({ className = '', state = 'idle', size = 36 }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <NeuralOrb state={state} size={size} />
    </div>
  );
};

export default AIPulse;\n