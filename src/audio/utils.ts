import { AudioConfig, DEFAULT_AUDIO_CONFIG, AUDIO_BOUNDS, WaveformType, PlayMode, SweepScale, BurstUnit } from './types';

/**
 * Clamps a number between min and max.
 */
export function clamp(val: number, min: number, max: number): number {
  if (Number.isNaN(val)) return min;
  return Math.min(Math.max(val, min), max);
}

/**
 * Calculates the cycle duration in seconds for a given number of cycles and frequency.
 * returns seconds: cycles / freq.
 */
export function calculateCycleDuration(cycles: number, freq: number): number {
  if (freq <= 0 || Number.isNaN(freq) || Number.isNaN(cycles)) {
    return 0;
  }
  return cycles / freq;
}

/**
 * Calculates equivalent cycles for a given duration in seconds and frequency.
 * returns durationSec * freq.
 */
export function calculateEquivalentCycles(durationSec: number, freq: number): number {
  if (Number.isNaN(durationSec) || Number.isNaN(freq)) {
    return 0;
  }
  return durationSec * freq;
}

/**
 * Formats a duration in seconds into a human-readable Japanese string.
 * Examples:
 * - >= 60s: "1分00秒 (60.0s)", "10分00秒 (600.0s)"
 * - < 60s: "1.0秒", "0.05秒 (50ms)", "5.0秒"
 */
export function formatDuration(seconds: number): string {
  if (Number.isNaN(seconds) || seconds <= 0) {
    return '0.0秒';
  }

  if (seconds >= 60) {
    const mins = Math.floor(seconds / 60);
    const remSec = Math.floor(seconds % 60);
    const secStr = remSec.toString().padStart(2, '0');
    return `${mins}分${secStr}秒 (${seconds.toFixed(1)}s)`;
  }

  if (seconds < 1) {
    const ms = Math.round(seconds * 1000);
    const secStr = Number(seconds.toFixed(3));
    return `${secStr}秒 (${ms}ms)`;
  }

  return `${seconds.toFixed(1)}秒`;
}

/**
 * Converts a duration in seconds to a slider percentage (0 to 100) using a logarithmic scale.
 * Supports non-linear duration adjustments across wide ranges (e.g. 0.05s to 600.0s).
 */
export function durationToSlider(
  duration: number,
  minSec: number = 0.05,
  maxSec: number = 600.0
): number {
  const safeDur = clamp(duration, minSec, maxSec);
  const minLog = Math.log10(minSec);
  const maxLog = Math.log10(maxSec);
  const scale = (Math.log10(safeDur) - minLog) / (maxLog - minLog);
  return clamp(scale * 100, 0, 100);
}

/**
 * Converts a slider percentage (0 to 100) to a duration in seconds using a logarithmic scale.
 */
export function sliderToDuration(
  percentage: number,
  minSec: number = 0.05,
  maxSec: number = 600.0
): number {
  const safePct = clamp(percentage, 0, 100) / 100;
  const minLog = Math.log10(minSec);
  const maxLog = Math.log10(maxSec);
  const rawDur = Math.pow(10, minLog + safePct * (maxLog - minLog));

  if (rawDur < 0.1) {
    return clamp(Math.round(rawDur * 1000) / 1000, minSec, maxSec);
  } else if (rawDur < 1) {
    return clamp(Math.round(rawDur * 100) / 100, minSec, maxSec);
  } else if (rawDur < 10) {
    return clamp(Math.round(rawDur * 10) / 10, minSec, maxSec);
  } else if (rawDur < 60) {
    return clamp(Math.round(rawDur * 2) / 2, minSec, maxSec);
  } else {
    return clamp(Math.round(rawDur), minSec, maxSec);
  }
}

/**
 * Converts a frequency in Hz to a slider percentage (0 to 100) using a logarithmic scale.
 * Default range: 20 Hz to 20,000 Hz.
 */
export function frequencyToSlider(
  freq: number,
  minFreq: number = AUDIO_BOUNDS.frequency.min,
  maxFreq: number = AUDIO_BOUNDS.frequency.max
): number {
  const safeFreq = clamp(freq, minFreq, maxFreq);
  const minLog = Math.log10(minFreq);
  const maxLog = Math.log10(maxFreq);
  const scale = (Math.log10(safeFreq) - minLog) / (maxLog - minLog);
  return clamp(scale * 100, 0, 100);
}

export const frequencyToSliderPercentage = frequencyToSlider;

/**
 * Converts a slider percentage (0 to 100) to a frequency in Hz using a logarithmic scale.
 * Default range: 20 Hz to 20,000 Hz.
 */
export function sliderToFrequency(
  percentage: number,
  minFreq: number = AUDIO_BOUNDS.frequency.min,
  maxFreq: number = AUDIO_BOUNDS.frequency.max
): number {
  const safePct = clamp(percentage, 0, 100) / 100;
  const minLog = Math.log10(minFreq);
  const maxLog = Math.log10(maxFreq);
  const freq = Math.pow(10, minLog + safePct * (maxLog - minLog));
  return clamp(Math.round(freq * 10) / 10, minFreq, maxFreq);
}

