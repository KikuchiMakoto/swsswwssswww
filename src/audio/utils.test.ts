import { describe, it, expect } from 'bun:test';
import {
  frequencyToSlider,
  sliderToFrequency,
  frequencyToSliderPercentage,
  sliderPercentageToFrequency,
  volumeToDb,
  volumeToDbString,
  dbToVolume,
  clamp,
  clampAudioConfig,
} from './utils';
import { DEFAULT_AUDIO_CONFIG, WaveformType, PlayMode, SweepScale } from './types';

describe('frequency mapping (logarithmic)', () => {
  it('maps boundary frequencies correctly', () => {
    expect(frequencyToSlider(20)).toBe(0);
    expect(frequencyToSlider(20000)).toBe(100);

    expect(sliderToFrequency(0)).toBe(20);
    expect(sliderToFrequency(100)).toBe(20000);
  });

  it('maps middle frequency logarithmic midpoint (~632.45 Hz) to 50%', () => {
    // 20 * (20000/20)^0.5 = 20 * sqrt(1000) ~= 632.4555
    const midFreq = 20 * Math.sqrt(1000);
    const sliderVal = frequencyToSlider(midFreq);
    expect(sliderVal).toBeCloseTo(50, 2);

    const freqFromSlider = sliderToFrequency(50);
    expect(freqFromSlider).toBeCloseTo(midFreq, 0);
  });

  it('round-trips common audio frequencies accurately', () => {
    const testFrequencies = [20, 55, 110, 220, 440, 880, 1000, 3500, 10000, 15000, 20000];

    for (const freq of testFrequencies) {
      const slider = frequencyToSlider(freq);
      const recovered = sliderToFrequency(slider);
      // Small relative tolerance (< 1%) due to 1-decimal rounding in sliderToFrequency
      expect(Math.abs(recovered - freq) / freq).toBeLessThan(0.02);
    }
  });

  it('clamps frequency input outside [20, 20000] Hz', () => {
    expect(frequencyToSlider(5)).toBe(0);
    expect(frequencyToSlider(-100)).toBe(0);
    expect(frequencyToSlider(25000)).toBe(100);
    expect(frequencyToSlider(100000)).toBe(100);
  });

  it('clamps slider percentage input outside [0, 100]', () => {
    expect(sliderToFrequency(-10)).toBe(20);
    expect(sliderToFrequency(-100)).toBe(20);
    expect(sliderToFrequency(120)).toBe(20000);
    expect(sliderToFrequency(500)).toBe(20000);
  });

  it('works with aliases', () => {
    expect(frequencyToSliderPercentage(440)).toBe(frequencyToSlider(440));
    expect(sliderPercentageToFrequency(50)).toBe(sliderToFrequency(50));
  });

  it('supports custom frequency boundaries if specified', () => {
    expect(frequencyToSlider(100, 100, 1000)).toBe(0);
    expect(frequencyToSlider(1000, 100, 1000)).toBe(100);
    expect(sliderToFrequency(50, 100, 10000)).toBeCloseTo(1000, 0);
  });
});

describe('volume to dB conversion', () => {
  it('calculates decibels correctly from linear volume', () => {
    expect(volumeToDb(1.0)).toBe(0);
    expect(volumeToDb(0.5)).toBeCloseTo(-6.02, 1);
    expect(volumeToDb(0.1)).toBeCloseTo(-20, 1);
    expect(volumeToDb(0)).toBe(-Infinity);
    expect(volumeToDb(-1)).toBe(-Infinity);
  });

  it('formats volume to dB strings correctly', () => {
    expect(volumeToDbString(1.0)).toBe('0.0 dB');
    expect(volumeToDbString(0.5)).toBe('-6.0 dB');
    expect(volumeToDbString(0.1)).toBe('-20.0 dB');
    expect(volumeToDbString(0)).toBe('-∞ dB');
    expect(volumeToDbString(0.000001)).toBe('-∞ dB');
  });

  it('converts decibels back to linear volume', () => {
    expect(dbToVolume(0)).toBe(1.0);
    expect(dbToVolume(-6.02)).toBeCloseTo(0.5, 2);
    expect(dbToVolume(-20)).toBeCloseTo(0.1, 2);
    expect(dbToVolume(-Infinity)).toBe(0);
    expect(dbToVolume(-120)).toBe(0);
  });
});

