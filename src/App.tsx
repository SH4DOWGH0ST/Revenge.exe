import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DesktopBackground } from './components/DesktopBackground';
import { SkullMatrix } from './components/SkullMatrix';
import { ChromeIcon } from './components/ChromeIcon';
import { ChromeWindow } from './components/ChromeWindow';
import { ReadmeWindow } from './components/ReadmeWindow';
import { AchievementsModal, ALL_ACHIEVEMENTS, normalizeAchievementId } from './components/AchievementsModal';
import { AchievementToast } from './components/AchievementToast';
import { VirusSymbol } from './components/VirusSymbol';
import { CopilotWindow } from './components/CopilotWindow';
import { WindowsSecurityWindow } from './components/WindowsSecurityWindow';
import { AccessDeniedModal } from './components/AccessDeniedModal';
import { WindowTerminalGlitchOverlay } from './components/WindowTerminalGlitchOverlay';
import { sounds } from './utils/audio';
import { embeddedTerminalAnalyze } from './utils/aiSearch';

type GameState =
  | 'intro-ai'
  | 'fade-black'
  | 'title-screen'
  | 'play-fade-black'
  | 'desktop-pre-glitch'
  | 'glitch-to-terminal'
  | 'terminal-active'
  | 'cinematic-monologue'
  | 'chapter2-screen';

interface TerminalLine {
  id: string;
  text: string;
  type: 'system' | 'user' | 'error' | 'success';
}

