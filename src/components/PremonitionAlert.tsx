import React from 'react';
import { Skull, AlertOctagon } from 'lucide-react';
import { PremonitionAlertData } from '../types/game';

interface PremonitionAlertProps {
  alert: PremonitionAlertData | null;
}

export const PremonitionAlert: React.FC<PremonitionAlertProps> = ({ alert }) => {
  if (!alert) return null;

  const pct = Math.max(0, Math.min(100, (alert.remainingSeconds / alert.maxSeconds) * 100));

  return (
    <div className="fixed inset-0 pointer-events-none z-40 flex flex-col items-center justify-start pt-16">
      {/* Red horror pulsing screen vignette */}
      <div className="absolute inset-0 bg-radial from-transparent via-red-950/20 to-red-900/60 animate-pulse pointer-events-none" />

      {/* Top Banner Alert Box */}
      <div className="relative z-10 max-w-lg w-11/12 bg-black/90 border-2 border-red-600 rounded-xl p-4 shadow-[0_0_40px_rgba(220,38,38,0.7)] text-center animate-bounce">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Skull className="w-5 h-5 text-red-500 animate-spin" />
          <span className="text-xs font-mono font-black tracking-widest text-red-400 uppercase">
            DEATH'S DESIGN DETECTED // PREMONITION
          </span>
          <AlertOctagon className="w-5 h-5 text-red-500" />
        </div>

        <h3 className="text-base sm:text-lg font-bold text-red-100 font-serif tracking-wide mb-1">
          {alert.title}
        </h3>

        <p className="text-xs sm:text-sm text-zinc-300 mb-3">
          {alert.omenDescription}
        </p>

        {/* Reaction Progress bar */}
        <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden mb-2 border border-red-900">
          <div
            className="h-full bg-red-600 transition-all duration-100"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-red-400">
          <span className="font-semibold uppercase tracking-wider">{alert.hint}</span>
          <span>{alert.remainingSeconds.toFixed(1)}s</span>
        </div>
      </div>
    </div>
  );
};
