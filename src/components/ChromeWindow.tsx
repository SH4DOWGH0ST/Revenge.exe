import React, { useState, useRef, useEffect } from 'react';
import { ChromeIcon } from './ChromeIcon';
import { GeminiAiIcon } from './GeminiAiIcon';
import { sounds } from '../utils/audio';
import { executeAiSearch } from '../utils/aiSearch';

interface ChromeWindowProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlockAchievement: (id: string, name: string) => void;
}

export interface AiOverviewData {
  heading?: string;
  summary?: string;
  details?: string[];
  keyFacts?: { label: string; value: string }[];
  sources?: { title: string; site: string }[];
}

export interface SearchResult {
  related: boolean;
  query: string;
  error?: string;
  isRemoveQuery?: boolean;
  heading?: string;
  summary?: string;
  details?: string[];
  keyFacts?: { label: string; value: string }[];
  sources?: { title: string; site: string }[];
  relatedQueries?: string[];
  achievementUnlocked?: string;
  title?: string;
  snippet?: string;
}

// Lore terms and their target searches so clicking ANY lore mention in AI Overview triggers another search
const LORE_LINKS: { term: string; query: string }[] = [
  { term: 'whole lore', query: 'whole lore' },
  { term: 'full lore', query: 'whole lore' },
  { term: 'all lore', query: 'whole lore' },
  { term: 'the lore', query: 'whole lore' },
  { term: 'complete lore', query: 'whole lore' },
  { term: 'N3verF0rg3t', query: 'who is N3verF0rg3t' },
  { term: 'CNN interview', query: 'N3verF0rg3t CNN' },
  { term: 'CNN', query: 'N3verF0rg3t CNN' },
  { term: 'Revenge.exe', query: 'revenge.exe github' },
  { term: 'DesertEagle', query: 'deserteagle' },
  { term: 'Red White and Blue', query: 'what is red white and blue' },
  { term: 'ImperialHacker2372', query: 'ImperialHacker2372 Michael Smith' },
  { term: 'Michael Smith', query: 'ImperialHacker2372 Michael Smith' },
  { term: 'science teacher', query: 'revenge.exe hacked school' },
  { term: 'high school', query: 'revenge.exe hacked school' },
  { term: 'World Trade Center', query: 'N3verF0rg3t 9/11 North Tower' },
  { term: 'North Tower', query: 'N3verF0rg3t 9/11 North Tower' },
  { term: '9/11', query: 'N3verF0rg3t 9/11 North Tower' },
  { term: '$execute{command="011001"}', query: 'the command to stop the virus' },
  { term: '$execute{command=”011001”}', query: 'the command to stop the virus' },
  { term: '011001', query: 'the command to stop the virus' },
  { term: '111000', query: 'revenge.exe commands list' },
  { term: '100111', query: 'revenge.exe commands list' },
  { term: '000001', query: 'revenge.exe commands list' },
  { term: '110100', query: 'revenge.exe commands list' },
  { term: 'PAIN', query: 'secret command PAIN' },
  { term: 'Nick Clark', query: 'Nick Clark N3verF0rg3t' },
  { term: 'NYPD', query: 'N3verF0rg3t NYPD' },
  { term: 'USB drives', query: 'revenge.exe USB attack' },
  { term: 'USB', query: 'revenge.exe USB attack' },
  { term: 'hospital extortion', query: 'DesertEagle hospital extortion' },
  { term: 'IP randomization', query: 'where he lives' },
  { term: 'North Carolina', query: 'where he lives' },
  { term: 'Indiana', query: 'where he lives' },
  { term: 'GitHub repository', query: 'revenge.exe github' },
  { term: 'GitHub', query: 'revenge.exe github' },
  { term: 'README', query: 'revenge.exe github' },
  { term: 'Instagram', query: 'revenge.exe hacked school' },
  { term: 'demonstration of my power', query: 'revenge.exe hacked school' },
  { term: 'Al-Qaeda', query: 'N3verF0rg3t twitter debunk' },
  { term: 'Taliban', query: 'N3verF0rg3t twitter debunk' },
  { term: 'CIA', query: 'N3verF0rg3t twitter debunk' },
  { term: 'Chicago PD', query: 'ImperialHacker2372 Michael Smith' },
  { term: 'Chicago', query: 'ImperialHacker2372 Michael Smith' },
  { term: 'Microsoft', query: 'ImperialHacker2372 Michael Smith' },
  { term: 'X (Twitter)', query: 'N3verF0rg3t twitter debunk' },
  { term: 'Twitter', query: 'N3verF0rg3t twitter debunk' },
];

