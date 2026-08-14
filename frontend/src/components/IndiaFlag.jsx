import React from 'react';

/**
 * AshokaChakra component
 * Precisely rendered Ashoka Chakra with central circle, outer rim, and 24 symmetrical spokes.
 */
export const AshokaChakra = ({ size = 24, className = '', spin = true, color = '#000080' }) => {
  const radius = 10;
  const cx = 12;
  const cy = 12;
  const spokes = Array.from({ length: 24 }, (_, i) => {
    const angle = (i * 360) / 24;
    const rad = (angle * Math.PI) / 180;
    const x2 = cx + radius * Math.cos(rad);
    const y2 = cy + radius * Math.sin(rad);
    return (
      <line
        key={i}
        x1={cx}
        y1={cy}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth="0.75"
      />
    );
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={`${spin ? 'animate-chakra-slow' : ''} ${className}`}
      aria-label="Ashoka Chakra"
      role="img"
    >
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke={color} strokeWidth="1" />
      <circle cx={cx} cy={cy} r="1.8" fill={color} />
      {spokes}
    </svg>
  );
};

/**
 * IndiaFlag component
 * Official Indian National Flag with 3:2 ratio, 3 equal horizontal bands, and Ashoka Chakra.
 */
export const IndiaFlag = ({
  width = 72,
  height = 48,
  className = '',
  waving = true,
  withShadow = true,
  rounded = true
}) => {
  return (
    <div
      className={`inline-block select-none ${waving ? 'animate-flag-wave' : ''} ${className}`}
      style={{
        width,
        height,
        borderRadius: rounded ? '4px' : '0',
        overflow: 'hidden',
        boxShadow: withShadow ? '0 2px 8px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)' : 'none',
        border: '1px solid rgba(0,0,0,0.08)',
        display: 'inline-flex',
        flexDirection: 'column'
      }}
      aria-label="National Flag of India"
      role="img"
    >
      {/* Saffron Band */}
      <div style={{ flex: 1, backgroundColor: '#FF9933' }} />
      
      {/* White Band with Ashoka Chakra */}
      <div
        style={{
          flex: 1,
          backgroundColor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}
      >
        <AshokaChakra size={Math.round(height * 0.28)} spin={waving} />
      </div>
      
      {/* India Green Band */}
      <div style={{ flex: 1, backgroundColor: '#138808' }} />
    </div>
  );
};

export default IndiaFlag;
