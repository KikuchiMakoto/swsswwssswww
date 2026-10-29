import React, { useEffect } from 'react';
import { Play, Square } from 'lucide-react';

interface OutputButtonProps {
  isPlaying: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export const OutputButton: React.FC<OutputButtonProps> = ({
  isPlaying,
  onToggle,
  disabled = false,
}) => {
  // Global spacebar shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        onToggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onToggle]);

  return (
    <div className="flex flex-col items-center justify-center gap-2 w-full">
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        aria-label={isPlaying ? '音声出力を停止' : '音声出力を開始'}
        className={`group relative w-full sm:w-auto sm:min-w-[280px] md:min-w-[340px] min-h-[58px] sm:min-h-[64px] px-8 py-3.5 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-3 transition-all duration-200 cursor-pointer select-none outline-none focus-visible:ring-4 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${
          isPlaying
            ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-xl shadow-emerald-600/30 ring-4 ring-emerald-500/30'
            : 'bg-slate-800 hover:bg-slate-700/90 text-slate-100 border border-slate-700/80 shadow-lg hover:border-slate-600 focus-visible:ring-indigo-500/40'
        }`}
      >
        {isPlaying ? (
          <>
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
              <Square className="relative w-3.5 h-3.5 fill-current text-white" />
            </span>
            <span className="tracking-wide">■ 出力停止 / STOP</span>
          </>
        ) : (
          <>
            <Play className="w-5 h-5 fill-current text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="tracking-wide">▶ 出力開始 / START</span>
          </>
        )}
      </button>

      {/* Keyboard shortcut hint */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 select-none">
        <kbd className="px-2 py-0.5 rounded bg-slate-800/90 border border-slate-700 text-slate-300 font-mono text-[11px] shadow-sm">
          Space
        </kbd>
        <span>キーでON / OFF 切り替え</span>
      </div>
    </div>
  );
};

export default OutputButton;
