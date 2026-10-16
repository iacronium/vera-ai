import { useState, useEffect } from 'react';

const GLYPHS = '01アイウエオカキクケコサシスセソタチツテトナニヌネハヒフヘホマミムメモヤユヨラリルレロワヰヱヲン#@%&*+=<>~';

/**
 * useTextScramble
 * Efecto de decodificación cuántica de caracteres (resolución de entropía).
 */
export function useTextScramble(targetText, speed = 18, enabled = true) {
  const [displayText, setDisplayText] = useState(targetText || '');

  useEffect(() => {
    if (!enabled || !targetText) {
      setDisplayText(targetText || '');
      return;
    }

    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(() =>
        targetText
          .split('')
          .map((char, index) => {
            if (char === ' ' || char === '\n') return char;
            if (index < iteration) return targetText[index];
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join('')
      );

      if (iteration >= targetText.length) {
        clearInterval(interval);
      }
      iteration += 1;
    }, speed);

    return () => clearInterval(interval);
  }, [targetText, speed, enabled]);

  return displayText;
}