const ClickableLoreText: React.FC<{
  text: string;
  onSearch: (q: string) => void;
  className?: string;
}> = ({ text, onSearch, className = '' }) => {
  // Sort terms by length descending so longer phrases match first
  const sortedTerms = [...LORE_LINKS].sort((a, b) => b.term.length - a.term.length);

  // CRITICAL FIX: Ensure word boundaries on both ends of the term so terms like 'CIA'
  // NEVER split words like 'official' -> 'offi cia l', or 'USB' / 'PAIN' / etc.
  const termPatterns = sortedTerms.map((t) => {
    const escaped = t.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const startBoundary = /^[\w]/.test(t.term) ? '(?<![\\w])' : '';
    const endBoundary = /[\w]$/.test(t.term) ? '(?![\\w])' : '';
    return `${startBoundary}${escaped}${endBoundary}`;
  });

  const regex = new RegExp(`(${termPatterns.join('|')})`, 'gi');

  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const match = sortedTerms.find((t) => t.term.toLowerCase() === part.toLowerCase());
        if (match) {
          return (
            <button
              key={index}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSearch(match.query);
              }}
              title={`Explore lore lead: "${match.query}"`}
              className="inline text-blue-600 hover:text-blue-800 font-semibold underline decoration-blue-300 decoration-1 hover:decoration-2 hover:bg-blue-50/70 rounded cursor-pointer transition-colors"
            >
              {part}
            </button>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};

type TabMode = 'google-home' | 'google-results';

interface HistoryEntry {
  mode: TabMode;
  url: string;
  title: string;
  query: string;
  result: SearchResult | null;
}

interface BrowserTab {
  id: string;
  mode: TabMode;
  title: string;
  url: string;
  query: string;
  result: SearchResult | null;
  history: HistoryEntry[];
  historyIndex: number;
}

