import React, { useState, useRef, useEffect } from 'react';
import { sounds } from '../utils/audio';

interface CopilotWindowProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlockAchievement: (id: string, name: string) => void;
}

export const CopilotWindow: React.FC<CopilotWindowProps> = ({
  isOpen,
  onClose,
  onUnlockAchievement,
}) => {
  const [position, setPosition] = useState({ x: 80, y: 50 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, startX: 0, startY: 0 });

  const hasUnlockedRef = useRef(false);

  useEffect(() => {
    if (isOpen && !hasUnlockedRef.current) {
      hasUnlockedRef.current = true;
      onUnlockAchievement('Time to ask copliot', 'Time to ask copliot');
    }
  }, [isOpen, onUnlockAchievement]);

  // Window dragging handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isFullscreen) return;
    if (
      (e.target as HTMLElement).closest('.window-control-btn') ||
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).closest('input')
    ) {
      return;
    }
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: position.x,
      startY: position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || isFullscreen) return;
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;
      setPosition({
        x: Math.max(10, Math.min(window.innerWidth - 300, dragStartRef.current.startX + dx)),
        y: Math.max(10, Math.min(window.innerHeight - 150, dragStartRef.current.startY + dy)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isFullscreen]);

  if (!isOpen) return null;

  return (
    <div
      style={
        isFullscreen
          ? { left: 0, top: 0, width: '100vw', height: 'calc(100vh - 48px)', borderRadius: 0 }
          : {
              left: `${position.x}px`,
              top: `${position.y}px`,
            }
      }
      className={`absolute z-40 bg-[#1c1c20] text-gray-200 shadow-2xl flex flex-col overflow-hidden border border-white/10 select-none font-sans transition-[width,height,border-radius] duration-150 ${
        isFullscreen
          ? 'w-screen h-[calc(100vh-48px)]'
          : 'w-[90vw] max-w-[560px] h-[480px] max-h-[85vh] rounded-xl'
      }`}
    >
      {/* Title Bar (Draggable) */}
      <div
        onMouseDown={handleMouseDown}
        className="h-10 bg-[#141418] px-4 flex items-center justify-between border-b border-white/10 shrink-0 cursor-move"
      >
        <div className="flex items-center gap-2 pointer-events-none">
          <img src="/copilot.png" alt="Copilot" className="w-5 h-5 object-contain" />
          <span className="text-xs font-semibold text-white">Microsoft Copilot</span>
        </div>

        {/* Window Controls: Minimize, Maximize, Close */}
        <div className="flex items-center">
          <button
            onClick={() => {
              sounds.playKeyClick();
              onClose();
            }}
            className="w-10 h-8 flex items-center justify-center hover:bg-white/10 text-gray-400 hover:text-white transition-colors text-xs window-control-btn cursor-pointer"
            title="Minimize"
          >
            —
          </button>
          <button
            onClick={() => {
              sounds.playKeyClick();
              setIsFullscreen((prev) => !prev);
            }}
            className="w-10 h-8 flex items-center justify-center hover:bg-white/10 text-gray-400 hover:text-white transition-colors text-xs window-control-btn cursor-pointer"
            title={isFullscreen ? 'Restore' : 'Maximize'}
          >
            {isFullscreen ? '❐' : '□'}
          </button>
          <button
            onClick={() => {
              sounds.playKeyClick();
              onClose();
            }}
            className="w-10 h-8 flex items-center justify-center hover:bg-[#e81123] hover:text-white text-gray-400 transition-colors text-xs window-control-btn cursor-pointer"
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Tutorial Body - Basic, No Emojis */}
      <div className="p-6 space-y-4 text-xs text-gray-300 leading-relaxed font-sans overflow-y-auto flex-1">
        <div className="border-b border-white/10 pb-3">
          <h3 className="text-base font-bold text-white mb-1">
            Tutorial: Revenge.exe
          </h3>
          <p className="text-gray-400">
            Your system is locked by Revenge.exe. Follow these steps to find a way out.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-[#141418] p-3 rounded-lg border border-white/5">
            <span className="font-bold text-white text-xs block mb-1">1. Search for clues</span>
            <p className="text-gray-400 text-xs">
              Use Google Chrome on your taskbar to research the author of the virus and understand what happened.
            </p>
          </div>

          <div className="bg-[#141418] p-3 rounded-lg border border-white/5">
            <span className="font-bold text-white text-xs block mb-1">2. Terminal syntax</span>
            <p className="text-gray-400 text-xs mb-1.5">
              Commands must be entered into the terminal using this exact format:
            </p>
            <div className="bg-black/80 p-2.5 rounded border border-white/10 font-mono text-cyan-300 text-xs">
              $execute&#123;command=&quot;code&quot;&#125;
            </div>
          </div>

          <div className="bg-[#141418] p-3 rounded-lg border border-white/5">
            <span className="font-bold text-white text-xs block mb-1">3. Find the override</span>
            <p className="text-gray-400 text-xs">
              Look for secret codes and the override keyword hidden across the system and web articles.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="px-5 py-2.5 bg-[#141418] border-t border-white/10 flex items-center justify-between text-xs text-gray-400 shrink-0">
        <span>Ready</span>
        <button
          onClick={() => {
            sounds.playKeyClick();
            onClose();
          }}
          className="px-3.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded transition-colors cursor-pointer"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
