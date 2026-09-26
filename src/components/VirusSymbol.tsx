import React from 'react';

interface VirusSymbolProps {
  size?: number;
  color?: 'red' | 'blue' | string;
  className?: string;
  animate?: boolean;
}

export const VirusSymbol: React.FC<VirusSymbolProps> = ({
  size = 28,
  color = 'red',
  className = '',
  animate = true,
}) => {
  const isBlue = color === 'blue' || color === '#00f0ff' || color === '#38bdf8';
  const mainColor = isBlue ? '#38bdf8' : '#ef4444';
  const glowColor = isBlue ? 'rgba(56, 189, 248, 0.75)' : 'rgba(239, 68, 68, 0.75)';
  const darkFill = isBlue ? '#041d2d' : '#230505';

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 ${animate ? 'animate-pulse' : ''} ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        filter: `drop-shadow(0 0 ${Math.max(3, Math.round(size * 0.15))}px ${glowColor})`,
      }}
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <radialGradient id={`virusGlow-${isBlue ? 'b' : 'r'}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={mainColor} stopOpacity="0.4" />
            <stop offset="100%" stopColor={darkFill} stopOpacity="0.9" />
          </radialGradient>
        </defs>

        {/* Outer Hex Shield Frame */}
        <polygon
          points="24,2 44,11 44,37 24,46 4,37 4,11"
          fill={`url(#virusGlow-${isBlue ? 'b' : 'r'})`}
          stroke={mainColor}
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Inner Hazard Triangles / Teeth */}
        <path
          d="M24 6L28 14H20L24 6Z"
          fill={mainColor}
          opacity="0.9"
        />
        <path
          d="M7 16L15 19L11 26L7 16Z"
          fill={mainColor}
          opacity="0.8"
        />
        <path
          d="M41 16L37 26L33 19L41 16Z"
          fill={mainColor}
          opacity="0.8"
        />

        {/* Stylized Cyber Skull Face */}
        <path
          d="M14 20C14 15 18 13 24 13C30 13 34 15 34 20C34 24 32 27 30 28V33H18V28C16 27 14 24 14 20Z"
          fill={darkFill}
          stroke={mainColor}
          strokeWidth="1.6"
        />

        {/* Slit Cyber Eyes */}
        <polygon points="17,21 22,23 21,25 16,23" fill={mainColor} />
        <polygon points="31,21 32,23 27,25 26,23" fill={mainColor} />

        {/* Nasal Inverted Triangle */}
        <polygon points="24,26 22,29 26,29" fill={mainColor} />

        {/* Teeth Grid */}
        <rect x="19" y="34" width="2" height="4" fill={mainColor} />
        <rect x="23" y="34" width="2" height="4" fill={mainColor} />
        <rect x="27" y="34" width="2" height="4" fill={mainColor} />

        {/* Biohazard Circuit Lines */}
        <line x1="24" y1="38" x2="24" y2="43" stroke={mainColor} strokeWidth="1.5" />
        <circle cx="24" cy="43" r="1.5" fill={mainColor} />
        <line x1="12" y1="32" x2="6" y2="35" stroke={mainColor} strokeWidth="1.2" />
        <line x1="36" y1="32" x2="42" y2="35" stroke={mainColor} strokeWidth="1.2" />
      </svg>
    </div>
  );
};
