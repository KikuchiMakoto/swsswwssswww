import React, { useState, useEffect } from 'react';
import {
  BurstUnit,
  AUDIO_BOUNDS,
  clamp,
  calculateCycleDuration,
  calculateEquivalentCycles,
  formatDuration,
  durationToSlider,
  sliderToDuration,
} from '../audio';
import { Zap, Clock, Timer, Activity } from 'lucide-react';

export interface BurstControlsProps {
  unit?: BurstUnit;
  cycles?: number;
  activeDuration?: number; // in seconds, e.g. 0.1 (100ms)
  pauseDuration: number; // in seconds, e.g. 0.2 (200ms)
  frequency?: number; // current frequency in Hz (default 440)
  onUnitChange?: (unit: BurstUnit) => void;
  onCyclesChange?: (cycles: number) => void;
  onActiveDurationChange?: (sec: number) => void;
  onPauseDurationChange: (sec: number) => void;
  disabled?: boolean;
}

function formatCycleDuration(sec: number): string {
  if (sec >= 1) {
    return `${sec.toFixed(2)} s`;
  }
  if (sec >= 0.01) {
    return `${(sec * 1000).toFixed(1)} ms`;
  }
  return `${(sec * 1000).toFixed(2)} ms`;
}

const BURST_CYCLE_PRESETS = [
  { label: '1波 (デフォルト)', value: 1 },
  { label: '2波', value: 2 },
  { label: '5波', value: 5 },
  { label: '10波', value: 10 },
  { label: '20波', value: 20 },
  { label: '50波', value: 50 },
  { label: '100波', value: 100 },
];

const ACTIVE_TIME_PRESETS = [
  { label: '10ms', value: 0.01 },
  { label: '50ms', value: 0.05 },
  { label: '100ms', value: 0.1 },
  { label: '200ms', value: 0.2 },
  { label: '500ms', value: 0.5 },
  { label: '1.0秒', value: 1.0 },
];

const PAUSE_PRESETS = [
  { label: '50ms', value: 0.05 },
  { label: '100ms', value: 0.1 },
  { label: '200ms', value: 0.2 },
  { label: '500ms', value: 0.5 },
  { label: '1.0秒', value: 1.0 },
  { label: '2.0秒', value: 2.0 },
];

