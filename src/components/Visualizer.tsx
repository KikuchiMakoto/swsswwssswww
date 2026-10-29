import React, { useRef, useEffect } from 'react';
import { audioEngine } from '../audio';
import { Activity } from 'lucide-react';

interface VisualizerProps {
  isPlaying: boolean;
  frequency?: number;
  waveform?: string;
}

export const Visualizer: React.FC<VisualizerProps> = ({
  isPlaying,
  frequency,
  waveform,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let idlePhase = 0;

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);
    };

    handleResize();
    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    const render = () => {
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      // Background clear
      ctx.fillStyle = '#0f172a'; // slate-900
      ctx.fillRect(0, 0, width, height);

      // Draw oscilloscope grid lines
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#1e293b'; // slate-800
      const gridSpacing = 32;

      ctx.beginPath();
      for (let x = 0; x < width; x += gridSpacing) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += gridSpacing) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Center crosshair (subtly brighter)
      const centerY = height / 2;
      const centerX = width / 2;
      ctx.strokeStyle = '#334155'; // slate-700
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.moveTo(centerX, 0);
      ctx.lineTo(centerX, height);
      ctx.stroke();
      ctx.setLineDash([]);

      if (isPlaying) {
        // Live audio analyser data
        const data = audioEngine.getAnalyserData();
        const bufferLength = data.length;

        if (bufferLength > 0) {
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = '#10b981'; // emerald-500
          ctx.shadowColor = '#34d399'; // emerald-400
          ctx.shadowBlur = 10;
          ctx.beginPath();

          const sliceWidth = width / bufferLength;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            // Byte time domain: 0 - 255, center is 128
            const v = data[i] / 128.0;
            const y = (v * height) / 2;

            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
            x += sliceWidth;
          }

          ctx.stroke();
          ctx.shadowBlur = 0; // Reset glow
        }
      } else {
        // Gentle idle wave when stopped
        idlePhase += 0.03;
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#475569'; // slate-600
        ctx.beginPath();

        const idleAmplitude = 4;
        const waveCycles = 3;
        for (let x = 0; x < width; x++) {
          const progress = x / width;
          const y =
            centerY +
            Math.sin(progress * Math.PI * 2 * waveCycles + idlePhase) *
              idleAmplitude;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
    };
  }, [isPlaying]);

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
      {/* Header / Badges overlay */}
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-medium">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Real-time Oscilloscope (波形モニター)</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
          {waveform && (
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700/60 uppercase">
              {waveform}
            </span>
          )}
          {frequency !== undefined && waveform !== 'sweep' && (
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700/60 text-emerald-400">
              {Math.round(frequency)} Hz
            </span>
          )}
          <span
            className={`px-2 py-0.5 rounded border text-[10px] font-semibold tracking-wider ${
              isPlaying
                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80 animate-pulse'
                : 'bg-slate-800 text-slate-500 border-slate-700/50'
            }`}
          >
            {isPlaying ? 'LIVE' : 'STANDBY'}
          </span>
        </div>
      </div>

      {/* Canvas container */}
      <div
        ref={containerRef}
        className="w-full h-36 sm:h-44 md:h-48 rounded-xl overflow-hidden border border-slate-800/80 bg-slate-950 relative shadow-inner"
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
          aria-label="Oscilloscope display"
        />
      </div>
    </div>
  );
};

export default Visualizer;
