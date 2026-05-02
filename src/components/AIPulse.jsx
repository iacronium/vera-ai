import { motion } from 'framer-motion';

const AIPulse = ({ className = "" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Core */}
      <div className="w-2 h-2 bg-primary rounded-full z-10 shadow-[0_0_10px_rgba(164,230,255,0.8)]" />
      
      {/* Pulse Rings */}
      <motion.div
        className="absolute w-2 h-2 border-2 border-secondary rounded-full"
        animate={{
          scale: [1, 4],
          opacity: [1, 0],
        }}
        transition={{
          duration: 2,
          ease: [0.4, 0, 0.2, 1],
          repeat: Infinity,
        }}
      />
      <motion.div
        className="absolute w-2 h-2 border-2 border-primary rounded-full"
        animate={{
          scale: [1, 3],
          opacity: [0.8, 0],
        }}
        transition={{
          duration: 2,
          ease: [0.4, 0, 0.2, 1],
          repeat: Infinity,
          delay: 1,
        }}
      />
    </div>
  );
};

export default AIPulse;
