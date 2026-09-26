import React, { useState, useRef, useEffect } from 'react';
import { sounds } from '../utils/audio';

interface ReadmeWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReadmeWindow: React.FC<ReadmeWindowProps> = ({ isOpen, onClose }) => {
  const [position, setPosition] = useState({ x: 120, y: 70 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, startX: 0, startY: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.window-control-btn')) return;
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
      if (!isDragging) return;
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
  }, [isDragging]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      className="absolute w-[90vw] max-w-[650px] h-[520px] max-h-[80vh] bg-black text-gray-200 rounded-lg shadow-2xl flex flex-col overflow-hidden border border-gray-700/80 z-40 select-none font-terminal"
    >
      {/* Window Header */}
      <div
        onMouseDown={handleMouseDown}
        className="bg-[#18181b] px-3 py-2 flex items-center justify-between cursor-move border-b border-gray-800"
      >
        <div className="flex items-center gap-2">
          <span className="text-red-500 font-bold text-xs">●</span>
          <span className="text-xs font-mono font-medium text-gray-300">
            README.md — N3verF0rg3t / Revenge.exe
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sounds.playKeyClick();
              onClose();
            }}
            className="window-control-btn w-6 h-6 flex items-center justify-center hover:bg-red-900/60 rounded text-gray-400 hover:text-white text-xs transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {/* README Content (Black background) */}
      <div className="flex-1 bg-[#09090b] p-5 overflow-y-auto text-xs sm:text-sm leading-relaxed text-gray-300 select-text font-mono space-y-4">
        <div>
          <h1 className="text-lg font-bold text-red-500 tracking-wider">REVENGE.EXE</h1>
          <div className="text-gray-600">——————————————————————————————————————</div>
          <p className="mt-2 text-gray-300">
            Revenge.exe is an extremely dangerous computer virus that can delete files, lock your computer, leak information online, and change passwords or data. Credit to DesertEagle for being an original.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-bold text-amber-400 flex items-center gap-1">
            DOWNLOAD 📁
          </h2>
          <div className="text-gray-600">——————————————————————————————————————</div>
          <p className="mt-2 text-gray-300">
            Press “download ZIP” to download the virus. Open at your own risk. Opening the index file will immediately run the virus. This virus can also infect other computers in the area so be careful with it. Deleting from files will not actually delete the virus. Press the “delete” file and it will open a popup asking if you want to delete. Press “Confirm” to delete.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-bold text-amber-400 flex items-center gap-1">
            ATTACKING ⚔️
          </h2>
          <div className="text-gray-600">——————————————————————————————————————</div>
          <ul className="list-disc list-inside mt-2 space-y-1 text-gray-300">
            <li>Don’t use gmail, it will scan for viruses and phishing</li>
            <li>Use an USB which will instantly download and run the virus</li>
            <li>Don’t use URLs or Web hosts; it will immediately run the virus on your computer.</li>
            <li>Use an anonymous way to send the virus or a different account</li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-bold text-amber-400 flex items-center gap-1">
            DELETING 🗑️
          </h2>
          <div className="text-gray-600">——————————————————————————————————————</div>
          <p className="mt-2 text-gray-300">
            To delete the virus in case of emergency or if you accidentally use it on yourself run this command in the terminal screen it takes you to.
          </p>
          <div className="mt-2 p-2.5 bg-black border border-red-900/60 rounded text-red-400 font-bold select-all">
            $execute&#123;command=&quot;011001&quot;&#125;
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-amber-400 flex items-center gap-1">
            COMMANDS ⚙️
          </h2>
          <div className="text-gray-600">——————————————————————————————————————</div>
          <p className="mt-2 text-gray-300">
            Type in <code className="text-red-400">$execute&#123;command=&quot;(command number)&quot;&#125;</code> to fire a certain command into the virus when you have it.
          </p>
          <div className="mt-2 space-y-2 text-gray-300 font-mono">
            <div><span className="text-cyan-400 font-bold">111000</span> - Changes the skull color to blue</div>
            <div><span className="text-red-400 font-bold">100111</span> - Changes the skull color to red</div>
            <div><span className="text-yellow-400 font-bold">000001</span> - Opens the admin console</div>
            <div><span className="text-green-400 font-bold">110100</span> - Opens the readme</div>
          </div>
        </div>

        <div>
          <div className="text-gray-600">——————————————————————————————————————</div>
          <p className="text-[11px] text-gray-500 uppercase font-semibold">
            DISCLAIMER: WE ARE NOT RESPONSIBLE FOR ANY LEGAL TROUBLE YOU GET IN USING THIS VIRUS
          </p>
        </div>
      </div>
    </div>
  );
};