export const ChromeWindow: React.FC<ChromeWindowProps> = ({
  isOpen,
  onClose,
  onUnlockAchievement,
}) => {
  const [position, setPosition] = useState({ x: 60, y: 35 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, startX: 0, startY: 0 });

  // Initial tab setup
  const [tabs, setTabs] = useState<BrowserTab[]>([
    {
      id: 'tab-1',
      mode: 'google-home',
      title: 'Google',
      url: 'https://www.google.com',
      query: '',
      result: null,
      history: [
        {
          mode: 'google-home',
          url: 'https://www.google.com',
          title: 'Google',
          query: '',
          result: null,
        },
      ],
      historyIndex: 0,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const [urlInput, setUrlInput] = useState(activeTab.url);
  const [searchInput, setSearchInput] = useState(activeTab.query);
  const [followUpInput, setFollowUpInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sync inputs when active tab changes
  useEffect(() => {
    setUrlInput(activeTab.url);
    setSearchInput(activeTab.query || '');
    setFollowUpInput('');
  }, [activeTabId, activeTab.url, activeTab.query]);

  // Window drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isFullscreen) return;
    if (
      (e.target as HTMLElement).closest('.window-control-btn') ||
      (e.target as HTMLElement).closest('input') ||
      (e.target as HTMLElement).closest('button')
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
        x: Math.max(0, Math.min(window.innerWidth - 300, dragStartRef.current.startX + dx)),
        y: Math.max(0, Math.min(window.innerHeight - 150, dragStartRef.current.startY + dy)),
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

  // Execute Search: queries backend for direct AI Overview and displays it immediately
  const executeSearch = async (queryText: string, recordHistory = true) => {
    const q = queryText.trim();
    if (!q) return;

    sounds.playKeyClick();
    setSearchInput(q);
    setIsLoading(true);

    try {
      const data = await executeAiSearch(q);
      data.query = q;

      setTabs((prevTabs) =>
        prevTabs.map((tab) => {
          if (tab.id !== activeTabId) return tab;

          const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
          const searchTitle = `${q} - Google Search`;

          const newEntry: HistoryEntry = {
            mode: 'google-results',
            url: searchUrl,
            title: searchTitle,
            query: q,
            result: data,
          };

          const newHistory = recordHistory
            ? [...tab.history.slice(0, tab.historyIndex + 1), newEntry]
            : tab.history;
          const newIndex = recordHistory ? newHistory.length - 1 : tab.historyIndex;

          return {
            ...tab,
            mode: 'google-results',
            title: searchTitle,
            url: searchUrl,
            query: q,
            result: data,
            history: newHistory,
            historyIndex: newIndex,
          };
        }),
      );

      setUrlInput(`https://www.google.com/search?q=${encodeURIComponent(q)}`);

      if (data.achievementUnlocked) {
        onUnlockAchievement(data.achievementUnlocked, data.achievementUnlocked);
      }
      if (data.error && !data.related) {
        sounds.playError();
      }
    } catch (err) {
      console.error('Search error:', err);
      const fallbackResult: SearchResult = {
        related: false,
        query: q,
        error: 'An error has occurred',
      };
      setTabs((prevTabs) =>
        prevTabs.map((tab) =>
          tab.id === activeTabId
            ? { ...tab, mode: 'google-results', result: fallbackResult }
            : tab,
        ),
      );
      sounds.playError();
    } finally {
      setIsLoading(false);
    }
  };

  // New Tab Button (+)
  const handleNewTab = () => {
    sounds.playKeyClick();
    const newId = `tab-${Date.now()}`;
    const newTab: BrowserTab = {
      id: newId,
      mode: 'google-home',
      title: 'Google',
      url: 'https://www.google.com',
      query: '',
      result: null,
      history: [
        {
          mode: 'google-home',
          url: 'https://www.google.com',
          title: 'Google',
          query: '',
          result: null,
        },
      ],
      historyIndex: 0,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
    setSearchInput('');
    setUrlInput('https://www.google.com');
  };

  // Close Tab Button (x)
  const handleCloseTab = (tabIdToClose: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playKeyClick();
    if (tabs.length === 1) {
      // Reset to google-home
      setTabs([
        {
          id: 'tab-1',
          mode: 'google-home',
          title: 'Google',
          url: 'https://www.google.com',
          query: '',
          result: null,
          history: [
            {
              mode: 'google-home',
              url: 'https://www.google.com',
              title: 'Google',
              query: '',
              result: null,
            },
          ],
          historyIndex: 0,
        },
      ]);
      setActiveTabId('tab-1');
      setSearchInput('');
      setUrlInput('https://www.google.com');
      return;
    }
    const filtered = tabs.filter((t) => t.id !== tabIdToClose);
    setTabs(filtered);
    if (activeTabId === tabIdToClose) {
      setActiveTabId(filtered[filtered.length - 1].id);
    }
  };

  // Back Button (←)
  const handleBack = () => {
    if (activeTab.historyIndex > 0) {
      sounds.playKeyClick();
      const prevIndex = activeTab.historyIndex - 1;
      const prevEntry = activeTab.history[prevIndex];

      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTabId
            ? {
                ...t,
                mode: prevEntry.mode,
                url: prevEntry.url,
                title: prevEntry.title,
                query: prevEntry.query,
                result: prevEntry.result,
                historyIndex: prevIndex,
              }
            : t,
        ),
      );
      setUrlInput(prevEntry.url);
      setSearchInput(prevEntry.query);
    }
  };

  // Forward Button (→)
  const handleForward = () => {
    if (activeTab.historyIndex < activeTab.history.length - 1) {
      sounds.playKeyClick();
      const nextIndex = activeTab.historyIndex + 1;
      const nextEntry = activeTab.history[nextIndex];

      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTabId
            ? {
                ...t,
                mode: nextEntry.mode,
                url: nextEntry.url,
                title: nextEntry.title,
                query: nextEntry.query,
                result: nextEntry.result,
                historyIndex: nextIndex,
              }
            : t,
        ),
      );
      setUrlInput(nextEntry.url);
      setSearchInput(nextEntry.query);
    }
  };

  // Reload Button (↻)
  const handleReload = () => {
    sounds.playKeyClick();
    if (activeTab.mode === 'google-results' && activeTab.query) {
      executeSearch(activeTab.query, false);
    }
  };

  // Toggle Fullscreen (□)
  const handleToggleFullscreen = () => {
    sounds.playKeyClick();
    setIsFullscreen((prev) => !prev);
  };

  // URL / search submission from top address bar
  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = urlInput.trim();
    if (val.startsWith('http://') || val.startsWith('https://')) {
      // If it looks like a URL, extract search query or topic
      if (val.includes('search?q=')) {
        const params = new URL(val).searchParams;
        const q = params.get('q') || '';
        executeSearch(q);
      } else if (val.includes('/wiki/')) {
        const topic = val.split('/wiki/')[1] || 'Revenge.exe';
        executeSearch(decodeURIComponent(topic));
      } else {
        executeSearch(val);
      }
    } else {
      executeSearch(val);
    }
  };

  // Return to Google home view
  const goToGoogleHome = () => {
    sounds.playKeyClick();
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId
          ? {
              ...t,
              mode: 'google-home',
              title: 'Google',
              url: 'https://www.google.com',
              query: '',
              result: null,
            }
          : t,
      ),
    );
    setUrlInput('https://www.google.com');
    setSearchInput('');
  };

  if (!isOpen) return null;

  return (
    <div
      style={
        isFullscreen
          ? { left: 0, top: 0, width: '100vw', height: '100vh', borderRadius: 0 }
          : {
              left: `${position.x}px`,
              top: `${position.y}px`,
            }
      }
      className={`absolute z-40 bg-[#f8f9fa] shadow-2xl flex flex-col overflow-hidden border border-gray-400/40 select-none text-gray-800 transition-[width,height,border-radius] duration-200 ${
        isFullscreen
          ? 'w-screen h-screen'
          : 'w-[95vw] max-w-[880px] h-[620px] max-h-[90vh] rounded-lg'
      }`}
    >
      {/* Top Chrome Tab Bar & Header */}
      <div
        onMouseDown={handleMouseDown}
        className="bg-[#dfe1e5] px-2 pt-2 pb-0.5 flex items-center justify-between cursor-move border-b border-gray-300"
      >
        <div className="flex items-center gap-1 overflow-x-auto max-w-[calc(100%-120px)] scrollbar-none">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                onClick={() => {
                  sounds.playKeyClick();
                  setActiveTabId(tab.id);
                }}
                className={`px-3 py-1.5 rounded-t-md flex items-center gap-2 text-xs font-sans font-medium cursor-pointer transition-all max-w-[200px] truncate ${
                  isActive
                    ? 'bg-[#f8f9fa] text-gray-800 shadow-sm border-t border-l border-r border-gray-300'
                    : 'text-gray-600 hover:bg-gray-300/60'
                }`}
              >
                <ChromeIcon size={14} />
                <span className="truncate">{tab.title}</span>
                <button
                  onClick={(e) => handleCloseTab(tab.id, e)}
                  className="ml-auto text-gray-400 hover:text-gray-800 text-xs px-1 rounded hover:bg-gray-200"
                >
                  ×
                </button>
              </div>
            );
          })}

          {/* New Tab Button (+) */}
          <button
            onClick={handleNewTab}
            title="New tab"
            className="p-1 hover:bg-gray-300/80 rounded-full cursor-pointer text-gray-700 text-sm font-bold px-2.5 transition-colors"
          >
            +
          </button>
        </div>

        {/* Window Controls (Minimize, Fullscreen / Maximize, Close) */}
        <div className="flex items-center gap-1.5 pr-1">
          <button
            onClick={onClose}
            title="Minimize"
            className="window-control-btn w-7 h-6 flex items-center justify-center hover:bg-gray-300 rounded text-gray-600 text-xs transition-colors"
          >
            ─
          </button>
          <button
            onClick={handleToggleFullscreen}
            title={isFullscreen ? 'Restore Down' : 'Maximize'}
            className="window-control-btn w-7 h-6 flex items-center justify-center hover:bg-gray-300 rounded text-gray-600 text-xs transition-colors"
          >
            {isFullscreen ? '❐' : '□'}
          </button>
          <button
            onClick={onClose}
            title="Close"
            className="window-control-btn w-7 h-6 flex items-center justify-center hover:bg-red-500 hover:text-white rounded text-gray-600 text-xs transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Chrome Navigation Bar */}
      <div className="bg-[#f8f9fa] px-3 py-2 border-b border-gray-200 flex items-center gap-2 sm:gap-3">
        {/* Working Back Button (←) */}
        <button
          onClick={handleBack}
          disabled={activeTab.historyIndex <= 0}
          title="Click to go back"
          className="p-1 rounded-full hover:bg-gray-200 text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Working Forward Button (→) */}
        <button
          onClick={handleForward}
          disabled={activeTab.historyIndex >= activeTab.history.length - 1}
          title="Click to go forward"
          className="p-1 rounded-full hover:bg-gray-200 text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Working Reload Button (↻) */}
        <button
          onClick={handleReload}
          title="Reload this page"
          className="p-1 rounded-full hover:bg-gray-200 text-gray-600 transition-colors"
        >
          <svg className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-500' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        {/* Top Address & Search Bar */}
        <form
          onSubmit={handleUrlSubmit}
          className="flex-1 flex items-center bg-[#f1f3f4] hover:bg-[#e8eaed] focus-within:bg-white focus-within:shadow-md border border-transparent focus-within:border-blue-400 rounded-full px-3.5 py-1 text-sm transition-all"
        >
          <svg className="w-3.5 h-3.5 text-gray-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Search Google with AI or type a query"
            className="w-full bg-transparent outline-none text-xs sm:text-sm text-gray-800 placeholder-gray-500"
          />
          {isLoading && (
            <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin ml-2 shrink-0" />
          )}
        </form>

        <ChromeIcon size={20} />
      </div>

      {/* Main Page Area */}
      {activeTab.mode === 'google-results' ? (
        /* Google Search Results View with AI OVERVIEW */
        <div className="flex-1 bg-white overflow-y-auto flex flex-col font-sans select-text">
          {/* Google Search Sub-header with Logo and Search Input */}
          <div className="border-b border-gray-200 px-4 sm:px-8 py-3 flex items-center gap-4 bg-white sticky top-0 z-20 shadow-xs">
            <button
              onClick={goToGoogleHome}
              className="text-xl sm:text-2xl font-bold tracking-tight select-none cursor-pointer flex items-center shrink-0"
              title="Return to Google Home"
            >
              <span className="text-[#4285F4]">G</span>
              <span className="text-[#EA4335]">o</span>
              <span className="text-[#FBBC05]">o</span>
              <span className="text-[#4285F4]">g</span>
              <span className="text-[#34A853]">l</span>
              <span className="text-[#EA4335]">e</span>
            </button>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                executeSearch(searchInput);
              }}
              className="flex-1 max-w-xl flex items-center bg-[#f1f3f4] hover:bg-[#e8eaed] focus-within:bg-white focus-within:shadow-md border border-transparent focus-within:border-gray-300 rounded-full px-4 py-1.5 transition-all"
            >
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Ask anything..."
                className="w-full bg-transparent outline-none text-xs sm:text-sm text-gray-800"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="text-gray-400 hover:text-gray-600 px-1.5 text-sm"
                >
                  ✕
                </button>
              )}
              <button
                type="submit"
                className="text-blue-600 hover:text-blue-800 p-1 shrink-0 ml-1 cursor-pointer"
                title="Search"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>

          {/* Google Search Categories Navigation */}
          <div className="px-4 sm:px-8 border-b border-gray-100 flex items-center gap-6 text-xs text-gray-600 font-medium overflow-x-auto scrollbar-none">
            <div className="py-2.5 text-blue-600 border-b-2 border-blue-600 font-semibold flex items-center gap-1 cursor-pointer">
              <span>All</span>
            </div>
            <div className="py-2.5 hover:text-gray-900 cursor-pointer">News</div>
            <div className="py-2.5 hover:text-gray-900 cursor-pointer">Images</div>
            <div className="py-2.5 hover:text-gray-900 cursor-pointer">Videos</div>
            <div className="py-2.5 hover:text-gray-900 cursor-pointer">Forums</div>
            <div className="py-2.5 hover:text-gray-900 cursor-pointer">Web</div>
          </div>

          {/* Results Content Area */}
          <div className="p-4 sm:p-8 max-w-3xl w-full">
            <div className="text-xs text-gray-500 mb-4 flex items-center justify-between">
              <span>About 1 result (0.14 seconds)</span>
            </div>

            {isLoading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-3 text-gray-500">
                <div className="w-9 h-9 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-medium text-gray-600">Generating direct AI Overview...</span>
              </div>
            ) : activeTab.result?.related ? (
              /* AUTHENTIC GOOGLE AI OVERVIEW */
              <div className="space-y-6">
                <div className="border border-[#c2e7ff] bg-gradient-to-b from-[#f0f4f9] via-[#f8fafd] to-white rounded-2xl p-5 sm:p-6 shadow-sm">
                  {/* AI Overview Header Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <GeminiAiIcon size={22} />
                      <span className="font-semibold text-gray-900 text-sm tracking-tight flex items-center gap-1.5">
                        <span>AI Overview</span>
                      </span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium border border-blue-200">
                        Direct Answer
                      </span>
                    </div>

                    <div className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
                      <GeminiAiIcon size={13} />
                      <span>Synthesized response</span>
                    </div>
                  </div>

                  {/* Heading (suppressed if summary is just "You can't") */}
                  {activeTab.result.heading && activeTab.result.summary?.trim() !== "You can't" && (
                    <h2 className="text-lg font-bold text-gray-900 mb-2 leading-snug">
                      {activeTab.result.heading}
                    </h2>
                  )}

                  {/* Direct Summary Answer with Clickable Lore Leads */}
                  {activeTab.result.summary && (
                    <div
                      className={`leading-relaxed whitespace-pre-line font-sans ${
                        activeTab.result.summary.trim() === "You can't"
                          ? 'text-xl sm:text-2xl font-bold text-gray-900 py-1 tracking-wide'
                          : 'text-sm sm:text-base text-gray-800'
                      }`}
                    >
                      <ClickableLoreText
                        text={activeTab.result.summary}
                        onSearch={executeSearch}
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* No Results / Unrelated query error */
              <div className="py-8 text-gray-800">
                <div className="p-5 bg-red-50 border border-red-200 rounded-xl text-red-800 mb-6">
                  <div className="font-bold text-sm mb-1 flex items-center gap-2">
                    <span className="text-base">⚠️</span>
                    <span>An error has occurred</span>
                  </div>
                  <p className="text-xs text-red-700 leading-relaxed">
                    No intelligence documents or AI synthesis could be generated for query: &quot;
                    <span className="font-semibold">{activeTab.query}</span>&quot;.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Google Home Search View */
        <div className="flex-1 bg-white overflow-y-auto p-4 sm:p-6 flex flex-col font-sans select-text">
          <div className="flex-1 flex flex-col items-center justify-center my-auto">
            {/* Google Logo */}
            <div className="text-5xl sm:text-6xl font-bold tracking-tight mb-7 flex items-center select-none">
              <span className="text-[#4285F4]">G</span>
              <span className="text-[#EA4335]">o</span>
              <span className="text-[#FBBC05]">o</span>
              <span className="text-[#4285F4]">g</span>
              <span className="text-[#34A853]">l</span>
              <span className="text-[#EA4335]">e</span>
            </div>

            {/* Central Search Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchInput.trim()) executeSearch(searchInput.trim());
              }}
              className="w-full max-w-[560px] flex items-center bg-white border border-gray-300 hover:shadow-md focus-within:shadow-md rounded-full px-4 py-2.5 transition-shadow"
            >
              <svg className="w-4 h-4 text-gray-400 mr-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                autoFocus
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search Google with AI or type a query"
                className="w-full bg-transparent outline-none text-sm text-gray-800"
              />
              {isLoading && (
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin ml-2 shrink-0" />
              )}
            </form>

            {/* Google Action Buttons */}
            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  if (searchInput.trim()) executeSearch(searchInput.trim());
                }}
                className="bg-[#f8f9fa] hover:bg-[#f1f3f4] border border-transparent hover:border-gray-300 text-xs sm:text-sm text-gray-800 px-4 py-2 rounded font-medium transition-all cursor-pointer"
              >
                Google Search
              </button>
              <button
                type="button"
                onClick={() => {
                  if (searchInput.trim()) executeSearch(searchInput.trim());
                }}
                className="bg-[#f8f9fa] hover:bg-[#f1f3f4] border border-transparent hover:border-gray-300 text-xs sm:text-sm text-gray-800 px-4 py-2 rounded font-medium transition-all cursor-pointer"
              >
                I&apos;m Feeling Lucky
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
