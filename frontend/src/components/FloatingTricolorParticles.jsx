import React from 'react';

/**
 * FloatingTricolorParticles component
 * Lightweight ambient visual effect with floating saffron and green particles.
 * Purely decorative, zero interference with click/touch events.
 */
export const FloatingTricolorParticles = ({ count = 12 }) => {
  const particles = Array.from({ length: count }, (_, i) => {
    const isSaffron = i % 3 === 0;
    const isGreen = i % 3 === 1;
    const color = isSaffron ? '#FF9933' : isGreen ? '#138808' : '#D1C4AF';
    const size = 3 + (i % 4) * 2;
    const left = `${(i * 97) % 95 + 2}%`;
    const top = `${(i * 73) % 90 + 5}%`;
    const duration = 6 + (i % 5) * 2;
    const delay = (i % 4) * 1.5;

    return (
      <div
        key={i}
        className="absolute rounded-full pointer-events-none"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: color,
          left,
          top,
          opacity: isSaffron || isGreen ? 0.35 : 0.2,
          filter: 'blur(0.5px)',
          animation: `float-slow ${duration}s ease-in-out ${delay}s infinite alternate`
        }}
      />
    );
  });

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden select-none"
      aria-hidden="true"
    >
      {particles}
    </div>
  );
};

export default FloatingTricolorParticles;
