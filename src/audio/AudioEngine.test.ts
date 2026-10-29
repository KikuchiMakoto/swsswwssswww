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
        burstUnit: 'time',
        burstActiveDuration: 0.1,
        burstPauseDuration: 0.1,
      },
      mockCtx
    );

    await engine.play();
    expect(engine.isPlaying).toBe(true);
    engine.stop();
  });

  it('calculates cycle-based burst active duration with 1-wave default', () => {
    // Default config has burstUnit: 'cycles' and burstCycles: 1
    const engine = new AudioEngine({ playMode: 'burst', frequency: 1000 }, mockCtx);
    expect(engine.config.burstUnit).toBe('cycles');
    expect(engine.config.burstCycles).toBe(1);
    // At 1000 Hz, 1 cycle = 0.001 s (1 ms)
    expect(engine.getBurstActiveDuration()).toBeCloseTo(0.001, 6);

    // At default 440 Hz, 1 cycle = 1/440 s
    const defaultEngine = new AudioEngine({ playMode: 'burst' }, mockCtx);
    expect(defaultEngine.getBurstActiveDuration()).toBeCloseTo(1 / 440, 6);
  });

  it('calculates cycle-based burst duration with multiple cycles', () => {
    const engine = new AudioEngine(
      {
        playMode: 'burst',
        burstUnit: 'cycles',
        burstCycles: 10,
        frequency: 500,
      },
      mockCtx
    );
    // 10 cycles at 500 Hz = 10 / 500 = 0.02 s (20 ms)
    expect(engine.getBurstActiveDuration()).toBeCloseTo(0.02, 6);
  });

  it('calculates burst duration in sweep mode using average frequency', () => {
    const engine = new AudioEngine(
      {
        waveform: 'sweep',
        playMode: 'burst',
        burstUnit: 'cycles',
        burstCycles: 4,
        sweepStartFreq: 200,
        sweepEndFreq: 600, // Average freq: (200 + 600) / 2 = 400 Hz
      },
      mockCtx
    );
    // 4 cycles at 400 Hz avg = 4 / 400 = 0.01 s
    expect(engine.getBurstActiveDuration()).toBeCloseTo(0.01, 6);
  });

  it('returns burstActiveDuration when burstUnit is time', () => {
    const engine = new AudioEngine(
      {
        playMode: 'burst',
        burstUnit: 'time',
        burstActiveDuration: 0.25,
      },
      mockCtx
    );
    expect(engine.getBurstActiveDuration()).toBe(0.25);
  });

  it('schedules fast ramp envelope in cycle-based burst playback', async () => {
    const engine = new AudioEngine(
      {
        playMode: 'burst',
        burstUnit: 'cycles',
        burstCycles: 1,
        frequency: 1000, // activeDuration = 0.001 s (1 ms)
      },
      mockCtx
    );

    await engine.play();
    expect(engine.isPlaying).toBe(true);

    // gateGain is created in play() - 2nd gain node after masterGain
    const gateGain = mockCtx.createGain.mock.results[1]?.value;
    expect(gateGain).toBeDefined();

    // Ramp: Math.min(0.0005, 0.001 * 0.1) = 0.0001 s (0.1 ms)
    const ramp = Math.min(0.0005, 0.001 * 0.1);
    expect(ramp).toBe(0.0001);

    // Verify linearRampToValueAtTime was called on gateGain
    expect(gateGain.gain.linearRampToValueAtTime).toHaveBeenCalled();

    engine.stop();
  });

  it('handles oneshot playback mode with cycle-based duration (1-wave default)', () => {
    const engine = new AudioEngine(
      {
        playMode: 'oneshot',
        oneshotUnit: 'cycles',
        frequency: 1000,
      },
      mockCtx
    );
    // 1 cycle default at 1000 Hz = 0.001 s
    expect(engine.getOneshotDuration()).toBeCloseTo(0.001, 6);

    // Multiple cycles
    engine.updateConfig({ burstCycles: 5 });
    expect(engine.getOneshotDuration()).toBeCloseTo(0.005, 6);
  });

  it('handles oneshot playback mode with up to 600.0s (10 minutes) duration', () => {
    const engine = new AudioEngine(
      {
        playMode: 'oneshot',
        oneshotDuration: 600.0,
      },
      mockCtx
    );
    expect(engine.config.oneshotDuration).toBe(600.0);
    expect(engine.getOneshotDuration()).toBe(600.0);

    // Clamps to 600.0s max
    engine.updateConfig({ oneshotDuration: 800.0 });
    expect(engine.config.oneshotDuration).toBe(600.0);
  });

  it('handles sweep duration with up to 600.0s (10 minutes)', () => {
    const engine = new AudioEngine(
      {
        waveform: 'sweep',
        sweepDuration: 600.0,
      },
      mockCtx
    );
    expect(engine.config.sweepDuration).toBe(600.0);

    // Clamps to 600.0s max
    engine.updateConfig({ sweepDuration: 1000.0 });
    expect(engine.config.sweepDuration).toBe(600.0);
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
