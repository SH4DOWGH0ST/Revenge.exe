import React, { useEffect, useState } from 'react';

interface WindowTerminalGlitchOverlayProps {
  phase: 'icu' | 'hateme' | 'idle';
  inWindow?: boolean;
}

export const WindowTerminalGlitchOverlay: React.FC<WindowTerminalGlitchOverlayProps> = ({
  phase,
  inWindow = false,
}) => {
  const [matrixText, setMatrixText] = useState<string[]>([]);

  useEffect(() => {
    if (phase === 'idle') return;

    const lines = [
      '> OVERRIDE_SIGNAL: INCOMING INTERCEPT FROM UNKNOWN HOST',
      '> TRACE_ROUTE: RANDOMIZED_IP_PROXY (PACKET_ROTATION_ACTIVE)',
      '> MEMORY_DUMP: 0x911_REVENGE_CORE_INJECT',
      '> WARNING: DESKTOP_CONTROLS_SUSPENDED',
      '> PROTOCOL_STATUS: CORRUPTING WINDOW VIRTUAL DISPLAY...',
      '> [N3VERF0RG3T_INTERCEPT_ESTABLISHED]',
    ];

    setMatrixText(lines);

    const interval = setInterval(() => {
      const hex = Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .padStart(6, '0')
        .toUpperCase();
      const randomLine = `> TRACE_PACKET [${hex}] => PAYLOAD: N3VERF0RG3T_OVERRIDE_${Math.floor(Math.random() * 9999)}`;
      setMatrixText((prev) => [...prev.slice(-6), randomLine]);
    }, 180);

    return () => clearInterval(interval);
  }, [phase]);

  if (phase === 'idle') return null;

  return (
    <div
      className={`absolute inset-0 z-50 bg-black/95 flex flex-col overflow-hidden font-mono select-none pointer-events-none animate-glitch ${
        inWindow ? 'rounded-b-lg' : 'fixed inset-0'
      }`}
    >
      {/* Sinister CRT scanlines & vignette */}
      <div className="absolute inset-0 scanlines-overlay opacity-80 pointer-events-none" />
      <div className="absolute inset-0 bg-radial from-transparent via-black/40 to-black/90 pointer-events-none" />

      {/* Terminal Titlebar Frame */}
      <div className="relative z-20 px-4 py-2 bg-[#090d16] border-b border-red-900/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-red-500 font-bold tracking-wider">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping inline-block" />
          <span>TERMINAL_OVERRIDE // REVENGE.EXE</span>
        </div>

        {/* TOP RIGHT TEXT REQUIREMENT:
            Phase 1: "I C U"
            Phase 2: "DO U HATEME" (no space between HATE and ME)
        */}
        <div className="flex items-center gap-2 pr-2">
          {phase === 'icu' ? (
            <div className="text-emerald-400 font-black tracking-widest text-base sm:text-lg font-mono drop-shadow-[0_0_12px_rgba(52,211,153,1)] animate-pulse bg-emerald-950/80 px-3 py-0.5 rounded border border-emerald-500/70">
              I C U
            </div>
          ) : (
            <div className="text-red-500 font-black tracking-widest text-base sm:text-lg font-mono drop-shadow-[0_0_15px_rgba(239,68,68,1)] animate-bounce bg-red-950/90 px-3 py-0.5 rounded border border-red-500">
              DO U HATEME
            </div>
          )}
        </div>
      </div>

      {/* Terminal Matrix & Log Stream Body */}
      <div className="relative z-10 flex-1 p-4 sm:p-6 flex flex-col justify-between overflow-hidden">
        {/* Sinister ASCII & Code Lines */}
        <div className="space-y-1.5 text-xs sm:text-sm">
          <div className="text-red-600 font-bold tracking-widest text-sm mb-2">
            ################# SYSTEM HIJACKED #################
          </div>
          {matrixText.map((line, idx) => (
            <div
              key={idx}
              className={`${
                idx % 2 === 0 ? 'text-emerald-500' : 'text-red-400'
              } font-mono truncate leading-relaxed tracking-wide drop-shadow-[0_0_8px_currentColor]`}
            >
              {line}
            </div>
          ))}
        </div>

        {/* Big Glitch Message at Center */}
        <div className="my-auto text-center py-4">
          <div
            className={`text-2xl sm:text-4xl font-extrabold tracking-widest font-mono uppercase ${
              phase === 'icu'
                ? 'text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.9)]'
                : 'text-red-600 drop-shadow-[0_0_25px_rgba(220,38,38,1)] animate-pulse'
            }`}
          >
            {phase === 'icu' ? '>>> I C U <<<' : '>>> DO U HATEME <<<'}
          </div>
          <div className="text-[11px] text-gray-400 font-mono mt-2 tracking-wider">
            N3VERF0RG3T KERNEL HOOK ACTIVE — HOST PARALYZED
          </div>
        </div>

        {/* Bottom blinking cursor & status */}
        <div className="flex items-center justify-between text-[11px] text-gray-500 font-mono border-t border-red-950/60 pt-2">
          <div className="flex items-center gap-2">
            <span className="text-red-500 font-bold">&gt;</span>
            <span className="text-gray-300">DISPERSION_CYCLE_EXEC</span>
            <span className="inline-block w-2 h-3.5 bg-red-500 animate-pulse" />
          </div>
          <div className="text-red-400 font-bold">
            {phase === 'icu' ? 'SIGNAL: I C U' : 'SIGNAL: DO U HATEME'}
          </div>
        </div>
      </div>
    </div>
  );
};
