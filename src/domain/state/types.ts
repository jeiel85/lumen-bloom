import type { Vec2 } from "../math/Vec2";
import type { GameConfig } from "../../config/types";

export interface RandomSource {
  next(): number;
  range(min: number, max: number): number;
  int(minInclusive: number, maxExclusive: number): number;
  fork(label: string): RandomSource;
}

export interface BlobState {
  points: Vec2[];
  velocities: Vec2[];
}

export interface PlayerState {
  position: Vec2;
  previousPosition: Vec2;
  velocity: Vec2;
  currentMass: number;
  targetMass: number;
  invulnerabilitySeconds: number;
  blob: BlobState;
  equippedTraitId: string | null;
}

export interface CameraState {
  position: Vec2;
  previousPosition: Vec2;
  velocity: Vec2;
  zoom: number;
  zoomVelocity: number;
  targetZoom: number;
  transition: {
    active: boolean;
    fromStageIndex: number;
    toStageIndex: number;
    elapsed: number;
    progress: number;
  };
}

export interface StageState {
  currentStageIndex: number;
  currentStageId: string;
  stageProgress: number; // 0 to 1
}

// Simple stores placeholders for Goal 02
export interface EntityStore {
  activeCount: number;
}

export interface ParticleStore {
  activeCount: number;
}

export interface RunStats {
  elapsedSeconds: number;
  memoryShardsEarned: number;
}

export interface DomainEventBuffer {
  events: unknown[];
}

export interface GameState {
  tick: number;
  elapsedSeconds: number;
  status: "ready" | "running" | "paused" | "settling" | "ended";
  player: PlayerState;
  camera: CameraState;
  stage: StageState;
  entities: EntityStore;
  particles: ParticleStore;
  run: RunStats;
  events: DomainEventBuffer;
}

export interface InputSnapshot {
  move: Vec2;
  moveMagnitude: number;
  pausePressed: boolean;
  settlePressed: boolean;
  inputMethod: "keyboard" | "mouse" | "touch" | "gamepad";
}

export interface UpdateContext {
  dt: number;
  input: InputSnapshot;
  config: GameConfig;
  gameplayRandom: RandomSource;
}