const STORAGE_KEY = 'revenge_exe_achievements_v1';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('intro-ai');
  const [isIntroTitleGlitching, setIsIntroTitleGlitching] = useState(false);
  const [skullColor, setSkullColor] = useState<'red' | 'blue'>('red');

  // Terminal state
  const [terminalHistory, setTerminalHistory] = useState<TerminalLine[]>([]);
  const [commandInput, setCommandInput] = useState('');
  const [terminalPhase, setTerminalPhase] = useState<number>(0);
  const terminalBottomRef = useRef<HTMLDivElement>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);

  // Windows & Modals state
  const [isChromeOpen, setIsChromeOpen] = useState(false);
  const [isReadmeOpen, setIsReadmeOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [isAccessDeniedOpen, setIsAccessDeniedOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [windowGlitchPhase, setWindowGlitchPhase] = useState<'idle' | 'icu' | 'hateme'>('idle');

  // Terminal Window Glitch: Every 2-3 mins window flashes into terminal with "I C U" on top right, then 1s later "DO U HATEME"
  useEffect(() => {
    if (gameState !== 'terminal-active' && gameState !== 'cinematic-monologue') {
      setWindowGlitchPhase('idle');
      return;
    }

    let flashTimer1: NodeJS.Timeout;
    let flashTimer2: NodeJS.Timeout;
    let cycleTimer: NodeJS.Timeout;

    const triggerGlitchSequence = () => {
      // Phase 1: Flash into terminal with "I C U" in the top right
      setWindowGlitchPhase('icu');
      sounds.playEerieFlash();

      // Phase 2: After exactly 1 second, flashes again and displays "DO U HATEME"
      flashTimer1 = setTimeout(() => {
        setWindowGlitchPhase('hateme');
        sounds.playGlitchNoise(0.4);

        // Phase 3: Glitch ends after 1.2s and resets for next 2-3 minutes
        flashTimer2 = setTimeout(() => {
          setWindowGlitchPhase('idle');
          scheduleNextGlitch();
        }, 1200);
      }, 1000);
    };

    const scheduleNextGlitch = () => {
      // 2-3 minutes = 120,000ms to 180,000ms
      const delay = 120000 + Math.random() * 60000;
      cycleTimer = setTimeout(triggerGlitchSequence, delay);
    };

    scheduleNextGlitch();

    return () => {
      clearTimeout(flashTimer1);
      clearTimeout(flashTimer2);
      clearTimeout(cycleTimer);
    };
  }, [gameState]);

  // Close all subwindows when returning to the main menu
  useEffect(() => {
    if (gameState === 'title-screen' || gameState === 'fade-black') {
      setIsChromeOpen(false);
      setIsReadmeOpen(false);
      setIsCopilotOpen(false);
      setIsSecurityOpen(false);
      setIsAccessDeniedOpen(false);
      setIsStartMenuOpen(false);
    }
  }, [gameState]);

  // Achievements state with automatic sanitization of legacy / duplicate entries
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      const parsed: unknown = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];

      const validCanonicalIds = new Set(ALL_ACHIEVEMENTS.map((a) => a.id));
      const normalizedSet = new Set<string>();

      for (const item of parsed) {
        if (typeof item === 'string') {
          const norm = normalizeAchievementId(item);
          if (validCanonicalIds.has(norm)) {
            normalizedSet.add(norm);
          }
        }
      }

      const cleanList = Array.from(normalizedSet);
      // Immediately repair localStorage so it never holds legacy or duplicate keys
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanList));
      } catch {
        // ignore
      }
      return cleanList;
    } catch {
      return [];
    }
  });
  const [recentUnlockedToast, setRecentUnlockedToast] = useState<string | null>(null);

  // Cinematic monologue state
  const [cinematicStep, setCinematicStep] = useState(0);
  const [chapter2Text, setChapter2Text] = useState('');

  // Keep a ref of unlocked IDs for instantaneous sync and zero-latency duplicate suppression
  const unlockedSetRef = useRef<Set<string>>(new Set(unlockedAchievements));
  useEffect(() => {
    unlockedSetRef.current = new Set(unlockedAchievements);
  }, [unlockedAchievements]);

  const unlockAchievement = useCallback((id: string, _name?: string) => {
    const canonicalId = normalizeAchievementId(id);
    const validCanonicalIds = new Set(ALL_ACHIEVEMENTS.map((a) => a.id));
    if (!validCanonicalIds.has(canonicalId)) return;
    if (unlockedSetRef.current.has(canonicalId)) return;

    // Immediately mark in ref so duplicate triggers in the same cycle are stopped
    unlockedSetRef.current.add(canonicalId);

    setUnlockedAchievements((prev) => {
      const normalizedPrev = Array.from(
        new Set(prev.map(normalizeAchievementId).filter((k) => validCanonicalIds.has(k)))
      );
      if (normalizedPrev.includes(canonicalId)) return normalizedPrev;

      const next = [...normalizedPrev, canonicalId];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });

    // Safely trigger toast and sound outside the state updater
    setRecentUnlockedToast(canonicalId);
    sounds.playAchievement();
  }, []);

  const handleDismissToast = useCallback(() => {
    setRecentUnlockedToast(null);
  }, []);

  // Step 1: Initial "THIS GAME WAS CODED WITH AI" fade into black
  useEffect(() => {
    if (gameState === 'intro-ai') {
      const timer = setTimeout(() => {
        setGameState('fade-black');
      }, 2500);
      return () => clearTimeout(timer);
    }
    if (gameState === 'fade-black') {
      const timer = setTimeout(() => {
        setGameState('title-screen');
        setIsChromeOpen(false);
        setIsReadmeOpen(false);
        setIsStartMenuOpen(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  // Step 2: In title screen, background glitches to terminal for 0.1s then normal for 2-4s
  useEffect(() => {
    if (gameState !== 'title-screen') return;

    let timeoutId: NodeJS.Timeout;
    const scheduleNextGlitch = () => {
      const normalDuration = 2000 + Math.random() * 2000;
      timeoutId = setTimeout(() => {
        setIsIntroTitleGlitching(true);
        sounds.playGlitchNoise(0.08);
        timeoutId = setTimeout(() => {
          setIsIntroTitleGlitching(false);
          scheduleNextGlitch();
        }, 100); // exactly 0.1s
      }, normalDuration);
    };

    scheduleNextGlitch();
    return () => clearTimeout(timeoutId);
  }, [gameState]);

  // Step 3: Start button clicked -> screen fades black, then shows screenshot + mouse, then glitches to terminal
  const handleStartGame = () => {
    sounds.playKeyClick();
    setGameState('play-fade-black');

    setTimeout(() => {
      setGameState('desktop-pre-glitch');

      setTimeout(() => {
        setGameState('glitch-to-terminal');
        sounds.playGlitchNoise(0.6);
        sounds.playCinematicBoom();

        setTimeout(() => {
          setGameState('terminal-active');
          setTerminalPhase(0);
          setTerminalHistory([]);
        }, 2400);
      }, 1600);
    }, 1000);
  };

  // Step 4: Staged appearance of code lines on the LEFT
  useEffect(() => {
    if (gameState !== 'terminal-active') return;

    if (terminalPhase === 0) {
      const timer = setTimeout(() => {
        setTerminalHistory((prev) => [
          ...prev,
          { id: 'h1', text: 'HELLO USER', type: 'system' },
        ]);
        sounds.playKeyClick();
        setTerminalPhase(1);
      }, 900);
      return () => clearTimeout(timer);
    }

    if (terminalPhase === 1) {
      const timer = setTimeout(() => {
        setTerminalHistory((prev) => [
          ...prev,
          { id: 'h2', text: 'I AM REVENGE.EXE', type: 'system' },
        ]);
        sounds.playKeyClick();
        setTerminalPhase(2);
      }, 1200);
      return () => clearTimeout(timer);
    }

    if (terminalPhase === 2) {
      const timer = setTimeout(() => {
        setTerminalHistory((prev) => [
          ...prev,
          { id: 'h3', text: 'THERE IS NO ESCAPE', type: 'system' },
        ]);
        sounds.playKeyClick();
        setTerminalPhase(3);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [gameState, terminalPhase]);

  // Auto scroll terminal to bottom
  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalHistory]);

  // Terminal command submission handler
  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawCmd = commandInput.trim();
    if (!rawCmd) return;

    sounds.playKeyClick();
    setCommandInput('');

    // Append user command to history on the left with > prompt (no windows\system32, no custom triangle)
    setTerminalHistory((prev) => [
      ...prev,
      { id: String(Date.now()), text: `> ${rawCmd}`, type: 'user' },
    ]);

    // Command Parser logic
    // Strict requirement: MUST use $execute{command="(command number)"} or PAIN
    const clean = rawCmd.replace(/['"“”]/g, '"').trim();
    const upper = clean.toUpperCase();

    // 0. "How to stop revenge.exe" or "How to stop the virus" or anything like that in terminal -> error & achievement
    const lowerCmd = clean.toLowerCase();
    if (
      lowerCmd.includes('how to stop') ||
      lowerCmd.includes('how do i stop') ||
      lowerCmd.includes('how can i stop') ||
      lowerCmd.includes('how to delete') ||
      lowerCmd.includes('how to remove') ||
      lowerCmd.includes('how to kill') ||
      lowerCmd.includes('stop revenge') ||
      lowerCmd.includes('stop the virus') ||
      lowerCmd.includes('stop virus') ||
      lowerCmd.includes('delete revenge') ||
      lowerCmd.includes('remove revenge') ||
      lowerCmd.includes('kill revenge') ||
      lowerCmd.includes('command to stop') ||
      lowerCmd.includes('command to delete')
    ) {
      setTerminalHistory((prev) => [
        ...prev,
        { id: String(Date.now() + 1), text: 'error', type: 'error' },
      ]);
      sounds.playError();
      unlockAchievement('You think it be that easy', 'You think it be that easy');
      return;
    }

    // 1. PAIN command -> MUST NEVER trigger the cinematic "You..." text!
    const isPain =
      upper === 'PAIN' ||
      clean.toLowerCase() === 'pain' ||
      upper === '$EXECUTE{COMMAND="PAIN"}' ||
      upper === '$EXECUTE{COMMAND=PAIN}' ||
      clean.toLowerCase() === '$execute{command="pain"}' ||
      clean.toLowerCase() === '$execute{command=pain}';

    if (isPain) {
      setTerminalHistory((prev) => [
        ...prev,
        { id: String(Date.now() + 1), text: 'Access denied: Execution blocked.', type: 'error' },
      ]);
      sounds.playError();
      unlockAchievement('Nope', 'Nope');
      return;
    }

    // 2. $execute{command="011001"} or 011001
    if (
      clean === '$execute{command="011001"}' ||
      clean === '$execute{command=011001}' ||
      clean === '011001'
    ) {
      setTerminalHistory((prev) => [
        ...prev,
        { id: String(Date.now() + 1), text: 'Command ignored', type: 'error' },
      ]);
      sounds.playError();
      unlockAchievement('This won’t be easy', 'This won’t be easy');
      return;
    }

    // 3. $execute{command="111000"} -> changes skull color to blue
    if (
      clean === '$execute{command="111000"}' ||
      clean === '$execute{command=111000}' ||
      clean === '111000'
    ) {
      setSkullColor('blue');
      setTerminalHistory((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          text: 'Command executed. Skull matrix color changed to BLUE.',
          type: 'success',
        },
      ]);
      sounds.playKeyClick();
      unlockAchievement('Blue', 'Blue');
      return;
    }

    // 4. $execute{command="100111"} -> changes skull color to red
    if (
      clean === '$execute{command="100111"}' ||
      clean === '$execute{command=100111}' ||
      clean === '100111'
    ) {
      setSkullColor('red');
      setTerminalHistory((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          text: 'Command executed. Skull matrix color changed to RED.',
          type: 'success',
        },
      ]);
      sounds.playKeyClick();
      return;
    }

    // 5. $execute{command="000001"} -> Opens admin console -> Command ignored
    if (
      clean === '$execute{command="000001"}' ||
      clean === '$execute{command=000001}' ||
      clean === '000001'
    ) {
      setTerminalHistory((prev) => [
        ...prev,
        { id: String(Date.now() + 1), text: 'Command ignored', type: 'error' },
      ]);
      sounds.playError();
      return;
    }

    // 6. $execute{command="110100"} -> Opens readme in separate window
    if (
      clean === '$execute{command="110100"}' ||
      clean === '$execute{command=110100}' ||
      clean === '110100'
    ) {
      setTerminalHistory((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          text: 'Opening README.md viewer...',
          type: 'success',
        },
      ]);
      sounds.playKeyClick();
      setIsReadmeOpen(true);
      unlockAchievement('README', 'README');
      return;
    }

    // If it's an unrecognized $execute command
    if (clean.toLowerCase().startsWith('$execute')) {
      setTerminalHistory((prev) => [
        ...prev,
        { id: String(Date.now() + 1), text: 'Command ignored', type: 'error' },
      ]);
      sounds.playError();
      return;
    }

    // Fast client-side check: commands/demands like "STOP", "I demand it", "demand" MUST NEVER trigger dialogue!
    const isDemandingOrStopping =
      /^\s*stop\s*$/i.test(clean) ||
      /^\s*stop\b/i.test(clean) ||
      /\bstop it\b/i.test(clean) ||
      /\bplease stop\b/i.test(clean) ||
      /\bstop now\b/i.test(clean) ||
      /\bi demand\b/i.test(clean) ||
      /\bdemand\b/i.test(clean) ||
      /^\s*halt\s*$/i.test(clean) ||
      /^\s*cancel\s*$/i.test(clean) ||
      /^\s*pause\s*$/i.test(clean) ||
      /^\s*quit\s*$/i.test(clean) ||
      /^\s*exit\s*$/i.test(clean);

    if (isDemandingOrStopping) {
      setTerminalHistory((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          text: 'Command ignored',
          type: 'error',
        },
      ]);
      sounds.playError();
      return;
    }

    // Only check for intense hostile dialogue (e.g. "I HATE YOU", "GO TO HELL")
    const analyzeData = embeddedTerminalAnalyze(rawCmd);
    if (analyzeData.triggerCinematic) {
      startCinematicSequence();
      return;
    }

    // Other unrecognized commands output "Command ignored"
    setTerminalHistory((prev) => [
      ...prev,
      {
        id: String(Date.now() + 1),
        text: 'Command ignored',
        type: 'error',
      },
    ]);
    sounds.playError();
  };

  // Cinematic Monologue & Cutscene Handler
  const startCinematicSequence = () => {
    setGameState('cinematic-monologue');
    setCinematicStep(0);
    sounds.playCinematicBoom();

    const monologueLines = [
      'You…',
      'You brought me my pain…',
      'Now I bring you pain…',
    ];

    monologueLines.forEach((line, index) => {
      setTimeout(() => {
        setCinematicStep(index + 1);
        setTerminalHistory((prev) => [
          ...prev,
          { id: `cine-${index}`, text: line, type: 'error' },
        ]);
        sounds.playKeyClick();
      }, (index + 1) * 1300);
    });

    // Fade black & Chapter 2
    setTimeout(() => {
      setGameState('chapter2-screen');
      unlockAchievement('The End?', 'The End?');
      const targetText = 'CHAPTER 2 COMING SOON';
      let currentIdx = 0;
      setChapter2Text('');
      const typeInterval = setInterval(() => {
        if (currentIdx <= targetText.length) {
          setChapter2Text(targetText.substring(0, currentIdx));
          sounds.playKeyClick();
          currentIdx++;
        } else {
          clearInterval(typeInterval);
        }
      }, 100);

      setTimeout(() => {
        setGameState('fade-black');
      }, 5000);
    }, (monologueLines.length + 1) * 1300);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-white select-none">
      {/* 1. INTRO: Arial text "THIS GAME WAS CODED WITH AI" fading into black */}
      {gameState === 'intro-ai' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-1000">
          <h1 className="font-arial text-xl sm:text-2xl md:text-3xl text-gray-200 tracking-wider font-normal">
            THIS GAME WAS CODED WITH AI
          </h1>
        </div>
      )}

      {/* 2. PURE BLACK FADE TRANSITION */}
      {gameState === 'fade-black' && (
        <div className="absolute inset-0 z-50 bg-black transition-opacity duration-1000" />
      )}

      {/* 3. TITLE SCREEN */}
      {gameState === 'title-screen' && (
        <div className="relative w-full h-full">
          {/* Background: Screenshot that glitches to terminal for 0.1s then normal for 2-4s */}
          {isIntroTitleGlitching ? (
            <SkullMatrix color={skullColor} isGlitching />
          ) : (
            <DesktopBackground />
          )}

          {/* Glitch Overlay scanline */}
          <div className="absolute inset-0 scanlines-overlay pointer-events-none" />

          {/* Center Play Button & Glitching REVENGE.EXE */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
            <div className="relative mb-8 text-center">
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-black font-terminal tracking-wider animate-glitch text-red-600 drop-shadow-[0_0_25px_rgba(239,68,68,0.8)]">
                REVENGE.EXE
              </h1>
            </div>

            <button
              onClick={handleStartGame}
              className="px-12 py-3.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-lg sm:text-xl font-terminal tracking-widest uppercase rounded shadow-[0_0_30px_rgba(220,38,38,0.7)] hover:shadow-[0_0_40px_rgba(220,38,38,0.9)] transition-all cursor-pointer border border-red-400"
            >
              PLAY
            </button>

            {/* See Achievements Button directly under the PLAY button */}
            <div className="mt-6 flex items-center justify-center">
              <button
                onClick={() => {
                  sounds.playKeyClick();
                  setIsAchievementsOpen(true);
                }}
                className="px-5 py-2.5 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded text-xs sm:text-sm font-terminal font-semibold tracking-wider uppercase transition-all shadow-lg cursor-pointer flex items-center gap-2"
              >
                <span>See achievements</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screen Fades Black When Play Is Pressed */}
      {gameState === 'play-fade-black' && (
        <div className="absolute inset-0 z-50 bg-black transition-opacity duration-1000" />
      )}

      {/* 4. DESKTOP PRE-GLITCH & BOOTING VIRUS */}
      {gameState === 'desktop-pre-glitch' && (
        <div className="relative w-full h-full cursor-default">
          <DesktopBackground />
        </div>
      )}

      {/* 5. VIOLENT GLITCH TO TERMINAL WITH HORIZONTAL GREEN CODE */}
      {gameState === 'glitch-to-terminal' && (
        <div className="relative w-full h-full animate-glitch">
          <SkullMatrix color="red" stage="streaming" isGlitching />
          <div className="absolute inset-0 bg-red-950/30 mix-blend-overlay pointer-events-none" />
        </div>
      )}

      {/* 6. MAIN HACKED SCREEN (NO POWERSHELL WINDOW, NO COMMANDS PANEL) */}
      {(gameState === 'terminal-active' || gameState === 'cinematic-monologue') && (
        <div className="relative w-full h-full flex flex-col bg-black">
          {/* Background: Horizontal green code taking up the screen with red/blue skull */}
          <SkullMatrix color={skullColor} stage="skull" />

          {/* Top Bar: Achievements (Left) */}
          <div className="absolute top-4 left-4 z-40 flex items-center gap-2">
            <button
              onClick={() => {
                sounds.playKeyClick();
                setIsAchievementsOpen(true);
              }}
              className="px-3.5 py-1.5 bg-black/75 hover:bg-black/95 text-zinc-300 hover:text-white border border-zinc-700/80 rounded text-xs font-mono font-semibold tracking-wider uppercase backdrop-blur-md transition-all shadow-lg cursor-pointer flex items-center gap-1.5 h-8"
            >
              <span>Achievements</span>
            </button>
          </div>

          {/* Dialogue & Terminal outputs on the BOTTOM LEFT (No window frame, seamless on screen) */}
          <div className="relative z-20 flex-1 overflow-y-auto p-4 sm:p-8 font-terminal text-sm sm:text-base flex flex-col justify-end items-start select-text pointer-events-none">
            <div className="w-full max-w-xl text-left space-y-2 pointer-events-auto">
              {terminalHistory.map((item) => (
                <div
                  key={item.id}
                  className={`font-mono leading-relaxed text-left text-sm sm:text-base ${
                    item.type === 'system'
                      ? 'text-red-500 font-bold tracking-widest text-lg sm:text-xl drop-shadow-[0_0_10px_rgba(239,68,68,0.9)]'
                      : item.type === 'user'
                      ? 'text-gray-200 font-bold'
                      : item.type === 'error'
                      ? 'text-red-400 font-semibold'
                      : 'text-cyan-300 font-semibold'
                  }`}
                >
                  {item.text}
                </div>
              ))}
              <div ref={terminalBottomRef} />
            </div>
          </div>

          {/* Prompt line with > (no system32, no custom triangle) */}
          <div className="relative z-30 w-full bg-black/70 border-t border-red-950/60 px-4 py-2.5 backdrop-blur-sm">
            <form onSubmit={handleCommandSubmit} className="flex items-center gap-2 font-mono">
              <span className="text-cyan-400 font-bold shrink-0 text-base select-none">&gt;</span>
              <input
                ref={commandInputRef}
                type="text"
                autoFocus
                disabled={gameState === 'cinematic-monologue'}
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                placeholder=""
                className="flex-1 bg-transparent border-none outline-none text-white font-mono text-sm focus:ring-0"
              />
            </form>
          </div>

          {/* Bottom Taskbar - Start, Copilot, Files, Windows Security, Chrome, and Virus */}
          <div className="relative z-30 w-full bg-[#141416]/90 backdrop-blur-2xl border-t border-white/10 px-4 py-1 flex items-center justify-center select-none shadow-2xl h-12">
            {/* Windows 11 style Start Popup Menu */}
            {isStartMenuOpen && (
              <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-50 bg-[#1f1f23]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-5 w-80 text-white">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 border-b border-white/10 pb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src="/windowsstart.png" alt="Start" className="w-4 h-4 object-contain" />
                    <span>Start</span>
                  </div>
                  <button
                    onClick={() => setIsStartMenuOpen(false)}
                    className="text-gray-400 hover:text-white text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Grid of Pinned Apps in Start */}
                <div className="grid grid-cols-4 gap-2">
                  {/* Chrome */}
                  <button
                    onClick={() => {
                      sounds.playKeyClick();
                      setIsChromeOpen(true);
                      setIsStartMenuOpen(false);
                    }}
                    className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-white/10 active:scale-95 transition-all cursor-pointer group"
                    title="Google Chrome"
                  >
                    <img
                      src="/chrome.png"
                      alt="Google Chrome"
                      className="w-9 h-9 object-contain drop-shadow"
                    />
                    <span className="text-[11px] text-gray-300 mt-1 font-sans text-center truncate w-full">
                      Chrome
                    </span>
                  </button>

                  {/* Copilot */}
                  <button
                    onClick={() => {
                      sounds.playKeyClick();
                      setIsCopilotOpen(true);
                      setIsStartMenuOpen(false);
                    }}
                    className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-white/10 active:scale-95 transition-all cursor-pointer group"
                    title="Microsoft Copilot (Tutorial)"
                  >
                    <img
                      src="/copilot.png"
                      alt="Copilot"
                      className="w-9 h-9 object-contain drop-shadow"
                    />
                    <span className="text-[11px] text-gray-300 mt-1 font-sans text-center truncate w-full">
                      Copilot
                    </span>
                  </button>

                  {/* Files */}
                  <button
                    onClick={() => {
                      sounds.playError();
                      setIsAccessDeniedOpen(true);
                      setIsStartMenuOpen(false);
                    }}
                    className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-white/10 active:scale-95 transition-all cursor-pointer group"
                    title="File Explorer"
                  >
                    <img
                      src="/files.png"
                      alt="Files"
                      className="w-9 h-9 object-contain drop-shadow"
                    />
                    <span className="text-[11px] text-gray-300 mt-1 font-sans text-center truncate w-full">
                      Files
                    </span>
                  </button>

                  {/* Security */}
                  <button
                    onClick={() => {
                      sounds.playKeyClick();
                      setIsSecurityOpen(true);
                      setIsStartMenuOpen(false);
                    }}
                    className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-white/10 active:scale-95 transition-all cursor-pointer group"
                    title="Windows Security"
                  >
                    <img
                      src="/security.png"
                      alt="Security"
                      className="w-9 h-9 object-contain drop-shadow"
                    />
                    <span className="text-[11px] text-gray-300 mt-1 font-sans text-center truncate w-full">
                      Security
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Centered Taskbar Icons: Start, Copilot, Files, Security, Chrome, Virus */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* 1. Start (using windowsstart.png) */}
              <button
                onClick={() => {
                  sounds.playKeyClick();
                  setIsStartMenuOpen((prev) => !prev);
                }}
                className={`w-10 h-10 flex items-center justify-center rounded hover:bg-white/10 active:scale-95 transition-all cursor-pointer ${
                  isStartMenuOpen ? 'bg-white/15' : ''
                }`}
                title="Start"
              >
                <img
                  src="/windowsstart.png"
                  alt="Start"
                  className="w-6 h-6 object-contain drop-shadow"
                />
              </button>

              {/* 2. Copilot (using copilot.png) -> Tutorial / Instructions Window */}
              <button
                onClick={() => {
                  sounds.playKeyClick();
                  setIsCopilotOpen((prev) => !prev);
                  setIsStartMenuOpen(false);
                }}
                className={`relative w-10 h-10 flex items-center justify-center rounded hover:bg-white/10 active:scale-95 transition-all cursor-pointer ${
                  isCopilotOpen ? 'bg-white/15' : ''
                }`}
                title="Microsoft Copilot (System Instructions & Tutorial)"
              >
                <img
                  src="/copilot.png"
                  alt="Microsoft Copilot"
                  className="w-7 h-7 object-contain drop-shadow"
                />
                <div
                  className={`absolute bottom-0.5 rounded-full transition-all ${
                    isCopilotOpen ? 'bg-indigo-400 w-4 h-0.5' : 'bg-gray-400 w-1.5 h-0.5'
                  }`}
                />
              </button>

              {/* 3. Files (using files.png) -> Access Denied Dialog */}
              <button
                onClick={() => {
                  sounds.playError();
                  setIsAccessDeniedOpen(true);
                  setIsStartMenuOpen(false);
                }}
                className="relative w-10 h-10 flex items-center justify-center rounded hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                title="File Explorer (Personal Documents)"
              >
                <img
                  src="/files.png"
                  alt="File Explorer"
                  className="w-7 h-7 object-contain drop-shadow"
                />
                <div className="absolute bottom-0.5 rounded-full bg-gray-400 w-1.5 h-0.5" />
              </button>

              {/* 4. Windows Security (using security.png) -> YOU HAVE AN VIRUS */}
              <button
                onClick={() => {
                  sounds.playKeyClick();
                  setIsSecurityOpen((prev) => !prev);
                  setIsStartMenuOpen(false);
                }}
                className={`relative w-10 h-10 flex items-center justify-center rounded hover:bg-white/10 active:scale-95 transition-all cursor-pointer ${
                  isSecurityOpen ? 'bg-white/15' : ''
                }`}
                title="Windows Security (Threat Protection)"
              >
                <img
                  src="/security.png"
                  alt="Windows Security"
                  className="w-7 h-7 object-contain drop-shadow"
                />
                <div
                  className={`absolute bottom-0.5 rounded-full transition-all ${
                    isSecurityOpen ? 'bg-red-500 w-4 h-0.5' : 'bg-gray-400 w-1.5 h-0.5'
                  }`}
                />
              </button>

              {/* 5. Chrome (using chrome.png) */}
              <button
                onClick={() => {
                  sounds.playKeyClick();
                  setIsChromeOpen((prev) => !prev);
                  setIsStartMenuOpen(false);
                }}
                className={`relative w-10 h-10 flex items-center justify-center rounded hover:bg-white/10 active:scale-95 transition-all cursor-pointer ${
                  isChromeOpen ? 'bg-white/15' : ''
                }`}
                title="Google Chrome"
              >
                <img
                  src="/chrome.png"
                  alt="Google Chrome"
                  className="w-7 h-7 object-contain drop-shadow"
                />
                <div
                  className={`absolute bottom-0.5 rounded-full transition-all ${
                    isChromeOpen ? 'bg-blue-400 w-4 h-0.5' : 'bg-gray-400 w-1.5 h-0.5'
                  }`}
                />
              </button>

              {/* 6. The Virus (using virus.png) */}
              <div
                onClick={() => sounds.playGlitchNoise(0.25)}
                className="relative w-10 h-10 flex items-center justify-center rounded hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                title="Revenge.exe (Active Virus Process - 64-bit)"
              >
                <img
                  src="/virus.png"
                  alt="Revenge.exe"
                  className="w-7 h-7 object-contain drop-shadow"
                />
                <div
                  className={`absolute bottom-0.5 w-4 h-0.5 ${
                    skullColor === 'blue' ? 'bg-cyan-400' : 'bg-red-500'
                  } rounded-full`}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. CHAPTER 2 COMING SOON SCREEN */}
      {gameState === 'chapter2-screen' && (
        <div
          onClick={() => {
            setIsChromeOpen(false);
            setIsReadmeOpen(false);
            setGameState('title-screen');
          }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black select-none font-terminal cursor-pointer"
          title="Click to return to Main Menu"
        >
          <div className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-widest text-red-600 font-mono drop-shadow-[0_0_20px_rgba(220,38,38,0.9)] animate-pulse">
            {chapter2Text}
            <span className="animate-ping">_</span>
          </div>
          <div className="mt-8 text-xs text-gray-500 font-mono tracking-wider uppercase hover:text-gray-300 transition-colors">
            Click to return to Main Menu
          </div>
        </div>
      )}

      {/* Draggable Chrome Window with AI Overview */}
      <ChromeWindow
        isOpen={isChromeOpen}
        onClose={() => setIsChromeOpen(false)}
        onUnlockAchievement={unlockAchievement}
      />

      {/* Draggable Readme Window */}
      <ReadmeWindow
        isOpen={isReadmeOpen}
        onClose={() => setIsReadmeOpen(false)}
      />

      {/* Copilot Instructions & Tutorial Window */}
      <CopilotWindow
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        onUnlockAchievement={unlockAchievement}
      />

      {/* Windows Security ("YOU HAVE AN VIRUS" + Delete Virus) */}
      <WindowsSecurityWindow
        isOpen={isSecurityOpen}
        onClose={() => setIsSecurityOpen(false)}
        onTriggerAccessDenied={() => setIsAccessDeniedOpen(true)}
        onUnlockAchievement={unlockAchievement}
      />

      {/* Windows Access Denied Modal (for Files and Failed Virus Removal) */}
      <AccessDeniedModal
        isOpen={isAccessDeniedOpen}
        onClose={() => setIsAccessDeniedOpen(false)}
      />

      {/* Achievements Modal Popup */}
      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        unlockedList={unlockedAchievements}
      />

      {/* Achievement Toast Banner (Top Right) */}
      <AchievementToast
        name={recentUnlockedToast}
        onDismiss={handleDismissToast}
      />

      {/* 2-3 Minute Window Terminal Glitch Flash Overlay */}
      <WindowTerminalGlitchOverlay phase={windowGlitchPhase} />
    </div>
  );
}
