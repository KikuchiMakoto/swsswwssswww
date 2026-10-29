import React, { useState, useEffect } from 'react';
import {
  SweepScale,
  frequencyToSlider,
  sliderToFrequency,
  AUDIO_BOUNDS,
  clamp,
  formatDuration,
  durationToSlider,
  sliderToDuration,
} from '../audio';
import { ArrowLeftRight, TrendingUp, Clock, Scale } from 'lucide-react';

interface SweepControlsProps {
  startFreq: number;
  endFreq: number;
  duration: number;
  scale: SweepScale;
  onStartFreqChange: (freq: number) => void;
  onEndFreqChange: (freq: number) => void;
  onDurationChange: (duration: number) => void;
  onScaleChange: (scale: SweepScale) => void;
  onSwap: () => void;
  disabled?: boolean;
}

const SWEEP_DURATION_PRESETS = [
  { label: '1秒', value: 1.0 },
  { label: '2秒', value: 2.0 },
  { label: '5秒', value: 5.0 },
  { label: '10秒', value: 10.0 },
  { label: '30秒', value: 30.0 },
  { label: '1分', value: 60.0 },
  { label: '5分', value: 300.0 },
  { label: '600秒 (10分)', value: 600.0 },
  { label: '1000秒', value: 1000.0 },
];

