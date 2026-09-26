import React from 'react';
import { sounds } from '../utils/audio';

interface AccessDeniedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export const AccessDeniedModal: React.FC<AccessDeniedModalProps> = ({
  isOpen,
  onClose,
  title = 'Access denied',
  message = 'Access is denied',
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[320px] bg-white text-[#1f1f1f] rounded-lg shadow-2xl border border-[#adadad] overflow-hidden font-sans text-sm animate-in fade-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title bar */}
        <div className="h-8 bg-white border-b border-[#e5e5e5] px-3 flex items-center justify-between">
          <span className="text-xs font-normal text-[#1f1f1f]">{title}</span>
          <button
            onClick={() => {
              sounds.playKeyClick();
              onClose();
            }}
            className="w-7 h-7 -mr-2 flex items-center justify-center text-gray-500 hover:bg-[#e81123] hover:text-white transition-colors text-xs"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Dialog Body */}
        <div className="p-5 flex items-center gap-4 bg-white">
          {/* Classic Windows Glossy Red Error Icon with White X */}
          <div className="relative shrink-0 w-10 h-10 rounded-full bg-gradient-to-b from-[#e63946] via-[#c1121f] to-[#780000] border-2 border-[#b70916] shadow-md flex items-center justify-center">
            {/* Gloss highlight */}
            <div className="absolute top-1 left-2 w-5 h-2.5 bg-white/40 rounded-full blur-[0.6px] -rotate-12 pointer-events-none" />
            <svg
              className="w-5 h-5 text-white drop-shadow-sm"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>

          {/* Message Text */}
          <div className="text-[13px] font-normal text-black leading-snug">
            {message}
          </div>
        </div>

        {/* Dialog Footer Bar */}
        <div className="bg-[#f0f0f0] border-t border-[#dfdfdf] px-4 py-2.5 flex justify-end">
          <button
            onClick={() => {
              sounds.playKeyClick();
              onClose();
            }}
            autoFocus
            className="min-w-[76px] h-6 px-4 bg-[#e1e1e1] hover:bg-[#e5f1fb] active:bg-[#cce4f7] border border-[#adadad] hover:border-[#0078d7] text-xs font-normal text-black transition-colors rounded-[2px] flex items-center justify-center focus:outline-dashed focus:outline-1 focus:outline-black focus:-outline-offset-3 cursor-pointer shadow-xs"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
