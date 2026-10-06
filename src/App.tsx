import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FloorId,
  ElevatorCabinState,
  InteractableItem,
  Position3D,
  PlayerStats,
  GameStatus,
  CollapsePhase,
} from './types/game';
import { sounds } from './audio/soundEngine';
import { ThreeCanvas } from './components/ThreeCanvas';
import { Joystick } from './components/Joystick';
import { ActionButtons } from './components/ActionButtons';
import { HUD } from './components/HUD';
import { ElevatorConsole } from './components/ElevatorConsole';
import { StoryIntroModal } from './components/StoryIntroModal';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';

export default function App() {
  const [gameStatus, setGameStatus] = useState<GameStatus>('intro');
  const [gameSessionId, setGameSessionId] = useState<number>(1);
  const [currentFloorId, setCurrentFloorId] = useState<FloorId>(4); // Start on Floor 4 (Rooftop Party)
  const [collapseTimer, setCollapseTimer] = useState<number>(0);
  const [playerPosition, setPlayerPosition] = useState<Position3D>({ x: 0, y: 60, z: 10 });
  const [nearbyInteractable, setNearbyInteractable] = useState<InteractableItem | null>(null);
  const [isElevatorConsoleOpen, setIsElevatorConsoleOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [cameraShake, setCameraShake] = useState(0);
  const [escapeReason, setEscapeReason] = useState<string>('Escaped the collapse of Skyview Tower!');

  // Joystick & Movement Vector
  const [joystickVector, setJoystickVector] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const keysDown = useRef<{ [key: string]: boolean }>({});

  // Player Stats
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    health: 100,
    maxHealth: 100,
    stamina: 100,
    premonitionInstinct: 100,
    deathsDefied: 0,
    inventory: ['VIP Party Pass'],
    isDodging: false,
    dodgeCooldown: 0,
    isDead: false,
  });

  // Elevator State
  const [elevatorState, setElevatorState] = useState<ElevatorCabinState>({
    currentFloor: 4,
    targetFloor: 4,
    doorState: 'closed',
    doorProgress: 0,
    isMoving: false,
    cableIntegrity: 100,
    powerOnline: true,
    isPlayerInside: false,
    emergencyOverrideUnlocked: false,
  });

  // Calculate current collapse phase
  const getCollapsePhase = (time: number): CollapsePhase => {
    if (time < 30) return 'party';
    if (time < 40) return 'rooftop_collapse';
    if (time < 50) return 'dancefloor_collapse';
    if (time < 65) return 'tower_tilting';
    if (time < 80) return 'kitchen_explosion';
    return 'final_elevator_escape';
  };

  const collapsePhase = getCollapsePhase(collapseTimer);

  const triggerShake = useCallback((intensity = 1.0) => {
    setCameraShake(intensity);
    setTimeout(() => setCameraShake(0), 450);
  }, []);

  // Collapse Timer Ticker
  useEffect(() => {
    if (gameStatus !== 'playing') return;

    const interval = setInterval(() => {
      setCollapseTimer((prev) => {
        const next = prev + 0.1;

        // Stage 1 Transition (T = 30s): Rooftop Collapse!
        if (prev < 30 && next >= 30) {
          sounds.playRoofCollapseCrash();
          triggerShake(2.5);
        }

        // Stage 2 Transition (T = 40s): Dance Floor Shatters!
        if (prev < 40 && next >= 40) {
          sounds.playGlassCrack();
          sounds.playCableSnap();
          triggerShake(2.2);
        }

        // Stage 3 Transition (T = 50s): Tower Tilts on All Floors!
        if (prev < 50 && next >= 50) {
          sounds.playStructuralGroan();
          triggerShake(2.4);
        }

        // Stage 5 Transition (T = 65s): Kitchen Floor Gas Explosion & Fireball!
        if (prev < 65 && next >= 65) {
          sounds.playKitchenExplosion();
          triggerShake(3.5);
        }

        // Final Stage (T = 80s): Final Collapse Siren
        if (prev < 80 && next >= 80) {
          sounds.playAlarmSiren();
          triggerShake(2.0);
        }

        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [gameStatus, triggerShake]);

  // Keyboard Movement & Actions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStatus !== 'playing') return;
      keysDown.current[e.key.toLowerCase()] = true;

      if (e.code === 'Space' || e.key === 'Shift') {
        e.preventDefault();
        handleDodge();
      }

      if (e.key.toLowerCase() === 'e' || e.key === 'Enter') {
        e.preventDefault();
        handleInteract();
      }

      updateKeyboardJoystick();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDown.current[e.key.toLowerCase()] = false;
      updateKeyboardJoystick();
    };

    const updateKeyboardJoystick = () => {
      const keys = keysDown.current;
      let x = 0;
      let y = 0;
      if (keys['w'] || keys['arrowup']) y -= 1;
      if (keys['s'] || keys['arrowdown']) y += 1;
      if (keys['a'] || keys['arrowleft']) x -= 1;
      if (keys['d'] || keys['arrowright']) x += 1;

      if (x !== 0 || y !== 0) {
        const mag = Math.hypot(x, y);
        setJoystickVector({ x: x / mag, y: y / mag });
      } else {
        setJoystickVector((prev) => {
          if (Math.abs(prev.x) === 1 || Math.abs(prev.y) === 1) {
            return { x: 0, y: 0 };
          }
          return prev;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameStatus, nearbyInteractable, playerStats.dodgeCooldown]);

  // Dodge Action
  const handleDodge = useCallback(() => {
    if (playerStats.dodgeCooldown > 0 || playerStats.isDodging) return;

    sounds.playDodge();
    setPlayerStats((prev) => ({
      ...prev,
      isDodging: true,
      dodgeCooldown: 1.5,
      deathsDefied: prev.deathsDefied + 1,
    }));

    setTimeout(() => {
      setPlayerStats((prev) => ({ ...prev, isDodging: false }));
    }, 400);
  }, [playerStats.dodgeCooldown, playerStats.isDodging]);

  // Dodge Cooldown
  useEffect(() => {
    if (playerStats.dodgeCooldown <= 0) return;
    const timer = setInterval(() => {
      setPlayerStats((prev) => {
        if (prev.dodgeCooldown <= 0.1) {
          return { ...prev, dodgeCooldown: 0 };
        }
        return { ...prev, dodgeCooldown: prev.dodgeCooldown - 0.1 };
      });
    }, 100);
    return () => clearInterval(timer);
  }, [playerStats.dodgeCooldown]);

  // Elevator Door Animation Ticker
  useEffect(() => {
    if (elevatorState.doorState === 'opening') {
      sounds.playElevatorDoor();
      const interval = setInterval(() => {
        setElevatorState((prev) => {
          if (prev.doorProgress >= 1) {
            clearInterval(interval);
            return { ...prev, doorState: 'open', doorProgress: 1 };
          }
          return { ...prev, doorProgress: prev.doorProgress + 0.15 };
        });
      }, 50);
      return () => clearInterval(interval);
    }

    if (elevatorState.doorState === 'closing') {
      sounds.playElevatorDoor();
      const interval = setInterval(() => {
        setElevatorState((prev) => {
          if (prev.doorProgress <= 0) {
            clearInterval(interval);
            return {
              ...prev,
              doorState: 'closed',
              doorProgress: 0,
            };
          }
          return { ...prev, doorProgress: prev.doorProgress - 0.15 };
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [elevatorState.doorState]);

  // Dedicated INTERACT handler for elevator and panels
  const handleInteract = () => {
    if (!nearbyInteractable) return;
    sounds.playInteract();

    const item = nearbyInteractable;

    // Call elevator / Open doors
    if (item.type === 'elevator_call') {
      if (elevatorState.doorState === 'closed') {
        sounds.playElevatorChime();
        setElevatorState((prev) => ({ ...prev, doorState: 'opening' }));
      } else {
        // Step into elevator cabin & open console
        setElevatorState((prev) => ({ ...prev, isPlayerInside: true }));
        setIsElevatorConsoleOpen(true);
      }
      return;
    }

    // Inside elevator panel: Open floor selector console
    if (item.type === 'elevator_interior_panel') {
      setIsElevatorConsoleOpen(true);
      return;
    }

    // Floor 2 Skybridge Gate Escape
    if (item.id === 'tower2_gate_escape' || (item.type === 'evac_hatch' && currentFloorId === 2)) {
      sounds.playVictory();
      setEscapeReason('You crossed the high-altitude glass skybridge into Tower 2 as Tower 1 collapsed behind you!');
      setGameStatus('victory');
      return;
    }

    // Floor 1 Lobby Street Exit Escape
    if (item.id === 'lobby_exit_escape' || (item.type === 'evac_hatch' && currentFloorId === 1)) {
      sounds.playVictory();
      setEscapeReason('You escaped out through the ground lobby glass doors to safety just as debris smashed into the roof!');
      setGameStatus('victory');
      return;
    }

    // Kitchen Gas Valve
    if (item.type === 'steam_valve') {
      sounds.playSpark();
      setPlayerStats((prev) => ({
        ...prev,
        deathsDefied: prev.deathsDefied + 1,
      }));
      setNearbyInteractable((prev) =>
        prev ? { ...prev, promptLabel: 'GAS VALVE SAFELY ISOLATED' } : null
      );
      return;
    }
  };

  // Handle Destination Floor Selection in Elevator Console
  const handleSelectElevatorFloor = (targetFloor: FloorId) => {
    setIsElevatorConsoleOpen(false);
    sounds.playElevatorDoor();

    setElevatorState((prev) => ({
      ...prev,
      targetFloor,
      doorState: 'closing',
      isMoving: true,
    }));

    // Elevator transit time
    setTimeout(() => {
      setCurrentFloorId(targetFloor);
      sounds.playElevatorChime();
      setElevatorState((prev) => ({
        ...prev,
        currentFloor: targetFloor,
        isMoving: false,
        doorState: 'opening',
      }));
    }, 1800);
  };

  // Player Death Callback
  const handlePlayerDeath = (cause: string) => {
    if (playerStats.isDead) return;
    sounds.playDeathStinger();
    triggerShake(2.5);
    setPlayerStats((prev) => ({
      ...prev,
      health: 0,
      isDead: true,
      deathCause: cause,
    }));
    setGameStatus('gameover');
  };

  // Restart / Retry
  const handleRestart = () => {
    setGameSessionId((prev) => prev + 1);
    setCurrentFloorId(4); // Reset to rooftop party
    setCollapseTimer(0);
    setJoystickVector({ x: 0, y: 0 });
    setIsElevatorConsoleOpen(false);
    setNearbyInteractable(null);
    setPlayerStats({
      health: 100,
      maxHealth: 100,
      stamina: 100,
      premonitionInstinct: 100,
      deathsDefied: 0,
      inventory: ['VIP Party Pass'],
      isDodging: false,
      dodgeCooldown: 0,
      isDead: false,
    });
    setElevatorState({
      currentFloor: 4,
      targetFloor: 4,
      doorState: 'closed',
      doorProgress: 0,
      isMoving: false,
      cableIntegrity: 100,
      powerOnline: true,
      isPlayerInside: false,
      emergencyOverrideUnlocked: false,
    });
    setGameStatus('playing');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none font-sans">
      {/* 3D THREE.JS CANVAS */}
      <ThreeCanvas
        key={gameSessionId}
        currentFloorId={currentFloorId}
        collapsePhase={collapsePhase}
        collapseTimer={collapseTimer}
        elevatorState={elevatorState}
        joystickVector={joystickVector}
        isDodging={playerStats.isDodging}
        onPlayerPositionChange={setPlayerPosition}
        onNearInteractable={setNearbyInteractable}
        onPlayerDeath={handlePlayerDeath}
        onEscapeElevator={() => {
          sounds.playVictory();
          setGameStatus('victory');
        }}
        cameraShake={cameraShake}
      />

      {/* HEADS UP DISPLAY */}
      {gameStatus === 'playing' && (
        <HUD
          currentFloorId={currentFloorId}
          playerStats={playerStats}
          elevatorState={elevatorState}
          collapsePhase={collapsePhase}
          collapseTimer={collapseTimer}
          isMuted={isMuted}
          onToggleMute={() => {
            const next = !isMuted;
            setIsMuted(next);
            sounds.setMuted(next);
          }}
          canOpenElevatorConsole={
            nearbyInteractable?.type === 'elevator_interior_panel' ||
            nearbyInteractable?.type === 'elevator_call'
          }
          onOpenElevatorConsole={() => setIsElevatorConsoleOpen(true)}
        />
      )}

      {/* VIRTUAL JOYSTICK & ACTION BUTTONS */}
      {gameStatus === 'playing' && (
        <div className="fixed bottom-6 left-0 right-0 px-6 sm:px-10 flex items-end justify-between pointer-events-none z-30">
          {/* JOYSTICK */}
          <div className="pointer-events-auto">
            <Joystick
              onMove={(vec) => setJoystickVector(vec)}
              disabled={playerStats.isDead}
            />
          </div>

          {/* INTERACT & DODGE BUTTONS */}
          <div className="pointer-events-auto">
            <ActionButtons
              nearbyInteractable={nearbyInteractable}
              onInteract={handleInteract}
              onDodge={handleDodge}
              isDodging={playerStats.isDodging}
              dodgeCooldown={playerStats.dodgeCooldown}
              disabled={playerStats.isDead}
            />
          </div>
        </div>
      )}

      {/* ELEVATOR CONSOLE MODAL */}
      {isElevatorConsoleOpen && (
        <ElevatorConsole
          cabinState={elevatorState}
          currentFloorId={currentFloorId}
          inventory={playerStats.inventory}
          onSelectFloor={handleSelectElevatorFloor}
          onToggleEmergencyBrake={() => {
            sounds.playCableSnap();
            triggerShake(1.5);
          }}
          onClose={() => setIsElevatorConsoleOpen(false)}
        />
      )}

      {/* STORY INTRO MODAL */}
      {gameStatus === 'intro' && (
        <StoryIntroModal
          onStart={() => {
            sounds.playPartyBeat();
            setGameStatus('playing');
          }}
        />
      )}

      {/* GAME OVER MODAL */}
      {gameStatus === 'gameover' && (
        <GameOverModal
          deathCause={playerStats.deathCause}
          floorNumber={100}
          deathsDefied={playerStats.deathsDefied}
          onRetryFloor={handleRestart}
          onRestartAll={handleRestart}
        />
      )}

      {/* VICTORY MODAL */}
      {gameStatus === 'victory' && (
        <VictoryModal
          escapeReason={escapeReason}
          deathsDefied={playerStats.deathsDefied}
          onPlayAgain={handleRestart}
        />
      )}
    </div>
  );
}