describe('clamp helper', () => {
  it('clamps numbers to specified range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
    expect(clamp(NaN, 0, 10)).toBe(0);
  });
});

describe('clampAudioConfig', () => {
  it('returns default config when given empty input', () => {
    const config = clampAudioConfig({});
    expect(config).toEqual(DEFAULT_AUDIO_CONFIG);
  });

  it('clamps frequency within [20, 20000]', () => {
    const low = clampAudioConfig({ frequency: 5 });
    expect(low.frequency).toBe(20);

    const high = clampAudioConfig({ frequency: 25000 });
    expect(high.frequency).toBe(20000);

    const valid = clampAudioConfig({ frequency: 880 });
    expect(valid.frequency).toBe(880);
  });

  it('clamps sweep frequencies within [20, 20000]', () => {
    const clamped = clampAudioConfig({
      sweepStartFreq: 10,
      sweepEndFreq: 50000,
    });
    expect(clamped.sweepStartFreq).toBe(20);
    expect(clamped.sweepEndFreq).toBe(20000);
  });

  it('clamps sweep duration within [0.1, 30.0]', () => {
    const low = clampAudioConfig({ sweepDuration: 0.02 });
    expect(low.sweepDuration).toBe(0.1);

    const high = clampAudioConfig({ sweepDuration: 45.0 });
    expect(high.sweepDuration).toBe(30.0);

    const valid = clampAudioConfig({ sweepDuration: 3.5 });
    expect(valid.sweepDuration).toBe(3.5);
  });

  it('clamps burst active and pause durations within [0.01, 5.0]', () => {
    const low = clampAudioConfig({
      burstActiveDuration: 0.001,
      burstPauseDuration: 0.002,
    });
    expect(low.burstActiveDuration).toBe(0.01);
    expect(low.burstPauseDuration).toBe(0.01);

    const high = clampAudioConfig({
      burstActiveDuration: 10,
      burstPauseDuration: 20,
    });
    expect(high.burstActiveDuration).toBe(5.0);
    expect(high.burstPauseDuration).toBe(5.0);
  });

  it('clamps oneshot duration within [0.05, 30.0]', () => {
    const low = clampAudioConfig({ oneshotDuration: 0.01 });
    expect(low.oneshotDuration).toBe(0.05);

    const high = clampAudioConfig({ oneshotDuration: 100 });
    expect(high.oneshotDuration).toBe(30.0);
  });

  it('clamps volume within [0, 1.0]', () => {
    const low = clampAudioConfig({ volume: -0.2 });
    expect(low.volume).toBe(0);

    const high = clampAudioConfig({ volume: 1.8 });
    expect(high.volume).toBe(1.0);

    const valid = clampAudioConfig({ volume: 0.75 });
    expect(valid.volume).toBe(0.75);
  });

  it('ensures muted is boolean', () => {
    expect(clampAudioConfig({ muted: true }).muted).toBe(true);
    expect(clampAudioConfig({ muted: false }).muted).toBe(false);
  });

  it('validates enum values and falls back to defaults on invalid input', () => {
    const invalidConfig = clampAudioConfig({
      waveform: 'invalid-wave' as unknown as WaveformType,
      playMode: 'unknown-mode' as unknown as PlayMode,
      sweepScale: 'curved' as unknown as SweepScale,
    });

    expect(invalidConfig.waveform).toBe(DEFAULT_AUDIO_CONFIG.waveform);
    expect(invalidConfig.playMode).toBe(DEFAULT_AUDIO_CONFIG.playMode);
    expect(invalidConfig.sweepScale).toBe(DEFAULT_AUDIO_CONFIG.sweepScale);
  });

  it('preserves valid enum values', () => {
    const validConfig = clampAudioConfig({
      waveform: 'square',
      playMode: 'burst',
      sweepScale: 'linear',
    });

    expect(validConfig.waveform).toBe('square');
    expect(validConfig.playMode).toBe('burst');
    expect(validConfig.sweepScale).toBe('linear');
  });
});
