import React from 'react';
import { Skull, AlertTriangle, ShieldCheck, Play, Move, Hand, Wind } from 'lucide-react';

interface StoryIntroModalProps {
  onStart: () => void;
}

export const StoryIntroModal: React.FC<StoryIntroModalProps> = ({ onStart }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border-2 border-red-700/60 rounded-2xl p-6 sm:p-8 shadow-[0_0_60px_rgba(220,38,38,0.3)] text-zinc-100">
        {/* Bloodlines Header */}
        <div className="text-center border-b border-zinc-800 pb-5 mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/70 border border-red-700/50 text-red-400 text-xs font-mono font-bold uppercase tracking-widest mb-3">
            <Skull className="w-4 h-4 text-red-500" />
            <span>Death Has A New Design</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black font-serif tracking-wider text-red-500 uppercase drop-shadow-md">
            FINAL DESTINATION
          </h1>
          <h2 className="text-sm sm:text-base font-bold font-mono tracking-widest text-zinc-300 uppercase mt-0.5">
            BLOODLINES · SKYVIEW TOWER
          </h2>
          <p className="text-xs text-zinc-400 mt-2 max-w-md mx-auto leading-relaxed">
            You just had a terrifying premonition: the prestigious 112-story Skyview Tower is doomed to collapse in an escalating series of freak accidents.
          </p>
        </div>

        {/* Premonition Warning & Objective */}
        <div className="bg-red-950/30 border border-red-800/40 rounded-xl p-4 mb-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-red-400 uppercase">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>The Premonition Chain Reaction</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            You are at a glittering observation lounge party with <strong>100 guests</strong>. In <strong>30 seconds</strong>, disaster strikes! Call the <strong className="text-amber-400">Express Elevator</strong> and choose your escape route: <strong className="text-emerald-400">Floor 1 (The Exit)</strong>, <strong className="text-cyan-400">Floor 2 (Pathway to Tower 2)</strong>, or the <strong className="text-amber-300">Kitchen Floor</strong>!
          </p>
        </div>

        {/* Controls Guide */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-3 text-center flex flex-col items-center">
            <Move className="w-6 h-6 text-amber-400 mb-1" />
            <div className="text-xs font-bold text-zinc-200">Joystick / WASD</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">3D Movement</div>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-3 text-center flex flex-col items-center">
            <Hand className="w-6 h-6 text-amber-400 mb-1" />
            <div className="text-xs font-bold text-zinc-200">INTERACT [E]</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Call & Ride Elevator</div>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-3 text-center flex flex-col items-center">
            <Wind className="w-6 h-6 text-red-400 mb-1" />
            <div className="text-xs font-bold text-zinc-200">DODGE [Space]</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Evade Death Traps</div>
          </div>
        </div>

        {/* Start Game Action */}
        <button
          onClick={onStart}
          className="w-full py-4 rounded-xl font-bold tracking-widest text-sm uppercase bg-gradient-to-r from-red-700 via-red-600 to-amber-600 hover:from-red-600 hover:to-amber-500 text-white shadow-[0_0_30px_rgba(220,38,38,0.6)] flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <Play className="w-5 h-5 fill-white" />
          <span>ENTER SKYVIEW TOWER</span>
        </button>
      </div>
    </div>
  );
};
