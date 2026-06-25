# Implementation Contracts

## 1. Core identifiers

```ts
type EntityId = number;
type StageId = string;
type TraitId = string;
type CosmeticId = string;
type DifficultyId = "calm" | "standard" | "abyss";
```

## 2. Vector and RNG

```ts
interface Vec2 {
  x: number;
  y: number;
}

interface RandomSource {
  next(): number;                 // [0, 1)
  range(min: number, max: number): number;
  int(minInclusive: number, maxExclusive: number): number;
  fork(label: string): RandomSource;
}
```

Gameplay and visual RNG streams must be separate.

## 3. Game state

```ts
interface GameState {
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
```

## 4. Player

```ts
interface PlayerState {
  position: Vec2;
  previousPosition: Vec2;
  velocity: Vec2;
  currentMass: number;
  targetMass: number;
  invulnerabilitySeconds: number;
  blob: BlobState;
  equippedTraitId: TraitId | null;
}
```

Radius is derived with `sqrt(mass)` unless cached and invalidated centrally.

## 5. Camera

```ts
interface CameraState {
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
```

## 6. Entity relationship

```ts
type Relationship = "edible" | "contested" | "threat";

interface RelationshipPolicy {
  edibleEnterRatio: number;
  edibleExitRatio: number;
  threatEnterRatio: number;
  threatExitRatio: number;
}
```

`RelationshipSystem` owns hysteresis state. AI and rendering consume the resolved relationship.

## 7. Systems

```ts
interface GameSystem {
  update(state: GameState, context: UpdateContext): void;
}

interface UpdateContext {
  dt: number;
  input: InputSnapshot;
  config: GameConfig;
  gameplayRandom: RandomSource;
}
```

Recommended fixed order:

1. lifecycle guards;
2. input intent;
3. stat resolution;
4. movement;
5. relationship;
6. enemy AI;
7. spatial index;
8. collision;
9. absorption;
10. growth;
11. blob;
12. camera;
13. stage;
14. world streaming;
15. run statistics;
16. event finalization.

Order changes require an ADR and regression tests.

## 8. Domain events

```ts
type DomainEvent =
  | { type: "absorption-started"; sourceId: EntityId; ratio: number }
  | { type: "absorption-committed"; sourceId: EntityId; gainedMass: number; angle: number }
  | { type: "player-damaged"; sourceId: EntityId; lostMass: number; angle: number }
  | { type: "near-miss"; sourceId: EntityId; distanceRatio: number }
  | { type: "expansion-started"; from: number; to: number }
  | { type: "expansion-completed"; stageIndex: number }
  | { type: "run-settled"; reward: number; reason: "voluntary" | "death" };
```

## 9. Renderer contract

```ts
interface RenderSnapshot {
  alpha: number;
  viewport: Viewport;
  player: RenderPlayer;
  camera: RenderCamera;
  stage: RenderStage;
  entities: readonly RenderEntity[];
  effects: readonly RenderEffect[];
}

interface GameRenderer {
  resize(viewport: Viewport): void;
  render(snapshot: RenderSnapshot): void;
  setQuality(quality: QualityLevel): void;
}
```

Renderer consumes immutable snapshots or read-only projections.

## 10. Input contract

```ts
interface InputSnapshot {
  move: Vec2;
  moveMagnitude: number;
  pausePressed: boolean;
  settlePressed: boolean;
  inputMethod: "keyboard" | "mouse" | "touch" | "gamepad";
}
```

One-shot controls are edge-triggered and cleared after consumption.

## 11. Persistence contract

```ts
interface SaveRepository {
  load(): Promise<LoadResult>;
  save(profile: PersistentProfile, reason: SaveReason): Promise<SaveResult>;
  export(): Promise<string>;
  validateImport(raw: string): Promise<ImportPreview>;
  import(raw: string): Promise<SaveResult>;
}
```

Application code uses this interface, not IndexedDB directly.

## 12. Config contract

```ts
interface GameConfig {
  schemaVersion: number;
  simulation: SimulationConfig;
  movement: MovementConfig;
  relationship: RelationshipConfig;
  absorption: AbsorptionConfig;
  damage: DamageConfig;
  camera: CameraConfig;
  blob: BlobConfig;
  world: WorldConfig;
  progression: ProgressionConfig;
  stages: readonly StageConfig[];
  enemies: readonly EnemyArchetypeConfig[];
  traits: readonly TraitDefinition[];
}
```

Config is deeply frozen after validation.

## 13. Diagnostics

```ts
interface PerformanceSample {
  timestamp: number;
  fps: number;
  frameMs: number;
  updateMs: number;
  renderMs: number;
  entityCount: number;
  particleCount: number;
  droppedSteps: number;
  heapBytes?: number;
}
```

Diagnostics may be disabled in production but hooks remain testable.
