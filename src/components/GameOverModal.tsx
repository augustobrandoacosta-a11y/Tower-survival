import React from 'react';
import { Skull, RotateCcw, AlertTriangle } from 'lucide-react';

interface GameOverModalProps {
  deathCause?: string;
  floorNumber: number;
  deathsDefied: number;
  onRetryFloor: () => void;
  onRestartAll: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  deathCause,
  floorNumber,
  deathsDefied,
  onRetryFloor,
  onRestartAll,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-zinc-950 border-2 border-red-700 rounded-2xl p-6 sm:p-8 text-center shadow-[0_0_80px_rgba(220,38,38,0.5)]">
        <div className="w-16 h-16 rounded-full bg-red-950/80 border-2 border-red-600 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(239,68,68,0.5)]">
          <Skull className="w-8 h-8 text-red-500 animate-pulse" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black font-serif uppercase tracking-wider text-red-500">
          DEATH'S DESIGN COMPLETED
        </h2>
        <div className="text-xs font-mono tracking-widest text-zinc-400 uppercase mt-1 mb-4">
          DECEASED ON FLOOR {floorNumber}
        </div>

        {/* Gruesome Final Destination Cause of Death Box */}
        <div className="bg-red-950/40 border border-red-800/60 rounded-xl p-4 text-left mb-6">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-red-400 uppercase mb-1">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>Coroner's Initial Findings:</span>
          </div>
          <p className="text-sm text-zinc-200 leading-relaxed font-serif italic">
            "{deathCause || 'Victim failed to anticipate the chain-reaction failure sequence in the Skyview structure.'}"
          </p>
        </div>

        {/* Stats */}
        <div className="flex justify-center items-center gap-6 mb-6 text-xs font-mono text-zinc-400">
          <div>
            Near-Deaths Defied: <strong className="text-amber-400 text-sm">{deathsDefied}</strong>
          </div>
        </div>

        {/* Retry Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onRetryFloor}
            className="flex-1 py-3 px-4 rounded-xl font-bold uppercase tracking-wider text-xs bg-red-700 hover:bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Rewind Premonition (Retry Floor)</span>
          </button>

          <button
            onClick={onRestartAll}
            className="py-3 px-4 rounded-xl font-bold uppercase tracking-wider text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 transition-colors"
          >
            Restart from Ground
          </button>
        </div>
      </div>
    </div>
  );
};
