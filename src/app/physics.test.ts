import { describe, it, expect } from "vitest";
import { MovementSystem } from "../domain/systems/MovementSystem";
import { CameraSystem } from "../domain/systems/CameraSystem";
import { MulberryRandom } from "../domain/math/Random";
import type { GameState, UpdateContext, InputSnapshot } from "../domain/state/types";
import { Vec2 } from "../domain/math/Vec2";
import type { GameConfig } from "../config/types";

// Setup mock config for test integration
const mockConfig: GameConfig = {
  schemaVersion: 1,
  simulation: { fixedHz: 60, maxFrameDeltaSeconds: 0.1, maxStepsPerFrame: 5 },
  movement: {
    maxScreenSpeed: 260,
    accelerationResponseSeconds: 0.3,
    coastToTenPercentSeconds: 0.8,
    cameraLookAheadFraction: 0.06
  },
  relationship: { edibleEnterRatio: 0.9, edibleExitRatio: 0.95, threatEnterRatio: 1.1, threatExitRatio: 1.05 },
  absorption: { magnetRadiusMultiplier: 1.5, commonEfficiency: 0.8, creatureEfficiency: 0.7, fragmentEfficiency: 0.5, growthResponse: 5, mergeDurationMin: 0.1, mergeDurationMax: 0.3 },
  damage: { massFraction: 0.2, invulnerabilitySeconds: 1.0, recoverableMassMinFraction: 0.2, recoverableMassMaxFraction: 0.4 },
  camera: { targetScreenFraction: 0.05, triggerScreenFraction: 0.08, deathScreenFraction: 0.02, springStiffness: 40, springDamping: 12, transitionMaxSeconds: 1.0, retriggerCooldownSeconds: 0.2 },
  blob: { pointsLow: 12, pointsMedium: 16, pointsHigh: 20, spring: 50, damping: 10, neighborTension: 20, minOffset: -0.05, maxOffset: 0.05 },
  world: { prewarmRadiusMultiplier: 1.2, cullRadiusMultiplier: 1.5, spawnInnerMultiplier: 0.8, spawnOuterMultiplier: 1.2, originRebaseThreshold: 10000, maxParticlesLow: 200, maxParticlesHigh: 500 },
  progression: { voluntaryEfficiency: 1.0, deathEfficiency: 0.5, difficultyMultiplier: { calm: 0.8, standard: 1.0, abyss: 1.5 } },
  stages: [
    { id: "light-dust", index: 0, nameKo: "빛가루", nameEn: "Light Dust", background: "void-dust", audioStem: ["base"], threatBudget: 0.2 }
  ],
  enemies: [],
  traits: []
};

// Create a clean transient test state
function createTestState(): GameState {
  return {
    tick: 0,
    elapsedSeconds: 0,
    status: "running",
    player: {
      position: Vec2.create(0, 0),
      previousPosition: Vec2.create(0, 0),
      velocity: Vec2.create(0, 0),
      currentMass: 10,
      targetMass: 10,
      invulnerabilitySeconds: 0,
      blob: { points: [], velocities: [] },
      equippedTraitId: null
    },
    camera: {
      position: Vec2.create(0, 0),
      previousPosition: Vec2.create(0, 0),
      velocity: Vec2.create(0, 0),
      zoom: 1.0,
      zoomVelocity: 0.0,
      targetZoom: 1.0,
      transition: { active: false, fromStageIndex: 0, toStageIndex: 0, elapsed: 0, progress: 0 }
    },
    stage: { currentStageIndex: 0, currentStageId: "light-dust", stageProgress: 0 },
    entities: { activeCount: 0 },
    particles: { activeCount: 0 },
    run: { elapsedSeconds: 0, memoryShardsEarned: 0 },
    events: { events: [] }
  };
}

describe("Movement Framerate Independence", () => {
  it("should cover similar distances over 1 second across 30Hz, 60Hz, and 120Hz ticks", () => {
    const input: InputSnapshot = {
      move: Vec2.create(1, 0), // Move east
      moveMagnitude: 1.0,
      pausePressed: false,
      settlePressed: false,
      inputMethod: "keyboard"
    };

    const runSim = (hz: number): Vec2 => {
      const state = createTestState();
      const movementSystem = new MovementSystem();
      const dt = 1 / hz;
      const totalSteps = hz; // exactly 1 second

      for (let i = 0; i < totalSteps; i++) {
        const context: UpdateContext = {
          dt,
          input,
          config: mockConfig,
          gameplayRandom: new MulberryRandom(42)
        };
        movementSystem.update(state, context);
      }
      return state.player.position;
    };

    const pos30 = runSim(30);
    const pos60 = runSim(60);
    const pos120 = runSim(120);

    // Assert within a tight 2% tolerance due to exponential easing difference
    const diff30to60 = Math.abs(pos30.x - pos60.x) / pos60.x;
    const diff120to60 = Math.abs(pos120.x - pos60.x) / pos60.x;

    expect(diff30to60).toBeLessThan(0.02);
    expect(diff120to60).toBeLessThan(0.02);
  });
});

describe("Deterministic Simulation Replay", () => {
  it("should produce identical output coordinates for identical replay inputs", () => {
    // Generate a pseudo-random sequence of moves
    const rng = new MulberryRandom(777);
    const inputFrames: InputSnapshot[] = Array.from({ length: 100 }, () => {
      const angle = rng.range(0, Math.PI * 2);
      const mag = rng.range(0.2, 1.0);
      return {
        move: Vec2.create(Math.cos(angle), Math.sin(angle)),
        moveMagnitude: mag,
        pausePressed: false,
        settlePressed: false,
        inputMethod: "keyboard"
      };
    });

    const runSim = (inputs: InputSnapshot[]): GameState => {
      const state = createTestState();
      const movementSystem = new MovementSystem();
      const cameraSystem = new CameraSystem();
      const dt = 1 / 60;

      for (const input of inputs) {
        const context: UpdateContext = {
          dt,
          input,
          config: mockConfig,
          gameplayRandom: new MulberryRandom(42)
        };
        movementSystem.update(state, context);
        cameraSystem.update(state, context);
      }
      return state;
    };

    const state1 = runSim(inputFrames);
    const state2 = runSim(inputFrames);

    expect(state1.player.position.x).toBe(state2.player.position.x);
    expect(state1.player.position.y).toBe(state2.player.position.y);
    expect(state1.camera.position.x).toBe(state2.camera.position.x);
    expect(state1.camera.position.y).toBe(state2.camera.position.y);
  });
});

describe("Camera Spring Convergence", () => {
  it("should pull the camera position towards the player position over time", () => {
    const state = createTestState();
    // Position player far away and keep them static
    state.player.position = Vec2.create(200, 100);
    state.player.velocity = Vec2.create(0, 0);

    const cameraSystem = new CameraSystem();
    const context: UpdateContext = {
      dt: 1 / 60,
      input: {
        move: Vec2.create(0, 0),
        moveMagnitude: 0,
        pausePressed: false,
        settlePressed: false,
        inputMethod: "keyboard"
      },
      config: mockConfig,
      gameplayRandom: new MulberryRandom(42)
    };

    // Run for 3 seconds (180 ticks) to let spring settle
    for (let i = 0; i < 180; i++) {
      cameraSystem.update(state, context);
    }

    // Camera should have converged extremely close to target (200, 100)
    expect(state.camera.position.x).toBeCloseTo(200, 1);
    expect(state.camera.position.y).toBeCloseTo(100, 1);
  });
});
