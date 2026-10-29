import React, { useState, useEffect } from 'react';
import { clamp } from '../audio';
import { Zap, Clock, Timer } from 'lucide-react';

interface BurstControlsProps {
  activeDuration: number; // in seconds, e.g. 0.2 (200ms)
  pauseDuration: number; // in seconds, e.g. 0.3 (300ms)
  onActiveDurationChange: (sec: number) => void;
  onPauseDurationChange: (sec: number) => void;
  disabled?: boolean;
}

export const BurstControls: React.FC<BurstControlsProps> = ({
  activeDuration,
  pauseDuration,
  onActiveDurationChange,
  onPauseDurationChange,
  disabled = false,
}) => {
  // Convert seconds to ms for intuitive manual input
  const [activeMsInput, setActiveMsInput] = useState<string>(
    Math.round(activeDuration * 1000).toString()
  );
  const [pauseMsInput, setPauseMsInput] = useState<string>(
    Math.round(pauseDuration * 1000).toString()
  );

  useEffect(() => {
    setActiveMsInput(Math.round(activeDuration * 1000).toString());
  }, [activeDuration]);

  useEffect(() => {
    setPauseMsInput(Math.round(pauseDuration * 1000).toString());
  }, [pauseDuration]);

  const commitActiveMs = (valStr: string) => {
    const val = parseFloat(valStr);
    if (!isNaN(val)) {
      const sec = clamp(val / 1000, 0.05, 2.0);
      const rounded = Math.round(sec * 1000) / 1000;
      onActiveDurationChange(rounded);
      setActiveMsInput(Math.round(rounded * 1000).toString());
    } else {
      setActiveMsInput(Math.round(activeDuration * 1000).toString());
    }
  };

  const commitPauseMs = (valStr: string) => {
    const val = parseFloat(valStr);
    if (!isNaN(val)) {
      const sec = clamp(val / 1000, 0.05, 2.0);
      const rounded = Math.round(sec * 1000) / 1000;
      onPauseDurationChange(rounded);
      setPauseMsInput(Math.round(rounded * 1000).toString());
    } else {
      setPauseMsInput(Math.round(pauseDuration * 1000).toString());
    }
  };

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-amber-400" />
        <h2 className="text-sm font-semibold text-slate-200">
          バースト設定 (Burst Parameters)
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Active Duration */}
        <div className="space-y-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <label
              htmlFor="burst-active-input"
              className="text-xs font-semibold text-slate-300 flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>発振時間 (Active)</span>
            </label>
            <div className="relative flex items-center">
              <input
                id="burst-active-input"
                type="number"
                min="50"
                max="2000"
                step="10"
                value={activeMsInput}
                disabled={disabled}
                onChange={(e) => setActiveMsInput(e.target.value)}
                onBlur={() => commitActiveMs(activeMsInput)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    commitActiveMs(activeMsInput);
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                className="w-20 h-8 px-2 pr-7 rounded bg-slate-900 border border-slate-700 text-right font-mono text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
              />
              <span className="absolute right-2 text-[10px] text-slate-400 font-mono pointer-events-none">
                ms
              </span>
            </div>
          </div>
          <input
            type="range"
            min="0.05"
            max="2.0"
            step="0.01"
            value={activeDuration}
            disabled={disabled}
            onChange={(e) => onActiveDurationChange(parseFloat(e.target.value))}
            aria-label="バースト発振時間スライダー"
            className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none disabled:opacity-40"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>50ms (0.05s)</span>
            <span>{(activeDuration * 1000).toFixed(0)}ms</span>
            <span>2000ms (2.0s)</span>
          </div>
        </div>

        {/* Pause Duration */}
        <div className="space-y-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <label
              htmlFor="burst-pause-input"
              className="text-xs font-semibold text-slate-300 flex items-center gap-1.5"
            >
              <Timer className="w-3.5 h-3.5 text-amber-400" />
              <span>休止時間 (Pause)</span>
            </label>
            <div className="relative flex items-center">
              <input
                id="burst-pause-input"
                type="number"
                min="50"
                max="2000"
                step="10"
                value={pauseMsInput}
                disabled={disabled}
                onChange={(e) => setPauseMsInput(e.target.value)}
                onBlur={() => commitPauseMs(pauseMsInput)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    commitPauseMs(pauseMsInput);
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                className="w-20 h-8 px-2 pr-7 rounded bg-slate-900 border border-slate-700 text-right font-mono text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
              />
              <span className="absolute right-2 text-[10px] text-slate-400 font-mono pointer-events-none">
                ms
              </span>
            </div>
          </div>
          <input
            type="range"
            min="0.05"
            max="2.0"
            step="0.01"
            value={pauseDuration}
            disabled={disabled}
            onChange={(e) => onPauseDurationChange(parseFloat(e.target.value))}
            aria-label="バースト休止時間スライダー"
            className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none disabled:opacity-40"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>50ms (0.05s)</span>
            <span>{(pauseDuration * 1000).toFixed(0)}ms</span>
            <span>2000ms (2.0s)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface OneShotControlsProps {
  duration: number; // in seconds, e.g. 1.0 (0.1s - 10.0s)
  onChange: (sec: number) => void;
  disabled?: boolean;
}

export const OneShotControls: React.FC<OneShotControlsProps> = ({
  duration,
  onChange,
  disabled = false,
}) => {
  const [durationInput, setDurationInput] = useState<string>(duration.toString());

  useEffect(() => {
    setDurationInput(duration.toString());
  }, [duration]);

  const commitDuration = (valStr: string) => {
    const val = parseFloat(valStr);
    if (!isNaN(val)) {
      const clamped = Math.round(clamp(val, 0.1, 10.0) * 10) / 10;
      onChange(clamped);
      setDurationInput(clamped.toString());
    } else {
      setDurationInput(duration.toString());
    }
  };

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
      <div className="flex items-center gap-2">
        <Timer className="w-4 h-4 text-indigo-400" />
        <h2 className="text-sm font-semibold text-slate-200">
          単発発振設定 (One-shot Parameters)
        </h2>
      </div>

      <div className="space-y-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
        <div className="flex items-center justify-between">
          <label
            htmlFor="oneshot-duration-input"
            className="text-xs font-semibold text-slate-300"
          >
            発振時間 (Duration)
          </label>
          <div className="relative flex items-center">
            <input
              id="oneshot-duration-input"
              type="number"
              min="0.1"
              max="10.0"
              step="0.1"
              value={durationInput}
              disabled={disabled}
              onChange={(e) => setDurationInput(e.target.value)}
              onBlur={() => commitDuration(durationInput)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  commitDuration(durationInput);
                  (e.target as HTMLInputElement).blur();
                }
              }}
              className="w-20 h-8 px-2 pr-6 rounded bg-slate-900 border border-slate-700 text-right font-mono text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
            />
            <span className="absolute right-2 text-[10px] text-slate-400 font-mono pointer-events-none">
              s
            </span>
          </div>
        </div>
        <input
          type="range"
          min="0.1"
          max="10.0"
          step="0.1"
          value={duration}
          disabled={disabled}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          aria-label="単発発振時間スライダー"
          className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none disabled:opacity-40"
        />
        <div className="flex justify-between text-[10px] font-mono text-slate-400">
          <span>0.1s</span>
          <span>{duration.toFixed(1)}s</span>
          <span>10.0s</span>
        </div>
      </div>
    </div>
  );
};

export default BurstControls;
