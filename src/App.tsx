import { useState, useEffect, useCallback } from 'react';
import { audioEngine, AudioConfig, WaveformType, PlayMode, SweepScale } from './audio';
import Header from './components/Header';
import OutputButton from './components/OutputButton';
import Visualizer from './components/Visualizer';
import WaveformSelector from './components/WaveformSelector';
import PlayModeSelector from './components/PlayModeSelector';
import FrequencyControl from './components/FrequencyControl';
import SweepControls from './components/SweepControls';
import BurstControls, { OneShotControls } from './components/BurstControls';
import VolumeControl from './components/VolumeControl';

export default function App() {
  const [isPlaying, setIsPlaying] = useState<boolean>(audioEngine.isPlaying);
  const [config, setConfig] = useState<AudioConfig>(audioEngine.getConfig());

  // Listen to AudioEngine state changes
  useEffect(() => {
    audioEngine.onPlayStateChanged = (playing) => {
      setIsPlaying(playing);
    };
    return () => {
      audioEngine.onPlayStateChanged = undefined;
    };
  }, []);

  const handleConfigChange = useCallback((partial: Partial<AudioConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...partial };
      audioEngine.updateConfig(partial);
      return next;
    });
  }, []);

  const togglePlay = useCallback(async () => {
    try {
      if (isPlaying) {
        audioEngine.stop();
      } else {
        await audioEngine.play();
      }
    } catch (err) {
      console.error('Failed to toggle audio playback:', err);
    }
  }, [isPlaying]);

  const handleSweepSwap = useCallback(() => {
    handleConfigChange({
      sweepStartFreq: config.sweepEndFreq,
      sweepEndFreq: config.sweepStartFreq,
    });
  }, [config.sweepStartFreq, config.sweepEndFreq, handleConfigChange]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* App Header */}
      <Header
        isPlaying={isPlaying}
        outputDestination="Primary Device (既定スピーカー)"
      />

      {/* Main Responsive Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Top Hero Section: Main Output Toggle */}
        <section aria-label="Audio Output Controls" className="flex justify-center">
          <OutputButton isPlaying={isPlaying} onToggle={togglePlay} />
        </section>

        {/* Responsive Grid: 2 columns on laptop/Chromebook/desktop, 1 column on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Visualizer & Primary Pitch / Sweep Controls */}
          <div className="lg:col-span-7 space-y-6">
            {/* Visualizer / Oscilloscope */}
            <Visualizer
              isPlaying={isPlaying}
              frequency={config.frequency}
              waveform={config.waveform}
            />

            {/* Frequency Control (Sine, Triangle, Square) */}
            {config.waveform !== 'sweep' ? (
              <FrequencyControl
                frequency={config.frequency}
                onChange={(freq) => handleConfigChange({ frequency: freq })}
              />
            ) : (
              /* Sweep Controls (Sweep waveform selected) */
              <SweepControls
                startFreq={config.sweepStartFreq}
                endFreq={config.sweepEndFreq}
                duration={config.sweepDuration}
                scale={config.sweepScale}
                onStartFreqChange={(freq) => handleConfigChange({ sweepStartFreq: freq })}
                onEndFreqChange={(freq) => handleConfigChange({ sweepEndFreq: freq })}
                onDurationChange={(dur) => handleConfigChange({ sweepDuration: dur })}
                onScaleChange={(scale: SweepScale) => handleConfigChange({ sweepScale: scale })}
                onSwap={handleSweepSwap}
              />
            )}
          </div>

          {/* Right Column: Waveform, Mode, Timing, Volume */}
          <div className="lg:col-span-5 space-y-6">
            {/* Waveform Selector */}
            <WaveformSelector
              value={config.waveform}
              onChange={(waveform: WaveformType) => handleConfigChange({ waveform })}
            />

            {/* Play Mode Selector */}
            <PlayModeSelector
              value={config.playMode}
              onChange={(playMode: PlayMode) => handleConfigChange({ playMode })}
            />

            {/* Burst Parameters (Visible in Burst Mode) */}
            {config.playMode === 'burst' && (
              <BurstControls
                activeDuration={config.burstActiveDuration}
                pauseDuration={config.burstPauseDuration}
                onActiveDurationChange={(sec) =>
                  handleConfigChange({ burstActiveDuration: sec })
                }
                onPauseDurationChange={(sec) =>
                  handleConfigChange({ burstPauseDuration: sec })
                }
              />
            )}

            {/* One-shot Parameters (Visible in One-shot Mode without Sweep) */}
            {config.playMode === 'oneshot' && config.waveform !== 'sweep' && (
              <OneShotControls
                duration={config.oneshotDuration}
                onChange={(sec) => handleConfigChange({ oneshotDuration: sec })}
              />
            )}

            {/* Volume Control */}
            <VolumeControl
              volume={config.volume}
              muted={config.muted}
              onVolumeChange={(vol) => handleConfigChange({ volume: vol })}
              onMuteToggle={() => handleConfigChange({ muted: !config.muted })}
            />
          </div>
        </div>

        {/* Footer info & usage hints */}
        <footer className="pt-8 pb-4 border-t border-slate-900 text-center text-xs text-slate-400 space-y-1">
          <p>
            Sound Generator • 高精度 Web Audio API オシレーター &amp; リアルタイム波形モニター
          </p>
          <p className="text-[11px] text-slate-500">
            ショートカット: [Space] 出力切替 • PWA対応 (オフライン &amp; インストール可能)
          </p>
        </footer>
      </main>
    </div>
  );
}
