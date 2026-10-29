import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { AudioEngine } from './AudioEngine';
import { DEFAULT_AUDIO_CONFIG } from './types';

// Mock Web Audio API for testing AudioEngine logic
function createMockAudioContext() {
  const mockAudioParam = () => ({
    value: 0,
    setValueAtTime: mock(() => {}),
    linearRampToValueAtTime: mock(() => {}),
    exponentialRampToValueAtTime: mock(() => {}),
    cancelScheduledValues: mock(() => {}),
  });

  const ctx: any = {
    currentTime: 0,
    state: 'running',
    resume: mock(async () => {
      ctx.state = 'running';
    }),
    destination: {},
    createGain: mock(() => ({
      gain: mockAudioParam(),
      connect: mock(() => {}),
      disconnect: mock(() => {}),
    })),
    createOscillator: mock(() => ({
      type: 'sine',
      frequency: mockAudioParam(),
      connect: mock(() => {}),
      disconnect: mock(() => {}),
      start: mock(() => {}),
      stop: mock(() => {}),
    })),
    createAnalyser: mock(() => ({
      fftSize: 2048,
      smoothingTimeConstant: 0.8,
      frequencyBinCount: 1024,
      connect: mock(() => {}),
      disconnect: mock(() => {}),
      getByteFrequencyData: mock((arr: Uint8Array) => arr.fill(128)),
      getByteTimeDomainData: mock((arr: Uint8Array) => arr.fill(128)),
    })),
  };

  return ctx;
}

describe('AudioEngine', () => {
  let mockCtx: any;

  beforeEach(() => {
    mockCtx = createMockAudioContext();
  });

  it('initializes with default config and exposes getters', () => {
    const engine = new AudioEngine({}, mockCtx);
    expect(engine.isPlaying).toBe(false);
    expect(engine.config).toEqual(DEFAULT_AUDIO_CONFIG);
    expect(engine.analyser).not.toBeNull();
  });

  it('updates configuration dynamically and clamps values', () => {
    const engine = new AudioEngine({}, mockCtx);
    engine.updateConfig({ frequency: 880, volume: 0.8 });

    expect(engine.config.frequency).toBe(880);
    expect(engine.config.volume).toBe(0.8);

    engine.updateConfig({ frequency: 50000 });
    expect(engine.config.frequency).toBe(20000); // Clamped
  });

  it('starts continuous playback and fires callbacks', async () => {
    const engine = new AudioEngine({ playMode: 'continuous', frequency: 440 }, mockCtx);

    let playState = false;
    engine.onPlayStateChanged = (isPlaying) => {
      playState = isPlaying;
    };

    await engine.play();

    expect(engine.isPlaying).toBe(true);
    expect(playState).toBe(true);
    expect(mockCtx.createOscillator).toHaveBeenCalled();
    expect(mockCtx.createGain).toHaveBeenCalled();

    engine.stop();
    expect(engine.isPlaying).toBe(false);
    expect(playState).toBe(false);
  });

  it('resumes suspended context on play()', async () => {
    mockCtx.state = 'suspended';
    const engine = new AudioEngine({}, mockCtx);

    await engine.play();
    expect(mockCtx.resume).toHaveBeenCalled();
    expect(engine.isPlaying).toBe(true);
    engine.stop();
  });

  it('handles sweep playback in continuous mode', async () => {
    const engine = new AudioEngine(
      {
        waveform: 'sweep',
        sweepStartFreq: 100,
        sweepEndFreq: 5000,
        sweepDuration: 1.0,
        sweepScale: 'logarithmic',
        playMode: 'continuous',
      },
      mockCtx
    );

    await engine.play();
    expect(engine.isPlaying).toBe(true);
    engine.stop();
  });

  it('handles burst playback mode', async () => {
    const engine = new AudioEngine(
      {
        playMode: 'burst',
        burstActiveDuration: 0.1,
        burstPauseDuration: 0.1,
      },
      mockCtx
    );

    await engine.play();
    expect(engine.isPlaying).toBe(true);
    engine.stop();
  });

  it('handles oneshot playback mode and onStop callback', async () => {
    const engine = new AudioEngine(
      {
        playMode: 'oneshot',
        oneshotDuration: 0.05,
      },
      mockCtx
    );

    let stopped = false;
    engine.onStop = () => {
      stopped = true;
    };

    await engine.play();
    expect(engine.isPlaying).toBe(true);

    engine.stop();
    expect(engine.isPlaying).toBe(false);
    expect(stopped).toBe(true);
  });

  it('provides frequency, time domain, and analyser data', () => {
    const engine = new AudioEngine({}, mockCtx);
    const freqData = engine.getFrequencyData();
    expect(freqData.length).toBe(1024);
    expect(freqData[0]).toBe(128);

    const timeData = engine.getTimeDomainData();
    expect(timeData.length).toBe(1024);
    expect(timeData[0]).toBe(128);

    const analyserData = engine.getAnalyserData();
    expect(analyserData.length).toBe(1024);
    expect(analyserData[0]).toBe(128);
  });

  it('getInstance returns a singleton instance', () => {
    const instance1 = AudioEngine.getInstance();
    const instance2 = AudioEngine.getInstance();
    expect(instance1).toBe(instance2);
  });
});
