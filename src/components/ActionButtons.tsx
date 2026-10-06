import React from 'react';
import { Hand, Wind, Zap } from 'lucide-react';
import { InteractableItem } from '../types/game';

interface ActionButtonsProps {
  nearbyInteractable: InteractableItem | null;
  onInteract: () => void;
  onDodge: () => void;
  isDodging: boolean;
  dodgeCooldown: number;
  disabled?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  nearbyInteractable,
  onInteract,
  onDodge,
  isDodging,
  dodgeCooldown,
  disabled = false,
}) => {
  const hasInteractable = nearbyInteractable !== null;

  return (
    <div className="flex items-end gap-3 select-none">
      {/* DODGE / SPRINT BUTTON */}
      <button
        onClick={onDodge}
        disabled={disabled || dodgeCooldown > 0}
        aria-label="Dodge danger"
        className={`w-16 h-16 rounded-full flex flex-col items-center justify-center transition-all duration-150 backdrop-blur-md active:scale-90 border-2 ${
          dodgeCooldown > 0
            ? 'bg-zinc-900/60 border-zinc-700 text-zinc-500 cursor-not-allowed'
            : isDodging
            ? 'bg-red-600 border-red-400 text-white shadow-[0_0_20px_rgba(239,68,68,0.8)] scale-95'
            : 'bg-zinc-900/80 border-white/20 text-zinc-200 hover:border-red-500/50 shadow-lg'
        }`}
      >
        <Wind className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] font-bold tracking-widest uppercase">
          {dodgeCooldown > 0 ? `${Math.ceil(dodgeCooldown)}s` : 'DODGE'}
        </span>
      </button>

      {/* PRIMARY INTERACT BUTTON */}
      <div className="relative">
        {hasInteractable && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/90 text-amber-300 text-xs font-semibold px-3 py-1 rounded border border-amber-500/50 shadow-md animate-bounce pointer-events-none flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{nearbyInteractable.promptLabel}</span>
          </div>
        )}

        <button
          onClick={onInteract}
          disabled={disabled || !hasInteractable}
          aria-label={nearbyInteractable?.promptLabel || 'Interact'}
          className={`w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-200 font-bold tracking-wider active:scale-95 border-2 ${
            hasInteractable
              ? 'bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 border-amber-300 text-white shadow-[0_0_25px_rgba(245,158,11,0.6)] animate-pulse'
              : 'bg-black/60 border-zinc-700/60 text-zinc-500 shadow-md cursor-not-allowed opacity-60'
          }`}
        >
          <Hand className={`w-8 h-8 mb-1 transition-transform ${hasInteractable ? 'scale-110 text-amber-200' : 'text-zinc-500'}`} />
          <span className="text-xs uppercase tracking-widest font-black">
            INTERACT
          </span>
          <span className="text-[9px] font-mono text-amber-200/80 mt-0.5">[E]</span>
        </button>
      </div>
    </div>
  );
};
