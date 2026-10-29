import React, { useState, useEffect } from 'react';
import { volumeToDbString, clamp } from '../audio';
import { Volume2, VolumeX, AlertTriangle } from 'lucide-react';

interface VolumeControlProps {
  volume: number; // 0 to 1.0
  muted: boolean;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  disabled?: boolean;
}

const PRESETS = [10, 25, 50, 75, 100];

export const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  muted,
  onVolumeChange,
  onMuteToggle,
  disabled = false,
}) => {
  const percentage = Math.round(volume * 100);
  const [inputVal, setInputVal] = useState<string>(percentage.toString());

  useEffect(() => {
    setInputVal(percentage.toString());
  }, [percentage]);

  const commitPercentage = (valStr: string) => {
    const val = parseFloat(valStr);
    if (!isNaN(val)) {
      const clampedPct = clamp(val, 0, 100);
      const newVol = clampedPct / 100;
      onVolumeChange(newVol);
      setInputVal(Math.round(clampedPct).toString());
    } else {
      setInputVal(percentage.toString());
    }
  };

  const isHighVolume = volume > 0.9 && !muted;

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
      {/* Header with Title, dB badge, and Mute Button */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {muted || volume === 0 ? (
            <VolumeX className="w-4 h-4 text-rose-400" />
          ) : (
            <Volume2
              className={`w-4 h-4 ${
                isHighVolume ? 'text-amber-400' : 'text-emerald-400'
              }`}
            />
          )}
          <label
            htmlFor="volume-number-input"
            className="text-sm font-semibold text-slate-200"
          >
            音量設定 (Volume)
          </label>
        </div>

        <div className="flex items-center gap-2">
          {/* Decibel Display */}
          <div className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300">
            {muted ? '消音 (Muted)' : volumeToDbString(volume)}
          </div>

          {/* Mute Toggle Button */}
          <button
            type="button"
            disabled={disabled}
            onClick={onMuteToggle}
            aria-label={muted ? 'ミュート解除' : 'ミュート'}
            className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
              muted
                ? 'bg-rose-600/20 border-rose-500 text-rose-300'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
            } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            {muted ? (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>ミュート中</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span>ミュート</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Slider & Numeric Input Row */}
      <div className="flex items-center gap-4">
        <div className="flex-1 space-y-1">
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={muted ? 0 : percentage}
            disabled={disabled}
            onChange={(e) => {
              const pct = parseFloat(e.target.value);
              onVolumeChange(pct / 100);
            }}
            aria-label="音量スライダー (0% - 100%)"
            className={`w-full h-3 rounded-lg appearance-none cursor-pointer focus:outline-none disabled:opacity-40 bg-slate-800 ${
              isHighVolume ? 'accent-amber-500' : 'accent-emerald-500'
            }`}
          />
        </div>

        {/* Manual Input */}
        <div className="relative flex items-center">
          <input
            id="volume-number-input"
            type="number"
            min="0"
            max="100"
            step="1"
            value={inputVal}
            disabled={disabled || muted}
            onChange={(e) => setInputVal(e.target.value)}
            onBlur={() => commitPercentage(inputVal)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                commitPercentage(inputVal);
                (e.target as HTMLInputElement).blur();
              }
            }}
            className="w-20 sm:w-24 h-10 px-2.5 pr-7 rounded-lg bg-slate-950 border border-slate-700 text-right font-mono text-sm font-semibold text-white focus:outline-none focus:border-indigo-500 disabled:opacity-40"
          />
          <span className="absolute right-2 text-xs text-slate-400 font-mono pointer-events-none">
            %
          </span>
        </div>
      </div>

      {/* High Volume Hearing Protection Warning */}
      {isHighVolume && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs animate-fadeIn">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            大音量注意: 90%以上の音量はヘッドホン使用時に聴覚へ負担をかける可能性があります。
          </span>
        </div>
      )}

      {/* Quick Volume Preset Pills */}
      <div className="pt-1 space-y-2">
        <div className="text-xs text-slate-400">クイック設定 (Presets):</div>
        <div className="grid grid-cols-5 gap-2">
          {PRESETS.map((p) => {
            const isSelected = percentage === p && !muted;
            return (
              <button
                key={p}
                type="button"
                disabled={disabled}
                onClick={() => onVolumeChange(p / 100)}
                className={`min-h-[38px] px-2 py-1.5 rounded-lg text-xs font-mono font-medium border transition-all cursor-pointer select-none active:scale-95 ${
                  isSelected
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-sm'
                    : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/60 text-slate-300 hover:text-white hover:border-slate-600'
                } ${p >= 90 ? 'hover:border-amber-600' : ''} ${
                  disabled ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              >
                {p}%
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VolumeControl;
