import React, { useEffect, useRef } from 'react';

interface AchievementToastProps {
  name: string | null;
  onDismiss: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({ name, onDismiss }) => {
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (name) {
      const timer = setTimeout(() => {
        onDismissRef.current();
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [name]);

  if (!name) return null;

  return (
    <div className="fixed top-5 left-5 z-50 animate-bounce duration-500 font-terminal select-none">
      <div className="bg-zinc-900 border-2 border-emerald-500 text-white px-5 py-3 rounded-md shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping shrink-0" />
        <div>
          <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest font-mono">
            Achievement Unlocked
          </div>
          <div className="text-sm font-bold text-white font-mono mt-0.5">
            {name}
          </div>
          <div className="text-[11px] text-gray-300 font-mono mt-1">
            Press achievements to see all the achievements
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="ml-3 text-zinc-500 hover:text-zinc-300 text-xs cursor-pointer"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