export const BurstControls: React.FC<BurstControlsProps> = ({
  unit = 'cycles',
  cycles = 1,
  activeDuration = 0.1,
  pauseDuration = 0.2,
  frequency = 440,
  onUnitChange,
  onCyclesChange,
  onActiveDurationChange,
  onPauseDurationChange,
  disabled = false,
}) => {
  const [localUnit, setLocalUnit] = useState<BurstUnit>(unit);
  const currentUnit = onUnitChange ? unit : localUnit;

  const [cyclesInput, setCyclesInput] = useState<string>(cycles.toString());
  const [activeMsInput, setActiveMsInput] = useState<string>(
    Math.round(activeDuration * 1000).toString()
  );
  const [pauseMsInput, setPauseMsInput] = useState<string>(
    Math.round(pauseDuration * 1000).toString()
  );

  useEffect(() => {
    setLocalUnit(unit);
  }, [unit]);

  useEffect(() => {
    setCyclesInput(cycles.toString());
  }, [cycles]);

  useEffect(() => {
    setActiveMsInput(Math.round(activeDuration * 1000).toString());
  }, [activeDuration]);

  useEffect(() => {
    setPauseMsInput(Math.round(pauseDuration * 1000).toString());
  }, [pauseDuration]);

  const handleUnitSelect = (newUnit: BurstUnit) => {
    if (onUnitChange) {
      onUnitChange(newUnit);
    } else {
      setLocalUnit(newUnit);
    }
  };

  const commitCycles = (valStr: string) => {
    const val = parseInt(valStr, 10);
    if (!isNaN(val)) {
      const clamped = clamp(val, AUDIO_BOUNDS.burstCycles.min, AUDIO_BOUNDS.burstCycles.max);
      onCyclesChange?.(clamped);
      setCyclesInput(clamped.toString());
    } else {
      setCyclesInput(cycles.toString());
    }
  };

  const commitActiveMs = (valStr: string) => {
    const val = parseFloat(valStr);
    if (!isNaN(val)) {
      const sec = clamp(val / 1000, 0.001, 2.0);
      const rounded = Math.round(sec * 1000) / 1000;
      onActiveDurationChange?.(rounded);
      setActiveMsInput(Math.round(rounded * 1000).toString());
    } else {
      setActiveMsInput(Math.round(activeDuration * 1000).toString());
    }
  };

  const commitPauseMs = (valStr: string) => {
    const val = parseFloat(valStr);
    if (!isNaN(val)) {
      const sec = clamp(val / 1000, 0.01, 5.0);
      const rounded = Math.round(sec * 1000) / 1000;
      onPauseDurationChange(rounded);
      setPauseMsInput(Math.round(rounded * 1000).toString());
    } else {
      setPauseMsInput(Math.round(pauseDuration * 1000).toString());
    }
  };

  // Conversions for badges
  const cycleDurationSec = calculateCycleDuration(cycles, frequency);
  const formattedCycleDuration = formatCycleDuration(cycleDurationSec);

  const eqCycles = calculateEquivalentCycles(activeDuration, frequency);
  const activeDurationDisplay =
    activeDuration >= 1 ? `${activeDuration.toFixed(1)} s` : `${Math.round(activeDuration * 1000)} ms`;

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-semibold text-slate-200">
            バースト設定 (Burst Parameters)
          </h2>
        </div>
      </div>

      {/* Segmented Toggle at the Top */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800/80">
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleUnitSelect('cycles')}
          className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            currentUnit === 'cycles'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>波数指定 (基本・デフォルト)</span>
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleUnitSelect('time')}
          className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            currentUnit === 'time'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>秒数指定</span>
        </button>
      </div>

      {/* Main Parameters Box */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Active Portion (Cycles vs Time) */}
        {currentUnit === 'cycles' ? (
          <div className="space-y-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between">
              <label
                htmlFor="burst-cycles-input"
                className="text-xs font-semibold text-slate-300 flex items-center gap-1.5"
              >
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                <span>発振波数 (Wave Cycles)</span>
              </label>
              <div className="relative flex items-center">
                <input
                  id="burst-cycles-input"
                  type="number"
                  min="1"
                  max="10000"
                  step="1"
                  value={cyclesInput}
                  disabled={disabled}
                  onChange={(e) => setCyclesInput(e.target.value)}
                  onBlur={() => commitCycles(cyclesInput)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      commitCycles(cyclesInput);
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  className="w-20 h-8 px-2 pr-7 rounded bg-slate-900 border border-slate-700 text-right font-mono text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
                />
                <span className="absolute right-2 text-[10px] text-slate-400 font-mono pointer-events-none">
                  波
                </span>
              </div>
            </div>

            {/* Cycle Count Slider */}
            <input
              type="range"
              min="1"
              max="100"
              step="1"
              value={Math.min(100, Math.max(1, cycles))}
              disabled={disabled}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                onCyclesChange?.(val);
              }}
              aria-label="バースト発振波数スライダー"
              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none disabled:opacity-40"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>1波</span>
              <span>{cycles}波</span>
              <span>100波</span>
            </div>

            {/* Real-time conversion badge */}
            <div className="flex items-center">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-mono font-medium">
                ⚡ {cycles}波 = {formattedCycleDuration} (@{Math.round(frequency)}Hz)
              </span>
            </div>

            {/* Presets: 1波 (デフォルト), 2波, 5波, 10波, 20波, 50波, 100波 */}
            <div className="space-y-1">
              <div className="text-[10px] text-slate-400 font-medium">クイックプリセット</div>
              <div className="flex flex-wrap gap-1.5">
                {BURST_CYCLE_PRESETS.map((preset) => {
                  const isActive = cycles === preset.value;
                  return (
                    <button
                      key={preset.value}
                      type="button"
                      disabled={disabled}
                      onClick={() => onCyclesChange?.(preset.value)}
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
        ) : (
          <div className="space-y-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
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
                  min="1"
                  max="2000"
                  step="1"
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

            {/* Active Duration Slider (0.001s to 2.0s / 1ms to 2000ms) */}
            <input
              type="range"
              min="0.001"
              max="2.0"
              step="0.001"
              value={activeDuration}
              disabled={disabled}
              onChange={(e) => onActiveDurationChange?.(parseFloat(e.target.value))}
              aria-label="バースト発振時間スライダー"
              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none disabled:opacity-40"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>1ms</span>
              <span>{(activeDuration * 1000).toFixed(0)}ms</span>
              <span>2000ms (2.0s)</span>
            </div>

            {/* Real-time conversion badge */}
            <div className="flex items-center">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-mono font-medium">
                ⚡ {activeDurationDisplay} ≈ {eqCycles.toFixed(1)}波 (@{Math.round(frequency)}Hz)
              </span>
            </div>

            {/* Presets: 10ms, 50ms, 100ms, 200ms, 500ms, 1.0秒 */}
            <div className="space-y-1">
              <div className="text-[10px] text-slate-400 font-medium">クイックプリセット</div>
              <div className="flex flex-wrap gap-1.5">
                {ACTIVE_TIME_PRESETS.map((preset) => {
                  const isActive = Math.abs(activeDuration - preset.value) < 0.0005;
                  return (
                    <button
                      key={preset.value}
                      type="button"
                      disabled={disabled}
                      onClick={() => onActiveDurationChange?.(preset.value)}
                      className={`px-2 py-1 rounded text-[11px] font-mono transition-all cursor-pointer ${
                        isActive
                          ? 'bg-emerald-600 border border-emerald-400 text-white font-semibold shadow-sm'
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
        )}

        {/* Pause Duration (10ms to 5000ms / 5.0s, default 200ms) */}
        <div className="space-y-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
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
                min="10"
                max="5000"
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
            min="0.01"
            max="5.0"
            step="0.01"
            value={pauseDuration}
            disabled={disabled}
            onChange={(e) => onPauseDurationChange(parseFloat(e.target.value))}
            aria-label="バースト休止時間スライダー"
            className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none disabled:opacity-40"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>10ms</span>
            <span>{formatDuration(pauseDuration)}</span>
            <span>5.0s</span>
          </div>

          {/* Quick presets: 50ms, 100ms, 200ms, 500ms, 1.0秒, 2.0秒 */}
          <div className="space-y-1">
            <div className="text-[10px] text-slate-400 font-medium">クイックプリセット</div>
            <div className="flex flex-wrap gap-1.5">
              {PAUSE_PRESETS.map((preset) => {
                const isActive = Math.abs(pauseDuration - preset.value) < 0.005;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    disabled={disabled}
                    onClick={() => onPauseDurationChange(preset.value)}
                    className={`px-2 py-1 rounded text-[11px] font-mono transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-600 border border-amber-400 text-white font-semibold shadow-sm'
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
      </div>
    </div>
  );
};

export interface OneShotControlsProps {
  duration: number; // in seconds, up to 1000.0s
  unit?: 'time' | 'cycles';
  cycles?: number;
  frequency?: number;
  onDurationChange?: (sec: number) => void;
  onChange?: (sec: number) => void;
  onUnitChange?: (unit: 'time' | 'cycles') => void;
  onCyclesChange?: (cycles: number) => void;
  disabled?: boolean;
}

const ONESHOT_TIME_PRESETS = [
  { label: '1秒', value: 1.0 },
  { label: '5秒', value: 5.0 },
  { label: '10秒', value: 10.0 },
  { label: '30秒', value: 30.0 },
  { label: '1分', value: 60.0 },
  { label: '5分', value: 300.0 },
  { label: '600秒 (10分)', value: 600.0 },
  { label: '1000秒', value: 1000.0 },
];

const ONESHOT_CYCLE_PRESETS = [
  { label: '1波 (デフォルト)', value: 1 },
  { label: '2波', value: 2 },
  { label: '5波', value: 5 },
  { label: '10波', value: 10 },
  { label: '20波', value: 20 },
  { label: '100波', value: 100 },
];

export const OneShotControls: React.FC<OneShotControlsProps> = ({
  duration,
  unit = 'time',
  cycles = 1,
  frequency = 440,
  onDurationChange,
  onChange,
  onUnitChange,
  onCyclesChange,
  disabled = false,
}) => {
  const [localUnit, setLocalUnit] = useState<'time' | 'cycles'>(unit);
  const currentUnit = onUnitChange ? unit : localUnit;

  const [durationInput, setDurationInput] = useState<string>(duration.toString());
  const [cyclesInput, setCyclesInput] = useState<string>(cycles.toString());

  useEffect(() => {
    setLocalUnit(unit);
  }, [unit]);

  useEffect(() => {
    setDurationInput(duration.toString());
  }, [duration]);

  useEffect(() => {
    setCyclesInput(cycles.toString());
  }, [cycles]);

  const handleUnitSelect = (newUnit: 'time' | 'cycles') => {
    if (onUnitChange) {
      onUnitChange(newUnit);
    } else {
      setLocalUnit(newUnit);
    }
  };

  const handleDurationUpdate = (sec: number) => {
    onDurationChange?.(sec);
    onChange?.(sec);
  };

  const commitDuration = (valStr: string) => {
    const val = parseFloat(valStr);
    if (!isNaN(val)) {
      const clamped = Math.round(clamp(val, 0.05, 1000.0) * 100) / 100;
      handleDurationUpdate(clamped);
      setDurationInput(clamped.toString());
    } else {
      setDurationInput(duration.toString());
    }
  };

  const commitCycles = (valStr: string) => {
    const val = parseInt(valStr, 10);
    if (!isNaN(val)) {
      const clamped = clamp(val, AUDIO_BOUNDS.burstCycles.min, AUDIO_BOUNDS.burstCycles.max);
      onCyclesChange?.(clamped);
      setCyclesInput(clamped.toString());
    } else {
      setCyclesInput(cycles.toString());
    }
  };

  // Conversions for badges
  const cycleDurationSec = calculateCycleDuration(cycles, frequency);
  const formattedCycleDuration = formatCycleDuration(cycleDurationSec);

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-slate-200">
            単発発振設定 (One-shot Parameters)
          </h2>
        </div>
      </div>

      {/* Dual Unit Toggle: [ 秒数・時間指定 (最大1000秒) ] vs [ 波数指定 (パルス単発) ] */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800/80">
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleUnitSelect('time')}
          className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            currentUnit === 'time'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>秒数・時間指定 (最大1000秒)</span>
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleUnitSelect('cycles')}
          className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            currentUnit === 'cycles'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>波数指定 (パルス単発)</span>
        </button>
      </div>

      {currentUnit === 'time' ? (
        /* 時間指定 Mode */
        <div className="space-y-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label
                htmlFor="oneshot-duration-input"
                className="text-xs font-semibold text-slate-300"
              >
                発振時間 (Duration)
              </label>
              <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                {formatDuration(duration)}
              </span>
            </div>
            <div className="relative flex items-center">
              <input
                id="oneshot-duration-input"
                type="number"
                min="0.05"
                max="1000.0"
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

          {/* Non-linear / Logarithmic Slider */}
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={durationToSlider(duration, 0.05, 1000.0)}
            disabled={disabled}
            onChange={(e) => {
              const sec = sliderToDuration(parseFloat(e.target.value), 0.05, 1000.0);
              handleDurationUpdate(sec);
            }}
            aria-label="単発発振時間スライダー"
            className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none disabled:opacity-40"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>0.05s</span>
            <span>1秒</span>
            <span>10秒</span>
            <span>1分</span>
            <span>1000秒</span>
          </div>

          {/* Quick presets: [1秒], [5秒], [10秒], [30秒], [1分], [5分], [600秒 (10分)], [1000秒] */}
          <div className="space-y-1">
            <div className="text-[10px] text-slate-400 font-medium">クイックプリセット</div>
            <div className="flex flex-wrap gap-1.5">
              {ONESHOT_TIME_PRESETS.map((preset) => {
                const isActive = Math.abs(duration - preset.value) < 0.01;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleDurationUpdate(preset.value)}
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
      ) : (
        /* 波数指定 (パルス単発) Mode */
        <div className="space-y-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <label
              htmlFor="oneshot-cycles-input"
              className="text-xs font-semibold text-slate-300 flex items-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              <span>発振波数 (Wave Cycles)</span>
            </label>
            <div className="relative flex items-center">
              <input
                id="oneshot-cycles-input"
                type="number"
                min="1"
                max="10000"
                step="1"
                value={cyclesInput}
                disabled={disabled}
                onChange={(e) => setCyclesInput(e.target.value)}
                onBlur={() => commitCycles(cyclesInput)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    commitCycles(cyclesInput);
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                className="w-20 h-8 px-2 pr-7 rounded bg-slate-900 border border-slate-700 text-right font-mono text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
              />
              <span className="absolute right-2 text-[10px] text-slate-400 font-mono pointer-events-none">
                波
              </span>
            </div>
          </div>

          {/* Cycle Count Slider */}
          <input
            type="range"
            min="1"
            max="100"
            step="1"
            value={Math.min(100, Math.max(1, cycles))}
            disabled={disabled}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              onCyclesChange?.(val);
            }}
            aria-label="単発発振波数スライダー"
            className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none disabled:opacity-40"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>1波</span>
            <span>{cycles}波</span>
            <span>100波</span>
          </div>

          {/* Real-time conversion badge */}
          <div className="flex items-center">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-mono font-medium">
              ⚡ {cycles}波 = {formattedCycleDuration} (@{Math.round(frequency)}Hz)
            </span>
          </div>

          {/* Presets: [1波 (デフォルト)], [2波], [5波], [10波], [20波], [100波] */}
          <div className="space-y-1">
            <div className="text-[10px] text-slate-400 font-medium">クイックプリセット</div>
            <div className="flex flex-wrap gap-1.5">
              {ONESHOT_CYCLE_PRESETS.map((preset) => {
                const isActive = cycles === preset.value;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    disabled={disabled}
                    onClick={() => onCyclesChange?.(preset.value)}
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
      )}
    </div>
  );
};

export default BurstControls;
