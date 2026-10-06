import React from 'react';
import { Volume2, VolumeX, Shield, Heart, Users, Clock, AlertOctagon, Radio } from 'lucide-react';
import { FloorId, PlayerStats, ElevatorCabinState, CollapsePhase } from '../types/game';

interface HUDProps {
  currentFloorId: FloorId;
  playerStats: PlayerStats;
  elevatorState: ElevatorCabinState;
  collapsePhase: CollapsePhase;
  collapseTimer: number;
  isMuted: boolean;
  onToggleMute: () => void;
  canOpenElevatorConsole: boolean;
  onOpenElevatorConsole: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  currentFloorId,
  playerStats,
  elevatorState,
  collapsePhase,
  collapseTimer,
  isMuted,
  onToggleMute,
  canOpenElevatorConsole,
  onOpenElevatorConsole,
}) => {
  const secondsLeftToDisaster = Math.max(0, 30 - Math.floor(collapseTimer));

  const getFloorName = () => {
    switch (currentFloorId) {
      case 4: return 'Floor 4 · Skyview Rooftop & Dance Lounge';
      case 3: return 'Floor 3 · Kitchen Floor';
      case 2: return 'Floor 2 · Pathway to Tower 2';
      case 1: return 'Floor 1 · The Exit (Ground Plaza)';
      default: return `Floor ${currentFloorId}`;
    }
  };

  const getPhaseTitle = () => {
    switch (collapsePhase) {
      case 'party':
        return `GALA IN PROGRESS · DISASTER IN ${secondsLeftToDisaster}s`;
      case 'rooftop_collapse':
        return 'STAGE 1: ROOFTOP & SPIRE COLLAPSE!';
      case 'dancefloor_collapse':
        return 'STAGE 2: DANCE FLOOR DISINTEGRATION!';
      case 'tower_tilting':
        return 'STAGE 3: TOWER TILTING 20° - ALL FLOORS AFFECTED!';
      case 'kitchen_explosion':
        return 'STAGE 5: KITCHEN FLOOR GAS EXPLOSION & FIREBALL!';
      case 'final_elevator_escape':
        return 'FINAL STAGE: TOTAL COLLAPSE IMMINENT - ESCAPE NOW!';
      default:
        return 'SKYVIEW TOWER';
    }
  };

  const getPhaseColor = () => {
    if (collapsePhase === 'party') {
      return secondsLeftToDisaster <= 10 ? 'text-amber-400 border-amber-500/50' : 'text-cyan-400 border-cyan-500/40';
    }
    return 'text-red-400 border-red-500/60 bg-red-950/40 animate-pulse';
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-30 flex flex-col justify-between p-3 sm:p-5">
      {/* TOP HEADER HUD */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-black/70 backdrop-blur-md border border-white/10 rounded-xl p-3 sm:px-5 pointer-events-auto">
        {/* Title & Disaster Ticker */}
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                collapsePhase === 'party' ? 'bg-cyan-400 animate-ping' : 'bg-red-600 animate-ping'
              }`}
            />
            <h1 className="text-xs sm:text-sm font-black tracking-widest font-mono uppercase text-zinc-100">
              FINAL DESTINATION: BLOODLINES
            </h1>
            <span className="text-zinc-600">|</span>
            <span className="text-xs font-mono font-bold text-amber-300">
              {getFloorName()}
            </span>
          </div>

          <div
            className={`mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-bold border ${getPhaseColor()}`}
          >
            {collapsePhase === 'party' ? (
              <Clock className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <AlertOctagon className="w-3.5 h-3.5" />
            )}
            <span>{getPhaseTitle()}</span>
          </div>
        </div>

        {/* Guest Bots Counter & Objectives */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800 rounded-lg px-3 py-1 text-xs font-mono text-zinc-200">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>100 Party Bots</span>
          </div>

          {/* Health */}
          <div className="flex items-center gap-1.5 bg-black/60 border border-zinc-800 rounded-lg px-2.5 py-1">
            <Heart
              className={`w-4 h-4 ${
                playerStats.health < 40 ? 'text-red-500 animate-pulse' : 'text-emerald-400'
              }`}
            />
            <div className="w-16 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  playerStats.health < 40 ? 'bg-red-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${playerStats.health}%` }}
              />
            </div>
            <span className="text-[11px] font-mono font-bold text-zinc-200">{playerStats.health}%</span>
          </div>

          {/* Quick elevator access button if at elevator */}
          {canOpenElevatorConsole && (
            <button
              onClick={onOpenElevatorConsole}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Board Lift</span>
            </button>
          )}

          {/* Audio toggle */}
          <button
            onClick={onToggleMute}
            aria-label="Toggle sound"
            className="p-1.5 bg-zinc-900 border border-zinc-700 hover:border-zinc-500 rounded-lg text-zinc-300 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* DISASTER STAGE INSTRUCTION BANNER (Bottom Center) */}
      <div className="flex justify-center pointer-events-none mb-2">
        <div className="bg-black/85 backdrop-blur-md border border-white/10 rounded-xl px-4 py-2 text-center max-w-lg">
          {collapsePhase === 'party' && (
            <p className="text-xs text-zinc-300">
              Enjoy the bright observation deck celebration with 100 party guests. <strong className="text-amber-400">In {secondsLeftToDisaster}s, Death's catastrophic collapse begins!</strong>
            </p>
          )}
          {collapsePhase === 'rooftop_collapse' && (
            <p className="text-xs text-red-300 font-semibold animate-pulse">
              ROOFTOP SPIRE HAS CRASHED THROUGH THE CEILING! Dodge falling glass and head toward the elevator!
            </p>
          )}
          {collapsePhase === 'dancefloor_collapse' && (
            <p className="text-xs text-red-400 font-semibold animate-pulse">
              THE DANCE FLOOR HAS SHATTERED INTO THE 1,300FT VOID! Stay on the outer perimeter catwalk!
            </p>
          )}
          {collapsePhase === 'tower_tilting' && (
            <p className="text-xs text-amber-300 font-bold animate-pulse">
              TOWER IS TILTING 20 DEGREES! Slope gravity affects all floors—fight the slide toward the edge!
            </p>
          )}
          {collapsePhase === 'kitchen_explosion' && (
            <p className="text-xs text-orange-400 font-extrabold animate-pulse">
              STAGE 5: KITCHEN FLOOR GAS EXPLOSION! A massive fireball blew out Floor 3! Flaming debris raining across all floors!
            </p>
          )}
          {collapsePhase === 'final_elevator_escape' && (
            <p className="text-xs text-emerald-400 font-bold animate-pulse">
              TOTAL STRUCTURAL COLLAPSE IMMINENT! Escape to Tower 2 (FL 2), exit the Lobby (FL 1), or ride the Lift!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
