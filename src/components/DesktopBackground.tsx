import React from 'react';

interface DesktopBackgroundProps {
  showIcons?: boolean;
}

export const DesktopBackground: React.FC<DesktopBackgroundProps> = () => {
  return (
    <div className="absolute inset-0 overflow-hidden bg-black select-none pointer-events-none">
      <img
        src="/windows11.png"
        alt="Windows 11 Desktop"
        className="w-full h-full object-cover object-center block"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = '/Screenshot%202026-09-24%20165320.png';
        }}
      />
    </div>
  );
};
