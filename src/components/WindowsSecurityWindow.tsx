import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../utils/audio';

interface WindowsSecurityWindowProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerAccessDenied: () => void;
  onUnlockAchievement: (id: string, name: string) => void;
}

export const WindowsSecurityWindow: React.FC<WindowsSecurityWindowProps> = ({
  isOpen,
  onClose,
  onTriggerAccessDenied,
  onUnlockAchievement,
}) => {
  const [position, setPosition] = useState({ x: 110, y: 65 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, startX: 0, startY: 0 });

  const [isDeleting, setIsDeleting] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<number | null>(null);

  // Reset progress when closed
  useEffect(() => {
    if (!isOpen) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setIsDeleting(false);
      setProgress(0);
    }
  }, [isOpen]);

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

  const handleDeleteVirus = () => {
    sounds.playKeyClick();
    setIsDeleting(true);
    setProgress(0);

    const duration = 2200;
    const intervalTime = 50;
    const steps = duration / intervalTime;
    let step = 0;

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = window.setInterval(() => {
      step++;
      const current = Math.min(100, Math.round((step / steps) * 100));
      setProgress(current);

      if (step >= steps) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setIsDeleting(false);
        sounds.playError();
        // Only unlock "Nice try tho" AFTER delete virus has finished loading!
        onUnlockAchievement('Nice try tho', 'Nice try tho');
        // Show the classic Windows Access Denied dialog
        onTriggerAccessDenied();
      }
    }, intervalTime);
  };

  const handleCancelDelete = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsDeleting(false);
    setProgress(0);
    sounds.playKeyClick();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Draggable Desktop Window like Chrome */}
      <div
        style={
          isFullscreen
            ? { left: 0, top: 0, width: '100vw', height: 'calc(100vh - 48px)', borderRadius: 0 }
            : {
                left: `${position.x}px`,
                top: `${position.y}px`,
              }
        }
        className={`absolute z-40 bg-[#0c0c0c] text-white shadow-2xl flex flex-col overflow-hidden border border-white/10 select-none font-sans transition-[width,height,border-radius] duration-150 ${
          isFullscreen
            ? 'w-screen h-[calc(100vh-48px)]'
            : 'w-[92vw] max-w-[680px] h-[520px] max-h-[85vh] rounded-xl'
        }`}
      >
        {/* Title Bar (Draggable) */}
        <div
          onMouseDown={handleMouseDown}
          className="h-10 bg-[#111111] px-4 flex items-center justify-between border-b border-white/10 shrink-0 cursor-move"
        >
          <div className="flex items-center gap-2 pointer-events-none">
            <img src="/security.png" alt="Windows Security" className="w-4 h-4 object-contain" />
            <span className="text-xs text-gray-300 font-medium">Windows Security</span>
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

        {/* Content Body - Replicating "Security at a glance" screenshot */}
        <div className="p-7 space-y-6 overflow-y-auto flex-1">
          <div>
            <h2 className="text-2xl font-light text-white tracking-tight">
              Security at a glance
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              See what&apos;s happening with the security and health of your device and take any actions needed.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Card 1: Virus & threat protection (Action Needed) */}
            <div className="bg-[#141414] hover:bg-[#181818] p-4 rounded-lg border border-red-500/40 transition-colors flex flex-col justify-between">
              <div className="space-y-3">
                <div className="relative w-9 h-9">
                  <svg className="w-9 h-9 text-[#0078d4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                    !
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white">
                    Virus & threat protection
                  </h3>
                  <p className="text-[11px] text-red-400 mt-0.5 font-bold">
                    YOU HAVE AN VIRUS
                  </p>
                  <p className="text-[10px] text-gray-400">
                    Trojan:Win32/Revenge.exe
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-2 border-t border-white/5">
                <button
                  onClick={handleDeleteVirus}
                  className="w-full py-1.5 bg-[#0067b8] hover:bg-[#0078d4] active:bg-[#005a9e] text-white text-xs font-medium rounded transition-colors cursor-pointer"
                >
                  Delete virus
                </button>
              </div>
            </div>

            {/* Card 2: Account protection */}
            <div className="bg-[#141414] p-4 rounded-lg border border-white/5 flex flex-col justify-between opacity-80">
              <div className="space-y-3">
                <div className="relative w-9 h-9">
                  <svg className="w-9 h-9 text-[#0078d4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="7" r="4" />
                    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                  </svg>
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                    ✓
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white">
                    Account protection
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    No action needed.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Firewall & network protection */}
            <div className="bg-[#141414] p-4 rounded-lg border border-white/5 flex flex-col justify-between opacity-80">
              <div className="space-y-3">
                <div className="relative w-9 h-9">
                  <svg className="w-9 h-9 text-[#0078d4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                    <line x1="12" y1="20" x2="12.01" y2="20" />
                  </svg>
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                    ✓
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-white">
                    Firewall & network protection
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    No action needed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-2.5 bg-[#111111] border-t border-white/10 flex items-center justify-between text-xs text-gray-500 shrink-0">
          <span>Windows 11 Pro 64-bit</span>
          <button
            onClick={() => {
              sounds.playKeyClick();
              onClose();
            }}
            className="px-4 py-1 bg-zinc-800 hover:bg-zinc-700 text-gray-200 text-xs rounded transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Deletion Loading Popup with Green Bar */}
      {isDeleting && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4 select-none">
          <div
            className="w-full max-w-[340px] bg-white text-[#1f1f1f] rounded-lg shadow-2xl border border-[#adadad] overflow-hidden font-sans text-sm animate-in fade-in zoom-in-95 duration-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title Bar */}
            <div className="h-8 bg-white border-b border-[#e5e5e5] px-3 flex items-center justify-between">
              <span className="text-xs font-normal text-[#1f1f1f]">Windows Security</span>
              <button
                onClick={handleCancelDelete}
                className="w-7 h-7 -mr-2 flex items-center justify-center text-gray-500 hover:bg-[#e81123] hover:text-white transition-colors text-xs cursor-pointer"
                aria-label="Cancel"
              >
                ✕
              </button>
            </div>

            {/* Dialog Body */}
            <div className="p-5 space-y-3.5 bg-white">
              <div className="flex items-center gap-3">
                <img src="/security.png" alt="Security" className="w-8 h-8 object-contain shrink-0" />
                <div>
                  <div className="text-[13px] font-medium text-black leading-snug">
                    Deleting Trojan:Win32/Revenge.exe...
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    Purging infected files and registry keys ({progress}%)
                  </div>
                </div>
              </div>

              {/* Bold Windows Green Progress Bar */}
              <div className="w-full h-5 bg-[#e6e6e6] border border-[#bcbcbc] rounded-[2px] p-[2px] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#107c10] via-[#06b025] to-[#107c10] transition-all duration-75 ease-out shadow-inner"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Dialog Footer Bar */}
            <div className="bg-[#f0f0f0] border-t border-[#dfdfdf] px-4 py-2.5 flex justify-end">
              <button
                onClick={handleCancelDelete}
                className="min-w-[76px] h-6 px-4 bg-[#e1e1e1] hover:bg-[#e5f1fb] active:bg-[#cce4f7] border border-[#adadad] hover:border-[#0078d7] text-xs font-normal text-black transition-colors rounded-[2px] flex items-center justify-center cursor-pointer shadow-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
