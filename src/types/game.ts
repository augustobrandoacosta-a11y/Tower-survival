export type FloorId = 1 | 2 | 3 | 4;

export type CollapsePhase =
  | 'party' // 0 - 30 seconds: Bright tower, 100 dancing bots
  | 'rooftop_collapse' // 30 - 40s: Spire and roof shatter inwards, sirens all floors
  | 'dancefloor_collapse' // 40 - 50s: Central dance floor shatters, debris drops down tower
  | 'tower_tilting' // 50 - 65s: Entire tower tilts 20 degrees, gravity pull on all floors
  | 'kitchen_explosion' // 65 - 80s: Stage 5 - Kitchen gas lines rupture into massive fireball!
  | 'final_elevator_escape'; // 80s+: Total structural failure imminent, final escape!

export interface BotState {
  id: number;
  x: number;
  y: number;
  z: number;
  rotation: number;
  targetX: number;
  targetZ: number;
  state: 'dancing' | 'mingling' | 'panicking' | 'falling' | 'holding_on';
  fallVelocity: number;
  colorHex: number;
  fallen: boolean;
}

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export type ElevatorDoorState = 'closed' | 'opening' | 'open' | 'closing';

export interface ElevatorCabinState {
  currentFloor: number; // can animate between 1 and 4
  targetFloor: number;
  doorState: ElevatorDoorState;
  doorProgress: number; // 0 (closed) to 1 (open)
  isMoving: boolean;
  cableIntegrity: number; // 0 to 100%
  powerOnline: boolean;
  isPlayerInside: boolean;
  emergencyOverrideUnlocked: boolean;
}

export interface TowerFloorDef {
  id: FloorId;
  floorNumber: number;
  title: string;
  subtitle: string;
  heightY: number;
  description: string;
  objective: string;
  primaryHazard: string;
  atmosphereTone: string;
}

export interface InteractableItem {
  id: string;
  name: string;
  type:
    | 'elevator_call'
    | 'elevator_interior_panel'
    | 'keycard'
    | 'power_breaker'
    | 'steam_valve'
    | 'emergency_brake'
    | 'evac_hatch'
    | 'survivor';
  position: Position3D;
  radius: number;
  floorId: FloorId;
  isCompleted?: boolean;
  promptLabel: string;
  interactionTime?: number; // seconds needed
}

export interface HazardTrap {
  id: string;
  name: string;
  description: string;
  floorId: FloorId;
  position: Position3D;
  radius: number;
  type:
    | 'puddle_electricity'
    | 'cracking_glass'
    | 'falling_debris'
    | 'steam_jet'
    | 'cable_whip'
    | 'swaying_girder'
    | 'spire_lightning';
  warningActive: boolean;
  warningProgress: number; // 0 to 1
  triggered: boolean;
  lethal: boolean;
  damage: number;
  dodgeWindow: boolean;
}

export interface PremonitionAlertData {
  id: string;
  hazardId: string;
  title: string;
  omenDescription: string;
  remainingSeconds: number;
  maxSeconds: number;
  hint: string;
}

export interface PlayerStats {
  health: number;
  maxHealth: number;
  stamina: number;
  premonitionInstinct: number;
  deathsDefied: number;
  inventory: string[];
  isDodging: boolean;
  dodgeCooldown: number;
  isDead: boolean;
  deathCause?: string;
}

export type GameStatus = 'intro' | 'playing' | 'gameover' | 'victory';