export const SweepControls: React.FC<SweepControlsProps> = ({
  startFreq,
  endFreq,
  duration,
  scale,
  onStartFreqChange,
  onEndFreqChange,
  onDurationChange,
  onScaleChange,
  onSwap,
  disabled = false,
}) => {
  const [startInput, setStartInput] = useState<string>(startFreq.toString());
  const [endInput, setEndInput] = useState<string>(endFreq.toString());
  const [durationInput, setDurationInput] = useState<string>(duration.toString());

  useEffect(() => {
    setStartInput(startFreq.toString());
  }, [startFreq]);

  useEffect(() => {
    setEndInput(endFreq.toString());
  }, [endFreq]);

  useEffect(() => {
    setDurationInput(duration.toString());
  }, [duration]);

  const commitStart = (valStr: string) => {
    const val = parseFloat(valStr);
    if (!isNaN(val)) {
      const clamped = Math.round(
        clamp(val, AUDIO_BOUNDS.sweepStartFreq.min, AUDIO_BOUNDS.sweepStartFreq.max)
      );
      onStartFreqChange(clamped);
      setStartInput(clamped.toString());
    } else {
      setStartInput(startFreq.toString());
    }
  };

  const commitEnd = (valStr: string) => {
    const val = parseFloat(valStr);
    if (!isNaN(val)) {
      const clamped = Math.round(
        clamp(val, AUDIO_BOUNDS.sweepEndFreq.min, AUDIO_BOUNDS.sweepEndFreq.max)
      );
      onEndFreqChange(clamped);
      setEndInput(clamped.toString());
    } else {
      setEndInput(endFreq.toString());
    }
  };

  const commitDuration = (valStr: string) => {
    const val = parseFloat(valStr);
    if (!isNaN(val)) {
      const clamped =
        Math.round(
          clamp(val, AUDIO_BOUNDS.sweepDuration.min, AUDIO_BOUNDS.sweepDuration.max) * 10
        ) / 10;
      onDurationChange(clamped);
      setDurationInput(clamped.toString());
    } else {
      setDurationInput(duration.toString());
    }
  };

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-5">
      {/* Header with Title and Swap Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-semibold text-slate-200">
            周波数スイープ設定 (Frequency Sweep)
          </h2>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={onSwap}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-40"
          title="開始と終了の周波数を入れ替え"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-400" />
          <span>周波数入替 (⇄)</span>
        </button>
      </div>

      {/* Start Frequency (f_start) */}
      <div className="space-y-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
        <div className="flex items-center justify-between">
          <label
            htmlFor="start-freq-input"
            className="text-xs font-semibold text-slate-300"
          >
            開始周波数 (Start Frequency: f<sub className="text-[10px]">start</sub>)
          </label>
          <div className="relative flex items-center">
            <input
              id="start-freq-input"
              type="number"
              min={AUDIO_BOUNDS.sweepStartFreq.min}
              max={AUDIO_BOUNDS.sweepStartFreq.max}
              value={startInput}
              disabled={disabled}
              onChange={(e) => setStartInput(e.target.value)}
              onBlur={() => commitStart(startInput)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  commitStart(startInput);
                  (e.target as HTMLInputElement).blur();
                }
              }}
              className="w-24 sm:w-28 h-8 px-2.5 pr-7 rounded bg-slate-900 border border-slate-700 text-right font-mono text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
            />
            <span className="absolute right-2 text-[10px] text-slate-400 font-mono pointer-events-none">
              Hz
            </span>
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="0.05"
          value={frequencyToSlider(startFreq)}
          disabled={disabled}
          onChange={(e) => {
            const next = Math.round(sliderToFrequency(parseFloat(e.target.value)));
            onStartFreqChange(next);
          }}
          aria-label="開始周波数スライダー"
          className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none disabled:opacity-40"
        />
        <div className="flex justify-between text-[10px] font-mono text-slate-400">
          <span>20 Hz</span>
          <span>1 kHz</span>
          <span>20 kHz</span>
        </div>
      </div>

      {/* End Frequency (f_end) */}
      <div className="space-y-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
        <div className="flex items-center justify-between">
          <label
            htmlFor="end-freq-input"
            className="text-xs font-semibold text-slate-300"
          >
            終了周波数 (End Frequency: f<sub className="text-[10px]">end</sub>)
          </label>
          <div className="relative flex items-center">
            <input
              id="end-freq-input"
              type="number"
              min={AUDIO_BOUNDS.sweepEndFreq.min}
              max={AUDIO_BOUNDS.sweepEndFreq.max}
              value={endInput}
              disabled={disabled}
              onChange={(e) => setEndInput(e.target.value)}
              onBlur={() => commitEnd(endInput)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  commitEnd(endInput);
                  (e.target as HTMLInputElement).blur();
                }
              }}
              className="w-24 sm:w-28 h-8 px-2.5 pr-7 rounded bg-slate-900 border border-slate-700 text-right font-mono text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
            />
            <span className="absolute right-2 text-[10px] text-slate-400 font-mono pointer-events-none">
              Hz
            </span>
          </div>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="0.05"
          value={frequencyToSlider(endFreq)}
          disabled={disabled}
          onChange={(e) => {
            const next = Math.round(sliderToFrequency(parseFloat(e.target.value)));
            onEndFreqChange(next);
          }}
          aria-label="終了周波数スライダー"
          className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none disabled:opacity-40"
        />
        <div className="flex justify-between text-[10px] font-mono text-slate-400">
          <span>20 Hz</span>
          <span>1 kHz</span>
          <span>20 kHz</span>
        </div>
      </div>

      {/* Sweep Duration & Scale Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Sweep Duration (0.1s - 1000.0s) */}
        <div className="space-y-2.5 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <label
                htmlFor="duration-input"
                className="text-xs font-semibold text-slate-300"
              >
                スイープ時間 (Duration)
              </label>
              <span className="text-[11px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                {formatDuration(duration)}
              </span>
            </div>
            <div className="relative flex items-center">
              <input
                id="duration-input"
                type="number"
                min={AUDIO_BOUNDS.sweepDuration.min}
                max={AUDIO_BOUNDS.sweepDuration.max}
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
                className="w-24 h-8 px-2 pr-6 rounded bg-slate-900 border border-slate-700 text-right font-mono text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
              />
              <span className="absolute right-2 text-[10px] text-slate-400 font-mono pointer-events-none">
                s
              </span>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={durationToSlider(duration, AUDIO_BOUNDS.sweepDuration.min, AUDIO_BOUNDS.sweepDuration.max)}
            disabled={disabled}
            onChange={(e) => {
              const sec = sliderToDuration(
                parseFloat(e.target.value),
                AUDIO_BOUNDS.sweepDuration.min,
                AUDIO_BOUNDS.sweepDuration.max
              );
              onDurationChange(sec);
            }}
            aria-label="スイープ時間スライダー"
            className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none disabled:opacity-40"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>0.1s</span>
            <span>1秒</span>
            <span>10秒</span>
            <span>1分</span>
            <span>1000秒</span>
          </div>

          {/* Quick presets: [1秒], [2秒], [5秒], [10秒], [30秒], [1分], [5分], [600秒 (10分)], [1000秒] */}
          <div className="space-y-1 pt-1">
            <div className="text-[10px] text-slate-400 font-medium">クイックプリセット</div>
            <div className="flex flex-wrap gap-1.5">
              {SWEEP_DURATION_PRESETS.map((preset) => {
                const isActive = Math.abs(duration - preset.value) < 0.01;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    disabled={disabled}
                    onClick={() => onDurationChange(preset.value)}
                    className={`px-2 py-1 rounded text-[11px] font-mono transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 border border-indigo-400 text-white font-semibold shadow-sm'
                        : 'bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scale Toggle: Logarithmic vs Linear */}
        <div className="space-y-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs font-semibold text-slate-300">
              変化スケール (Scale)
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              disabled={disabled}
              onClick={() => onScaleChange('logarithmic')}
              className={`h-9 px-2 rounded-lg text-xs font-medium border flex items-center justify-center transition-all cursor-pointer ${
                scale === 'logarithmic'
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              対数 (Log)
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onScaleChange('linear')}
              className={`h-9 px-2 rounded-lg text-xs font-medium border flex items-center justify-center transition-all cursor-pointer ${
                scale === 'linear'
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              線形 (Linear)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SweepControls;
