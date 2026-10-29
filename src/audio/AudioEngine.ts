import { AudioConfig } from './types';
import { clampAudioConfig } from './utils';

export class AudioEngine {
  private static instance: AudioEngine | null = null;

  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;

  private oscillator: OscillatorNode | null = null;
  private gateGain: GainNode | null = null;

  private _config: AudioConfig;
  private _isPlaying: boolean = false;

  private loopTimer: ReturnType<typeof setTimeout> | null = null;
  private oneshotTimer: ReturnType<typeof setTimeout> | null = null;

  public onPlayStateChanged?: (isPlaying: boolean) => void;
  public onStop?: () => void;

  constructor(initialConfig?: Partial<AudioConfig>, customContext?: AudioContext) {
    this._config = clampAudioConfig(initialConfig ?? {});

    if (customContext) {
      this.ctx = customContext;
      this.initNodes();
    }
  }

  public static getInstance(initialConfig?: Partial<AudioConfig>): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine(initialConfig);
    }
    return AudioEngine.instance;
  }

  public get isPlaying(): boolean {
    return this._isPlaying;
  }

  public get config(): Readonly<AudioConfig> {
    return { ...this._config };
  }

  public getConfig(): AudioConfig {
    return { ...this._config };
  }

  public get audioContext(): AudioContext | null {
    return this.ctx;
  }

  public get analyser(): AnalyserNode | null {
    return this.getAnalyser();
  }

  /**
   * Lazily initializes AudioContext and the audio routing graph on first demand.
   */
  public ensureContext(): AudioContext | null {
    if (!this.ctx) {
      if (typeof window === 'undefined' && typeof AudioContext === 'undefined') {
        return null;
      }

      const AudioContextClass =
        (typeof window !== 'undefined' &&
          (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)) ||
        (typeof AudioContext !== 'undefined' ? AudioContext : null);

      if (!AudioContextClass) {
        return null;
      }

      this.ctx = new AudioContextClass();
      this.initNodes();
    }
    return this.ctx;
  }

  private initNodes(): void {
    if (!this.ctx) return;

    // Master Gain Node for overall volume and de-clicking
    this.masterGain = this.ctx.createGain();
    const initialVol = this._config.muted ? 0 : this._config.volume;
    this.masterGain.gain.setValueAtTime(initialVol, this.ctx.currentTime);

    // Analyser Node for real-time visualization
    this.analyserNode = this.ctx.createAnalyser();
    this.analyserNode.fftSize = 2048;
    this.analyserNode.smoothingTimeConstant = 0.8;

    // Connect: masterGain -> analyserNode -> destination
    this.masterGain.connect(this.analyserNode);
    this.analyserNode.connect(this.ctx.destination);
  }

  public async resumeContext(): Promise<void> {
    const ctx = this.ensureContext();
    if (ctx && ctx.state === 'suspended') {
      await ctx.resume();
    }
  }

  public getAnalyser(): AnalyserNode | null {
    this.ensureContext();
    return this.analyserNode;
  }

  public getFrequencyData(target?: Uint8Array): Uint8Array {
    const analyser = this.getAnalyser();
    if (!analyser) return target ?? new Uint8Array(0);
    const data = target ?? new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data as any);
    return data;
  }

  public getTimeDomainData(target?: Uint8Array): Uint8Array {
    const analyser = this.getAnalyser();
    if (!analyser) return target ?? new Uint8Array(0);
    const data = target ?? new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteTimeDomainData(data as any);
    return data;
  }

  /**
   * Alias for getTimeDomainData for oscilloscope / waveform display
   */
  public getAnalyserData(target?: Uint8Array): Uint8Array {
    return this.getTimeDomainData(target);
  }

  /**
   * Starts playback based on the current AudioConfig.
   */
  public async play(): Promise<void> {
    const ctx = this.ensureContext();
    if (!ctx) {
      throw new Error('Web Audio API is not supported in this environment.');
    }

    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    if (this._isPlaying) {
      this.stopInternal(false);
    }

    this._isPlaying = true;

    // Create oscillator and gate gain
    const osc = ctx.createOscillator();
    const gateGain = ctx.createGain();

    // Configure oscillator type ('sweep' uses 'sine' oscillator)
    if (this._config.waveform === 'sweep') {
      osc.type = 'sine';
    } else {
      osc.type = this._config.waveform;
    }

    // Gate gain starts at 0 for anti-click ramp-up
    const now = ctx.currentTime;
    gateGain.gain.setValueAtTime(0, now);

    osc.connect(gateGain);
    gateGain.connect(this.masterGain!);

    // Ensure master volume is set
    const targetVol = this._config.muted ? 0 : this._config.volume;
    this.masterGain!.gain.cancelScheduledValues(now);
    this.masterGain!.gain.setValueAtTime(this.masterGain!.gain.value, now);
    this.masterGain!.gain.linearRampToValueAtTime(targetVol, now + 0.01);

    osc.start(now);
    this.oscillator = osc;
    this.gateGain = gateGain;

    // Start mode scheduling
    const startTime = now + 0.005;
    if (this._config.playMode === 'continuous') {
      this.startContinuous(startTime);
    } else if (this._config.playMode === 'burst') {
      this.scheduleNextBurst(startTime);
    } else if (this._config.playMode === 'oneshot') {
      this.startOneshot(startTime);
    }

    this.onPlayStateChanged?.(true);
  }

  /**
   * Continuous mode handling
   */
  private startContinuous(startTime: number): void {
    if (!this.oscillator || !this.gateGain || !this.ctx) return;

    if (this._config.waveform === 'sweep') {
      // Loop sweep repeatedly
      this.scheduleNextSweep(startTime);
    } else {
      // Continuous fixed tone
      this.oscillator.frequency.cancelScheduledValues(startTime);
      this.oscillator.frequency.setValueAtTime(this._config.frequency, startTime);

      this.gateGain.gain.cancelScheduledValues(startTime);
      this.gateGain.gain.setValueAtTime(0, startTime);
      this.gateGain.gain.linearRampToValueAtTime(1, startTime + 0.01);
    }
  }

  /**
   * Continuous sweep loop scheduling
   */
  private scheduleNextSweep(startTime: number): void {
    if (!this._isPlaying || !this.oscillator || !this.gateGain || !this.ctx) return;
    if (this._config.playMode !== 'continuous' || this._config.waveform !== 'sweep') return;

    const actualStart = Math.max(startTime, this.ctx.currentTime + 0.002);
    const duration = this._config.sweepDuration;
    const endTime = actualStart + duration;

    // Apply frequency sweep
    this.applySweepRamp(this.oscillator, actualStart, duration);

    // Fade-in at start, micro-fade at turnaround to avoid phase pop
    const fade = Math.min(0.005, duration * 0.05);
    this.gateGain.gain.setValueAtTime(0, actualStart);
    this.gateGain.gain.linearRampToValueAtTime(1, actualStart + fade);
    this.gateGain.gain.setValueAtTime(1, endTime - fade);
    this.gateGain.gain.linearRampToValueAtTime(0, endTime);

    // Schedule next iteration slightly before endTime
    const delayMs = Math.max(10, (endTime - this.ctx.currentTime - 0.03) * 1000);
    this.loopTimer = setTimeout(() => {
      this.scheduleNextSweep(endTime);
    }, delayMs);
  }

  /**
   * Periodic burst loop scheduling
   */
  private scheduleNextBurst(startTime: number): void {
    if (!this._isPlaying || !this.oscillator || !this.gateGain || !this.ctx) return;
    if (this._config.playMode !== 'burst') return;

    const actualStart = Math.max(startTime, this.ctx.currentTime + 0.002);
    const active = this._config.burstActiveDuration;
    const pause = this._config.burstPauseDuration;
    const cycleDuration = active + pause;
    const ramp = Math.min(0.005, active / 4);

    // Pulse envelope on gate gain
    this.gateGain.gain.setValueAtTime(0, actualStart);
    this.gateGain.gain.linearRampToValueAtTime(1, actualStart + ramp);
    this.gateGain.gain.setValueAtTime(1, actualStart + active - ramp);
    this.gateGain.gain.linearRampToValueAtTime(0, actualStart + active);

    // Frequency handling during active window
    if (this._config.waveform === 'sweep') {
      this.applySweepRamp(this.oscillator, actualStart, active);
    } else {
      this.oscillator.frequency.cancelScheduledValues(actualStart);
      this.oscillator.frequency.setValueAtTime(this._config.frequency, actualStart);
    }

    // Schedule next burst
    const nextStart = actualStart + cycleDuration;
    const delayMs = Math.max(10, (nextStart - this.ctx.currentTime - 0.03) * 1000);
    this.loopTimer = setTimeout(() => {
      this.scheduleNextBurst(nextStart);
    }, delayMs);
  }

  /**
   * One-shot playback handling
   */
  private startOneshot(startTime: number): void {
    if (!this.oscillator || !this.gateGain || !this.ctx) return;

    const actualStart = Math.max(startTime, this.ctx.currentTime + 0.002);
    const isSweep = this._config.waveform === 'sweep';
    const duration = isSweep ? this._config.sweepDuration : this._config.oneshotDuration;
    const ramp = Math.min(0.01, duration / 4);

    // Gate gain envelope
    this.gateGain.gain.setValueAtTime(0, actualStart);
    this.gateGain.gain.linearRampToValueAtTime(1, actualStart + ramp);
    this.gateGain.gain.setValueAtTime(1, actualStart + duration - ramp);
    this.gateGain.gain.linearRampToValueAtTime(0, actualStart + duration);

    // Frequency
    if (isSweep) {
      this.applySweepRamp(this.oscillator, actualStart, duration);
    } else {
      this.oscillator.frequency.cancelScheduledValues(actualStart);
      this.oscillator.frequency.setValueAtTime(this._config.frequency, actualStart);
    }

    // Auto-stop at finish
    const remainingMs = Math.max(10, (actualStart + duration - this.ctx.currentTime) * 1000);
    this.oneshotTimer = setTimeout(() => {
      this.stop();
    }, remainingMs);
  }

  /**
   * Helper to apply linear or logarithmic sweep ramp on oscillator frequency.
   */
  private applySweepRamp(osc: OscillatorNode, startTime: number, duration: number): void {
    const startF = Math.max(20, this._config.sweepStartFreq);
    const endF = Math.max(20, this._config.sweepEndFreq);
    const endTime = startTime + duration;

    osc.frequency.cancelScheduledValues(startTime);
    osc.frequency.setValueAtTime(startF, startTime);

    if (this._config.sweepScale === 'logarithmic') {
      osc.frequency.exponentialRampToValueAtTime(endF, endTime);
    } else {
      osc.frequency.linearRampToValueAtTime(endF, endTime);
    }
  }

  /**
   * Stops playback smoothly to avoid clicks/pops.
   */
  public stop(): void {
    this.stopInternal(true);
  }

  private stopInternal(triggerCallbacks: boolean): void {
    if (!this._isPlaying) return;
    this._isPlaying = false;

    this.clearTimers();

    if (this.ctx && this.gateGain) {
      const now = this.ctx.currentTime;
      const rampTime = 0.01;

      // Smooth ramp down to silence
      this.gateGain.gain.cancelScheduledValues(now);
      this.gateGain.gain.setValueAtTime(this.gateGain.gain.value, now);
      this.gateGain.gain.linearRampToValueAtTime(0, now + rampTime);

      if (this.oscillator) {
        const osc = this.oscillator;
        this.oscillator = null;
        try {
          osc.stop(now + rampTime + 0.005);
        } catch {
          // Ignore if already stopped
        }
        setTimeout(() => {
          try {
            osc.disconnect();
          } catch {
            // Ignore
          }
        }, 50);
      }
    } else if (this.oscillator) {
      try {
        this.oscillator.stop();
        this.oscillator.disconnect();
      } catch {
        // Ignore
      }
      this.oscillator = null;
    }

    this.gateGain = null;

    if (triggerCallbacks) {
      this.onPlayStateChanged?.(false);
      this.onStop?.();
    }
  }

  private clearTimers(): void {
    if (this.loopTimer !== null) {
      clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }
    if (this.oneshotTimer !== null) {
      clearTimeout(this.oneshotTimer);
      this.oneshotTimer = null;
    }
  }

  /**
   * Updates audio configuration dynamically in real time without audio glitches.
   */
  public updateConfig(newConfig: Partial<AudioConfig>): void {
    const prevConfig = { ...this._config };
    this._config = clampAudioConfig({ ...this._config, ...newConfig });

    if (!this.ctx) return;

    // Volume & Muted updates
    if (newConfig.volume !== undefined || newConfig.muted !== undefined) {
      if (this.masterGain) {
        const now = this.ctx.currentTime;
        const targetVol = this._config.muted ? 0 : this._config.volume;
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.linearRampToValueAtTime(targetVol, now + 0.01);
      }
    }

    if (!this._isPlaying || !this.oscillator) return;

    // If playMode or sweep mode changed, transition cleanly
    const isSweepModeChanged =
      (prevConfig.waveform === 'sweep' && this._config.waveform !== 'sweep') ||
      (prevConfig.waveform !== 'sweep' && this._config.waveform === 'sweep');

    const isPlayModeChanged = prevConfig.playMode !== this._config.playMode;

    if (isPlayModeChanged || isSweepModeChanged) {
      this.restartCurrentVoice();
      return;
    }

    // Standard waveform change
    if (newConfig.waveform !== undefined && this._config.waveform !== 'sweep') {
      this.oscillator.type = this._config.waveform;
    }

    // Frequency updates (real-time smooth ramp for non-sweep)
    if (newConfig.frequency !== undefined && this._config.waveform !== 'sweep') {
      const now = this.ctx.currentTime;
      this.oscillator.frequency.cancelScheduledValues(now);
      this.oscillator.frequency.setValueAtTime(this.oscillator.frequency.value, now);
      this.oscillator.frequency.linearRampToValueAtTime(this._config.frequency, now + 0.01);
    }

    // Dynamic sweep parameter updates in continuous sweep mode
    if (
      this._config.waveform === 'sweep' &&
      this._config.playMode === 'continuous' &&
      (newConfig.sweepStartFreq !== undefined ||
        newConfig.sweepEndFreq !== undefined ||
        newConfig.sweepDuration !== undefined ||
        newConfig.sweepScale !== undefined)
    ) {
      this.restartCurrentVoice();
    }
  }

  public setConfig(newConfig: Partial<AudioConfig>): void {
    this.updateConfig(newConfig);
  }

  /**
   * Resets and transitions voice scheduling smoothly without stopping playback state.
   */
  private restartCurrentVoice(): void {
    if (!this._isPlaying || !this.oscillator || !this.gateGain || !this.ctx) return;

    this.clearTimers();

    const now = this.ctx.currentTime;
    if (this._config.waveform === 'sweep') {
      this.oscillator.type = 'sine';
    } else {
      this.oscillator.type = this._config.waveform;
    }

    const startTime = now + 0.005;
    if (this._config.playMode === 'continuous') {
      this.startContinuous(startTime);
    } else if (this._config.playMode === 'burst') {
      this.scheduleNextBurst(startTime);
    } else if (this._config.playMode === 'oneshot') {
      this.startOneshot(startTime);
    }
  }

  /**
   * Cleans up audio context and active nodes.
   */
  public async destroy(): Promise<void> {
    this.stop();
    if (this.ctx && this.ctx.state !== 'closed') {
      try {
        await this.ctx.close();
      } catch {
        // Ignore
      }
    }
    this.ctx = null;
    this.masterGain = null;
    this.analyserNode = null;
  }
}

export const audioEngine = AudioEngine.getInstance();
export default AudioEngine;
