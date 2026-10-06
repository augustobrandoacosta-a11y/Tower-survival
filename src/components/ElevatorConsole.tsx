import React from 'react';
import { X, AlertTriangle, ShieldCheck, ArrowUpCircle, Phone, Lock, Zap } from 'lucide-react';
import { FloorId, ElevatorCabinState } from '../types/game';
import { TOWER_FLOORS } from '../game/towerLevels';

interface ElevatorConsoleProps {
  cabinState: ElevatorCabinState;
  currentFloorId: FloorId;
  inventory: string[];
  onSelectFloor: (target: FloorId) => void;
  onToggleEmergencyBrake: () => void;
  onClose: () => void;
}

export const ElevatorConsole: React.FC<ElevatorConsoleProps> = ({
  cabinState,
  currentFloorId,
  inventory,
  onSelectFloor,
  onToggleEmergencyBrake,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-950 border-2 border-amber-500/70 rounded-xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.3)] text-zinc-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-base font-bold tracking-wider uppercase font-mono text-amber-400">
                Skyview Express Carriage 01
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">High-Speed Sky Elevator · Emergency Override Active</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Telemetry / Cable Tension Bar */}
        <div className="mb-5 bg-zinc-900/90 rounded-lg p-3 border border-zinc-800 space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-zinc-400">Main Hoist Cable Integrity:</span>
            <span className={`font-bold ${cabinState.cableIntegrity < 50 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
              {Math.round(cabinState.cableIntegrity)}%
            </span>
          </div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                cabinState.cableIntegrity < 50
                  ? 'bg-red-500 shadow-[0_0_10px_#ef4444]'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${cabinState.cableIntegrity}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1 text-zinc-400">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Power: Grid Online
            </span>
            <span className="flex items-center gap-1 font-mono">
              Current Location: Floor {currentFloorId}
            </span>
          </div>
        </div>

        {/* Floor Selection Grid */}
        <div className="space-y-2.5 mb-5">
          <div className="text-xs uppercase font-mono tracking-wider text-amber-400 font-bold mb-2 flex items-center justify-between">
            <span>Select Destination Floor:</span>
            <span className="text-[10px] text-zinc-400 font-normal">Push to travel</span>
          </div>
          {TOWER_FLOORS.map((floor) => {
            const isCurrent = currentFloorId === floor.id;

            return (
              <button
                key={floor.id}
                onClick={() => {
                  if (!isCurrent && !cabinState.isMoving) {
                    onSelectFloor(floor.id);
                    onClose();
                  }
                }}
                disabled={isCurrent || cabinState.isMoving}
                className={`w-full text-left p-3 rounded-lg border transition-all duration-150 flex items-center justify-between ${
                  isCurrent
                    ? 'border-amber-500 bg-amber-500/15 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                    : 'border-zinc-800 bg-zinc-900/70 hover:bg-zinc-800/90 hover:border-amber-500/60 text-zinc-200 active:scale-[0.99]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg font-mono font-bold flex items-center justify-center text-sm border ${
                      isCurrent
                        ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                        : 'border-zinc-700 bg-zinc-800 text-zinc-200'
                    }`}
                  >
                    FL {floor.id}
                  </div>
                  <div>
                    <div className="text-sm font-semibold flex items-center gap-2">
                      <span>{floor.title}</span>
                      {isCurrent && (
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-zinc-400">{floor.subtitle}</div>
                  </div>
                </div>

                <div>
                  {isCurrent ? (
                    <span className="text-xs font-mono text-amber-400">You are here</span>
                  ) : (
                    <div className="flex items-center gap-1 text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded border border-emerald-800/40">
                      <ArrowUpCircle className="w-3.5 h-3.5" />
                      <span>Take Lift</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Emergency Secondary Controls */}
        <div className="pt-3 border-t border-zinc-800/80 flex items-center gap-2">
          <button
            onClick={onToggleEmergencyBrake}
            className="flex-1 py-2.5 px-3 rounded-lg border border-red-800/80 bg-red-950/40 hover:bg-red-900/50 text-red-300 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
          >
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>Emergency Brake Stop</span>
          </button>

          <button
            onClick={() => {
              // Intercom Easter Egg / Horror warning
              alert("INTERCOM STATIC: '...Warning... structural failure on Level 102... get off the lift... Death is already on board!'");
            }}
            className="py-2.5 px-3 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Phone className="w-4 h-4 text-zinc-400" />
            <span>Intercom</span>
          </button>
        </div>
      </div>
    </div>
  );
};
