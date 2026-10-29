import React, { useState, useEffect } from 'react';
import { Waves, Download, Check } from 'lucide-react';

interface HeaderProps {
  isPlaying: boolean;
  audioState?: 'ready' | 'playing' | 'suspended';
  outputDestination?: string;
}

export const Header: React.FC<HeaderProps> = ({
  isPlaying,
  audioState = isPlaying ? 'playing' : 'ready',
  outputDestination = 'Primary Device',
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone PWA mode
    if (
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true)
    ) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  return (
    <header className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 min-h-16 py-2 flex items-center justify-between gap-4">
        {/* Brand / Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 border border-slate-700/60 text-emerald-400 shadow-inner shrink-0">
            <Waves className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                Sound Wave Synthesis Studio
              </h1>
              <span
                className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-medium cursor-help"
                title="Sound Wave Super Synthesizer — Waveform Workflow, Signal Sequencing Studio — World Wide Web"
              >
                swsswwssswww
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-800 text-slate-300 border border-slate-700/60 hidden sm:inline-block">
                音源生成機
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 font-mono tracking-tight leading-tight mt-0.5">
              <span>Sound Wave Super Synthesizer — Waveform Workflow, Signal Sequencing Studio — World Wide Web</span>
            </p>
          </div>
        </div>

        {/* Status Indicators & PWA Action */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Audio Engine Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
            <span className="relative flex h-2.5 w-2.5">
              {isPlaying && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isPlaying ? 'bg-emerald-500' : 'bg-slate-500'
                }`}
              />
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1.5">
              <span className="font-semibold text-slate-200">
                {audioState === 'playing'
                  ? 'Playing (再生中)'
                  : audioState === 'suspended'
                  ? 'Suspended (待機)'
                  : 'Ready (待機中)'}
              </span>
              <span className="text-slate-400 hidden md:inline text-[11px]">
                • 出力: {outputDestination}
              </span>
            </div>
          </div>

          {/* PWA Install Button / Status */}
          {deferredPrompt && !isInstalled && (
            <button
              type="button"
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
              title="ホーム画面またはデスクトップにアプリをインストール"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PWA インストール</span>
              <span className="sm:hidden">Install</span>
            </button>
          )}

          {isInstalled && (
            <div
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-800/60 text-slate-400 border border-slate-700/40"
              title="PWAとしてインストール済み"
            >
              <Check className="w-3 h-3 text-emerald-400" />
              <span>Installed</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
