import React from 'react';

interface GeminiAiIconProps {
  size?: number;
  className?: string;
}

/**
 * Authentic Google Gemini 4-pointed Star Sparkle Symbol
 * Pure standalone star with NO surrounding box, colored in vibrant Gemini electric blue.
 */
export const GeminiAiIcon: React.FC<GeminiAiIconProps> = ({
  size = 22,
  className = '',
}) => {
  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      aria-label="Gemini AI blue star symbol"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          {/* Vibrant Gemini Blue Gradient */}
          <linearGradient id="geminiBlueStarGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="35%" stopColor="#2563eb" />
            <stop offset="75%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>
          {/* Subtle Inner Glow Highlight */}
          <linearGradient id="geminiBlueStarCore" x1="12" y1="5" x2="12" y2="19" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#dbeafe" />
            <stop offset="50%" stopColor="#93c5fd" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>

        {/* Gemini Primary 4-pointed Star */}
        <path
          d="M12 2C12 7.52285 7.52285 12 2 12C7.52285 12 12 16.4771 12 22C12 16.4771 16.4771 12 22 12C16.4771 12 12 7.52285 12 2Z"
          fill="url(#geminiBlueStarGrad)"
        />

        {/* Inner Highlight Core for depth */}
        <path
          d="M12 5C12 8.86599 8.86599 12 5 12C8.86599 12 12 15.134 12 19C12 15.134 15.134 12 19 12C15.134 12 12 8.86599 12 5Z"
          fill="url(#geminiBlueStarCore)"
          opacity="0.8"
        />

        {/* Top-Right Secondary Sparkle in matching blue */}
        <path
          d="M19 2.5C19 3.88071 17.8807 5 16.5 5C17.8807 5 19 6.11929 19 7.5C19 6.11929 20.1193 5 21.5 5C20.1193 5 19 3.88071 19 2.5Z"
          fill="#3b82f6"
        />
      </svg>
    </div>
  );
};
