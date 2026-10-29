import React, { useState, useEffect } from 'react';
import {
  frequencyToSlider,
  sliderToFrequency,
  AUDIO_BOUNDS,
  clamp,
} from '../audio';
import { Sliders, Minus, Plus } from 'lucide-react';

interface FrequencyControlProps {
  frequency: number;
  onChange: (freq: number) => void;
  disabled?: boolean;
}

interface PresetItem {
  label: string;
  value: number;
}

const PRESETS: PresetItem[] = [
  { label: '100 Hz', value: 100 },
  { label: '440 Hz (A4)', value: 440 },
  { label: '1 kHz', value: 1000 },
  { label: '5 kHz', value: 5000 },
  { label: '10 kHz', value: 10000 },
  { label: '15 kHz', value: 15000 },
];

export const FrequencyControl: React.FC<FrequencyControlProps> = ({
  frequency,
  onChange,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState<string>(frequency.toString());

  useEffect(() => {
    setInputValue(frequency.toString());
  }, [frequency]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pct = parseFloat(e.target.value);
    const newFreq = sliderToFrequency(pct);
    const rounded = Math.round(newFreq);
    onChange(rounded);
  };

  const commitValue = (valStr: string) => {
    const parsed = parseFloat(valStr);
    if (!isNaN(parsed)) {
      const clamped = clamp(
        parsed,
        AUDIO_BOUNDS.frequency.min,
        AUDIO_BOUNDS.frequency.max
      );
      onChange(Math.round(clamped));
      setInputValue(Math.round(clamped).toString());
    } else {
      setInputValue(frequency.toString());
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    commitValue(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commitValue(inputValue);
      (e.target as HTMLInputElement).blur();
    }
  };

  const adjustFrequency = (delta: number) => {
    const next = clamp(
      frequency + delta,
      AUDIO_BOUNDS.frequency.min,
      AUDIO_BOUNDS.frequency.max
    );
    onChange(Math.round(next));
  };

  const sliderPercent = frequencyToSlider(frequency);

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
      {/* Title & Numeric Input Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-400" />
          <label
            htmlFor="freq-input"
            className="text-sm font-semibold text-slate-200"
          >
            周波数設定 (Frequency)
          </label>
        </div>

        {/* Manual Input + Steppers */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={disabled || frequency <= AUDIO_BOUNDS.frequency.min}
            onClick={() => adjustFrequency(-1)}
            aria-label="周波数を1Hz下げる"
            className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700/60 text-slate-300 flex items-center justify-center transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Minus className="w-4 h-4" />
          </button>

          <div className="relative flex items-center">
            <input
              id="freq-input"
              type="number"
              min={AUDIO_BOUNDS.frequency.min}
              max={AUDIO_BOUNDS.frequency.max}
              step="1"
              value={inputValue}
              disabled={disabled}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              className="w-28 sm:w-32 h-10 px-3 pr-8 rounded-lg bg-slate-950 border border-slate-700 text-right font-mono text-base font-semibold text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
            />
            <span className="absolute right-2.5 text-xs text-slate-400 font-mono pointer-events-none">
              Hz
            </span>
          </div>

          <button
            type="button"
            disabled={disabled || frequency >= AUDIO_BOUNDS.frequency.max}
            onClick={() => adjustFrequency(+1)}
            aria-label="周波数を1Hz上げる"
            className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700/60 text-slate-300 flex items-center justify-center transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Logarithmic Slider */}
      <div className="space-y-1.5 pt-1">
        <div className="relative flex items-center">
          <input
            type="range"
            min="0"
            max="100"
            step="0.05"
            value={sliderPercent}
            disabled={disabled}
            onChange={handleSliderChange}
            aria-label="周波数スライダー (対数スケール)"
            className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none disabled:opacity-40"
          />
        </div>
        <div className="flex justify-between text-[11px] font-mono text-slate-400">
          <span>20 Hz</span>
          <span className="hidden xs:inline">100 Hz</span>
          <span>1 kHz</span>
          <span className="hidden xs:inline">5 kHz</span>
          <span>20 kHz</span>
        </div>
      </div>

      {/* Preset Frequency Pills */}
      <div className="pt-1 space-y-2">
        <div className="text-xs text-slate-400">プリセット (Presets):</div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => {
            const isSelected = frequency === preset.value;
            return (
              <button
                key={preset.value}
                type="button"
                disabled={disabled}
                onClick={() => onChange(preset.value)}
                className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer select-none active:scale-95 ${
                  isSelected
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-sm'
                    : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/60 text-slate-300 hover:text-white hover:border-slate-600'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FrequencyControl;
