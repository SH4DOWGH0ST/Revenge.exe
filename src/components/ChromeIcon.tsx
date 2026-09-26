import React, { useState } from 'react';

interface ChromeIconProps {
  className?: string;
  size?: number;
}

export const ChromeIcon: React.FC<ChromeIconProps> = ({ className = '', size = 48 }) => {
  const [hasError, setHasError] = useState(false);

  if (!hasError) {
    return (
      <img
        src="/chrome.png"
        alt="Google Chrome"
        width={size}
        height={size}
        onError={() => setHasError(true)}
        className={`drop-shadow-lg transition-transform hover:scale-105 active:scale-95 object-contain select-none ${className}`}
      />
    );
  }

  // Pure fallback if image failed to load
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`drop-shadow-lg transition-transform hover:scale-105 active:scale-95 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="48" fill="#4285F4" />
      <circle cx="50" cy="50" r="23" fill="#ffffff" />
      <circle cx="50" cy="50" r="18" fill="#1A73E8" />
    </svg>
  );
};