export const sliderPercentageToFrequency = sliderToFrequency;

/**
 * Converts a linear volume gain [0, 1] to decibels (dB).
 * Returns -Infinity if volume <= 0.
 */
export function volumeToDb(volume: number): number {
  if (volume <= 0.00001) {
    return -Infinity;
  }
  return 20 * Math.log10(volume);
}

/**
 * Converts decibels (dB) to a linear volume gain [0, 1].
 */
export function dbToVolume(db: number): number {
  if (!isFinite(db) || db <= -100) {
    return 0;
  }
  return clamp(Math.pow(10, db / 20), 0, 1);
}

/**
 * Formats a volume [0, 1] as a dB string (e.g., "-6.0 dB", "-∞ dB", "0.0 dB").
 */
export function volumeToDbString(volume: number, precision: number = 1): string {
  const safeVol = clamp(volume, 0, 1);
  if (safeVol <= 0.00001) {
    return '-∞ dB';
  }
  const db = 20 * Math.log10(safeVol);
  const formatted = db.toFixed(precision);
  return `${formatted === '-0.0' ? '0.0' : formatted} dB`;
}

const VALID_WAVEFORMS: ReadonlySet<WaveformType> = new Set(['sine', 'triangle', 'square', 'sweep']);
const VALID_PLAY_MODES: ReadonlySet<PlayMode> = new Set(['continuous', 'burst', 'oneshot']);
const VALID_SWEEP_SCALES: ReadonlySet<SweepScale> = new Set(['logarithmic', 'linear']);
const VALID_BURST_UNITS: ReadonlySet<BurstUnit> = new Set(['cycles', 'time']);

/**
 * Validates and clamps an AudioConfig object to ensure all numerical parameters
 * are within valid ranges and enum types are valid.
 */
export function clampAudioConfig(config: Partial<AudioConfig>): AudioConfig {
  const base = { ...DEFAULT_AUDIO_CONFIG, ...config };

  const waveform = VALID_WAVEFORMS.has(base.waveform) ? base.waveform : DEFAULT_AUDIO_CONFIG.waveform;
  const playMode = VALID_PLAY_MODES.has(base.playMode) ? base.playMode : DEFAULT_AUDIO_CONFIG.playMode;
  const sweepScale = VALID_SWEEP_SCALES.has(base.sweepScale) ? base.sweepScale : DEFAULT_AUDIO_CONFIG.sweepScale;
  const burstUnit = VALID_BURST_UNITS.has(base.burstUnit) ? base.burstUnit : DEFAULT_AUDIO_CONFIG.burstUnit;

  const rawBurstCycles = Number.isNaN(base.burstCycles) ? DEFAULT_AUDIO_CONFIG.burstCycles : Math.round(base.burstCycles);
  const burstCycles = clamp(rawBurstCycles, AUDIO_BOUNDS.burstCycles.min, AUDIO_BOUNDS.burstCycles.max);

  const oneshotUnit = base.oneshotUnit === 'cycles' || base.oneshotUnit === 'time'
    ? base.oneshotUnit
    : undefined;

  const oneshotCycles = base.oneshotCycles !== undefined
    ? clamp(
        Number.isNaN(base.oneshotCycles) ? 1 : Math.round(base.oneshotCycles),
        AUDIO_BOUNDS.burstCycles.min,
        AUDIO_BOUNDS.burstCycles.max
      )
    : undefined;

  return {
    waveform,
    frequency: clamp(base.frequency, AUDIO_BOUNDS.frequency.min, AUDIO_BOUNDS.frequency.max),
    sweepStartFreq: clamp(base.sweepStartFreq, AUDIO_BOUNDS.sweepStartFreq.min, AUDIO_BOUNDS.sweepEndFreq.max),
    sweepEndFreq: clamp(base.sweepEndFreq, AUDIO_BOUNDS.sweepEndFreq.min, AUDIO_BOUNDS.sweepEndFreq.max),
    sweepDuration: clamp(base.sweepDuration, AUDIO_BOUNDS.sweepDuration.min, AUDIO_BOUNDS.sweepDuration.max),
    sweepScale,
    playMode,
    burstUnit,
    burstCycles,
    burstActiveDuration: clamp(base.burstActiveDuration, AUDIO_BOUNDS.burstActiveDuration.min, AUDIO_BOUNDS.burstActiveDuration.max),
    burstPauseDuration: clamp(base.burstPauseDuration, AUDIO_BOUNDS.burstPauseDuration.min, AUDIO_BOUNDS.burstPauseDuration.max),
    ...(oneshotUnit !== undefined ? { oneshotUnit } : {}),
    ...(oneshotCycles !== undefined ? { oneshotCycles } : {}),
    oneshotDuration: clamp(base.oneshotDuration, AUDIO_BOUNDS.oneshotDuration.min, AUDIO_BOUNDS.oneshotDuration.max),
    volume: clamp(base.volume, AUDIO_BOUNDS.volume.min, AUDIO_BOUNDS.volume.max),
    muted: Boolean(base.muted),
  };
}
