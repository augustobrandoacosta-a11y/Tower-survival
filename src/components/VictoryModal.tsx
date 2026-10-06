import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, ShieldCheck, RotateCcw, CheckCircle2 } from 'lucide-react';

interface VictoryModalProps {
  escapeReason?: string;
  deathsDefied: number;
  onPlayAgain: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ escapeReason, deathsDefied, onPlayAgain }) => {
  useEffect(() => {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'],
      });
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-zinc-950 border-2 border-emerald-500/70 rounded-2xl p-6 sm:p-8 text-center shadow-[0_0_80px_rgba(16,185,129,0.3)]">
        <div className="w-16 h-16 rounded-full bg-emerald-950/80 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-[0_0_25px_rgba(16,185,129,0.5)]">
          <Trophy className="w-8 h-8 text-emerald-400" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black font-serif uppercase tracking-wider text-emerald-400">
          YOU DEFIED DEATH'S BLOODLINE
        </h2>
        <div className="text-xs font-mono tracking-widest text-zinc-400 uppercase mt-1 mb-4">
          SKYVIEW TOWER EVACUATED SUCCESSFULLY
        </div>

        <p className="text-sm text-zinc-200 mb-6 leading-relaxed font-semibold">
          {escapeReason || 'You escaped the collapse of Skyview Tower! But remember... Death never forgets a skipped turn.'}
        </p>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 mb-6 flex justify-around items-center">
          <div>
            <div className="text-[11px] font-mono uppercase text-zinc-400">Near-Death Traps Dodged</div>
            <div className="text-2xl font-bold font-mono text-amber-400">{deathsDefied}</div>
          </div>
          <div className="w-px h-10 bg-zinc-800" />
          <div>
            <div className="text-[11px] font-mono uppercase text-zinc-400">Elevator Rides Survived</div>
            <div className="text-2xl font-bold font-mono text-emerald-400">4 / 4</div>
          </div>
        </div>

        <button
          onClick={onPlayAgain}
          className="w-full py-4 rounded-xl font-bold uppercase tracking-wider text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Survive Again</span>
        </button>
      </div>
    </div>
  );
};
