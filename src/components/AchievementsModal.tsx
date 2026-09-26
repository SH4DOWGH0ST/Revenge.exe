import React from 'react';
import { sounds } from '../utils/audio';

export interface AchievementItem {
  id: string;
  name: string;
}

export const ALL_ACHIEVEMENTS: AchievementItem[] = [
  { id: 'Time to ask copliot', name: 'Time to ask copliot' },
  { id: 'You think it be that easy', name: 'You think it be that easy' },
  { id: 'Nice try tho', name: 'Nice try tho' },
  { id: 'Who are you?', name: 'Who are you?' },
  { id: 'Did I do something?', name: 'Did I do something?' },
  { id: 'DesertEagle', name: 'DesertEagle' },
  { id: 'This won’t be easy', name: 'This won’t be easy' },
  { id: 'Blue', name: 'Blue' },
  { id: 'README', name: 'README' },
  { id: 'Nope', name: 'Nope' },
  { id: 'No peace', name: 'No peace' },
  { id: 'The End?', name: 'The End?' },
];

export const normalizeAchievementId = (raw: string): string => {
  if (!raw) return '';
  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();

  if (lower.includes('you think it be that easy') || lower.includes('you thought it be that easy')) {
    return 'You think it be that easy';
  }
  if (lower.includes('this won') && lower.includes('be easy')) {
    return 'This won’t be easy';
  }
  if (lower === 'blue') return 'Blue';
  if (lower.includes('who are you')) return 'Who are you?';
  if (lower.includes('did i do something')) return 'Did I do something?';
  if (lower === 'nope') return 'Nope';
  if (lower.includes('deserteagle') || lower.includes('desert eagle')) return 'DesertEagle';
  if (lower === 'readme') return 'README';
  if (lower.includes('the end')) return 'The End?';
  if (lower.includes('copilot') || lower.includes('copliot')) return 'Time to ask copliot';
  if (lower.includes('nice try') || lower.includes('noce try')) return 'Nice try tho';
  if (lower.includes('no peace') || lower.includes('peace speech')) return 'No peace';

  return trimmed;
};

export const isAchievementUnlocked = (
  achievementId: string,
  unlockedList: string[]
): boolean => {
  const targetNorm = normalizeAchievementId(achievementId);
  return unlockedList.some((id) => normalizeAchievementId(id) === targetNorm);
};

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  unlockedList: string[];
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  unlockedList,
}) => {
  if (!isOpen) return null;

  const unlockedCount = ALL_ACHIEVEMENTS.filter((item) =>
    isAchievementUnlocked(item.id, unlockedList)
  ).length;
  const totalCount = ALL_ACHIEVEMENTS.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-md bg-[#121217] border border-gray-700 rounded-lg shadow-2xl overflow-hidden font-terminal">
        {/* Header */}
        <div className="bg-[#1c1c24] px-5 py-3.5 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-base tracking-wide uppercase font-vt323 text-lg">
              Achievements
            </h2>
            <div className="text-xs text-gray-400 font-mono">
              Unlocked: {unlockedCount} / {totalCount}
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playKeyClick();
              onClose();
            }}
            className="text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-800 text-sm font-mono transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Achievement List */}
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3 font-mono">
          {ALL_ACHIEVEMENTS.map((item) => {
            const isUnlocked = isAchievementUnlocked(item.id, unlockedList);
            return (
              <div
                key={item.id}
                className={`p-3.5 rounded border transition-all flex items-center justify-between ${
                  isUnlocked
                    ? 'bg-zinc-900/90 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                    : 'bg-zinc-950/60 border-zinc-800/80 opacity-60'
                }`}
              >
                <div className="flex flex-col">
                  {/* Achievement Name - NO SYMBOLS */}
                  <span
                    className={`font-semibold text-sm ${
                      isUnlocked ? 'text-emerald-400' : 'text-zinc-500'
                    }`}
                  >
                    {item.name}
                  </span>
                </div>

                <div
                  className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded ${
                    isUnlocked
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                      : 'bg-zinc-900 text-zinc-600 border border-zinc-800'
                  }`}
                >
                  {isUnlocked ? 'Unlocked' : 'Locked'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#18181f] border-t border-gray-800/80 flex items-center justify-end">
          <button
            onClick={() => {
              sounds.playKeyClick();
              onClose();
            }}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded font-semibold uppercase tracking-wider transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
