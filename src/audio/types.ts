export type WaveformType = 'sine' | 'triangle' | 'square' | 'sweep';
export type PlayMode = 'continuous' | 'burst' | 'oneshot';
export type SweepScale = 'logarithmic' | 'linear';
export type BurstUnit = 'cycles' | 'time';

export interface AudioConfig {
  waveform: WaveformType;
  frequency: number; // 20 to 20000, default 440
  sweepStartFreq: number; // 20 to 20000, default 100
  sweepEndFreq: number; // 20 to 20000, default 10000
  sweepDuration: number; // 0.1 to 1000.0 s, default 2.0
  sweepScale: SweepScale; // default 'logarithmic'
  playMode: PlayMode; // default 'continuous'
  burstUnit: BurstUnit; // default 'cycles'
  burstCycles: number; // 1 to 10000, default 1
  burstActiveDuration: number; // 0.001 to 5.0 s, default 0.1
  burstPauseDuration: number; // 0.01 to 5.0 s, default 0.2
  oneshotUnit?: 'time' | 'cycles'; // default 'time'
  oneshotCycles?: number; // 1 to 10000, optional
  oneshotDuration: number; // 0.05 to 1000.0 s, default 1.0
  volume: number; // 0 to 1.0, default 0.5
  muted: boolean; // default false
}

export const DEFAULT_AUDIO_CONFIG: Readonly<AudioConfig> = {
  waveform: 'sine',
  frequency: 440,
  sweepStartFreq: 100,
  sweepEndFreq: 10000,
  sweepDuration: 2.0,
  sweepScale: 'logarithmic',
  playMode: 'continuous',
  burstUnit: 'cycles',
  burstCycles: 1,
  burstActiveDuration: 0.1,
  burstPauseDuration: 0.2,
  oneshotDuration: 1.0,
  volume: 0.5,
  muted: false,
};

export const AUDIO_BOUNDS = {
  frequency: { min: 20, max: 20000 },
  sweepStartFreq: { min: 20, max: 20000 },
  sweepEndFreq: { min: 20, max: 20000 },
  sweepDuration: { min: 0.1, max: 1000.0 },
  burstCycles: { min: 1, max: 10000 },
  burstActiveDuration: { min: 0.001, max: 5.0 },
  burstPauseDuration: { min: 0.01, max: 5.0 },
  oneshotDuration: { min: 0.05, max: 1000.0 },
  volume: { min: 0, max: 1.0 },
} as const;
