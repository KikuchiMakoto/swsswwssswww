import { useState } from 'react';
import { Volume2, Play, Square, Music } from 'lucide-react';

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-600/20 text-indigo-400 mx-auto">
          <Volume2 className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            <Music className="w-6 h-6 text-indigo-400" />
            SoundGen
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Vite + React + TypeScript + TailwindCSS + PWA
          </p>
        </div>
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setIsPlaying((prev) => !prev)}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors ${
              isPlaying
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-4 h-4 fill-current" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                Play
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
