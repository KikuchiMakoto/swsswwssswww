export type WaveformType = 'sine' | 'triangle' | 'square' | 'sweep';
export type PlayMode = 'continuous' | 'burst' | 'oneshot';
export type SweepScale = 'logarithmic' | 'linear';

export interface AudioConfig {
  waveform: WaveformType;
  frequency: number; // 20 to 20000, default 440
  sweepStartFreq: number; // 20 to 20000, default 100
  sweepEndFreq: number; // 20 to 20000, default 10000
  sweepDuration: number; // 0.1 to 30.0 s, default 2.0
  sweepScale: SweepScale; // default 'logarithmic'
  playMode: PlayMode; // default 'continuous'
  burstActiveDuration: number; // 0.01 to 5.0 s, default 0.2
  burstPauseDuration: number; // 0.01 to 5.0 s, default 0.3
  oneshotDuration: number; // 0.05 to 30.0 s, default 1.0
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
  burstActiveDuration: 0.2,
  burstPauseDuration: 0.3,
  oneshotDuration: 1.0,
  volume: 0.5,
  muted: false,
};

export const AUDIO_BOUNDS = {
  frequency: { min: 20, max: 20000 },
  sweepStartFreq: { min: 20, max: 20000 },
  sweepEndFreq: { min: 20, max: 20000 },
  sweepDuration: { min: 0.1, max: 30.0 },
  burstActiveDuration: { min: 0.01, max: 5.0 },
  burstPauseDuration: { min: 0.01, max: 5.0 },
  oneshotDuration: { min: 0.05, max: 30.0 },
  volume: { min: 0, max: 1.0 },
} as const;
