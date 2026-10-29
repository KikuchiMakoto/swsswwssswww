import React from 'react';
import { PlayMode } from '../audio';
import { Repeat, Zap, Disc } from 'lucide-react';

interface PlayModeSelectorProps {
  value: PlayMode;
  onChange: (value: PlayMode) => void;
  disabled?: boolean;
}

interface ModeOption {
  type: PlayMode;
  label: string;
  subLabel: string;
  desc: string;
  icon: React.ReactNode;
}

export const PlayModeSelector: React.FC<PlayModeSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const options: ModeOption[] = [
    {
      type: 'continuous',
      label: '連続',
      subLabel: 'Continuous',
      desc: '継続的に発振し続けます',
      icon: <Repeat className="w-4 h-4" />,
    },
    {
      type: 'burst',
      label: 'バースト',
      subLabel: 'Burst',
      desc: '発振と休止を周期的に繰り返します',
      icon: <Zap className="w-4 h-4" />,
    },
    {
      type: 'oneshot',
      label: '単発',
      subLabel: 'One-shot',
      desc: '指定時間だけ発振して自動停止します',
      icon: <Disc className="w-4 h-4" />,
    },
  ];

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-200">
          発振モード (Playback Mode)
        </label>
        <span className="text-xs text-slate-400">
          {options.find((o) => o.type === value)?.subLabel} Mode
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {options.map((opt) => {
          const isSelected = value === opt.type;
          return (
            <button
              key={opt.type}
              type="button"
              disabled={disabled}
              onClick={() => onChange(opt.type)}
              className={`min-h-[50px] p-3 rounded-xl border flex items-center sm:flex-col sm:items-start justify-between sm:justify-center gap-2 transition-all duration-150 cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 ${
                isSelected
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                  : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/60 text-slate-300 hover:text-slate-100 hover:border-slate-600'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`transition-colors ${
                    isSelected ? 'text-indigo-400' : 'text-slate-400'
                  }`}
                >
                  {opt.icon}
                </div>
                <div className="text-xs font-semibold leading-tight">
                  {opt.label}
                  <span className="ml-1.5 text-[11px] font-normal text-slate-400">
                    ({opt.subLabel})
                  </span>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 sm:block text-left hidden">
                {opt.desc}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PlayModeSelector;
