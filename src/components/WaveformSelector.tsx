import React from 'react';
import { WaveformType } from '../audio';

interface WaveformSelectorProps {
  value: WaveformType;
  onChange: (value: WaveformType) => void;
  disabled?: boolean;
}

interface WaveformOption {
  type: WaveformType;
  label: string;
  subLabel: string;
  icon: React.ReactNode;
}

export const WaveformSelector: React.FC<WaveformSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const options: WaveformOption[] = [
    {
      type: 'sine',
      label: 'サイン波',
      subLabel: 'Sine',
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <path d="M 2 12 C 5 3, 7 3, 10 12 C 13 21, 15 21, 18 12 C 20 6, 21 6, 22 12" />
        </svg>
      ),
    },
    {
      type: 'triangle',
      label: '三角波',
      subLabel: 'Triangle',
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <path d="M 2 18 L 8 6 L 14 18 L 20 6 L 22 10" />
        </svg>
      ),
    },
    {
      type: 'square',
      label: '矩形波',
      subLabel: 'Square',
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <path d="M 2 18 L 2 6 L 9 6 L 9 18 L 16 18 L 16 6 L 22 6" />
        </svg>
      ),
    },
    {
      type: 'sweep',
      label: 'スイープ',
      subLabel: 'Sweep',
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <path d="M 2 12 C 4 4, 6 20, 8 12 C 9.5 5, 11 19, 12.5 12 C 13.8 6, 15 18, 16.2 12 C 17.2 7, 18.2 17, 19.2 12 L 22 12" />
        </svg>
      ),
    },
  ];

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-200">
          波形選択 (Waveform)
        </label>
        <span className="text-xs text-slate-400">
          {options.find((o) => o.type === value)?.subLabel} Wave
        </span>
      </div>

      {/* Segmented Grid Controls */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {options.map((opt) => {
          const isSelected = value === opt.type;
          return (
            <button
              key={opt.type}
              type="button"
              disabled={disabled}
              onClick={() => onChange(opt.type)}
              className={`min-h-[50px] p-2.5 rounded-xl border flex items-center justify-center gap-2.5 transition-all duration-150 cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 ${
                isSelected
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                  : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/60 text-slate-300 hover:text-slate-100 hover:border-slate-600'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div
                className={`transition-colors ${
                  isSelected ? 'text-indigo-400' : 'text-slate-400'
                }`}
              >
                {opt.icon}
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold leading-tight">
                  {opt.label}
                </div>
                <div className="text-[10px] text-slate-400 leading-tight">
                  {opt.subLabel}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WaveformSelector;
