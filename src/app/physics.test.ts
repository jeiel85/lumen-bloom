import { describe, it, expect, vi } from "vitest";
import { MovementSystem } from "../domain/systems/MovementSystem";
import { CameraSystem } from "../domain/systems/CameraSystem";
import { AbsorptionSystem } from "../domain/systems/AbsorptionSystem";
import { GrowthSystem } from "../domain/systems/GrowthSystem";
import { BlobSystem } from "../domain/systems/BlobSystem";
import { MulberryRandom } from "../domain/math/Random";
import { MotePool } from "../domain/entities/Mote";
import { AudioManager } from "../audio/AudioManager";
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
    cameraLookAheadFraction: 0.06,
  },
  relationship: {
    edibleEnterRatio: 0.9,
    edibleExitRatio: 0.95,
    threatEnterRatio: 1.1,
    threatExitRatio: 1.05,
  },
  absorption: {
    magnetRadiusMultiplier: 1.85,
    commonEfficiency: 0.85,
    creatureEfficiency: 0.7,
    fragmentEfficiency: 0.5,
    growthResponse: 6.0,
    mergeDurationMin: 0.18,
    mergeDurationMax: 0.42,
  },
  damage: {
    massFraction: 0.2,
    invulnerabilitySeconds: 1.0,
    recoverableMassMinFraction: 0.2,
    recoverableMassMaxFraction: 0.4,
  },
  camera: {
    targetScreenFraction: 0.05,
    triggerScreenFraction: 0.08,
    deathScreenFraction: 0.02,
    springStiffness: 40,
    springDamping: 12,
    transitionMaxSeconds: 1.0,
    retriggerCooldownSeconds: 0.2,
  },
  blob: {
    pointsLow: 16,
    pointsMedium: 20,
    pointsHigh: 24,
    spring: 58,
    damping: 10.5,
    neighborTension: 24,
    minOffset: -0.07,
    maxOffset: 0.09,
  },
  world: {
    prewarmRadiusMultiplier: 1.2,
    cullRadiusMultiplier: 1.5,
    spawnInnerMultiplier: 0.8,
    spawnOuterMultiplier: 1.2,
    originRebaseThreshold: 10000,
    maxParticlesLow: 200,
    maxParticlesHigh: 500,
  },
  progression: {
    voluntaryEfficiency: 1.0,
    deathEfficiency: 0.5,
    difficultyMultiplier: { calm: 0.8, standard: 1.0, abyss: 1.5 },
  },
  stages: [
    {
      id: "light-dust",
      index: 0,
      nameKo: "빛가루",
      nameEn: "Light Dust",
      background: "void-dust",
      audioStem: ["base"],
      threatBudget: 0.2,
    },
  ],
  enemies: [],
  traits: [],
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
      currentMass: 15,
      targetMass: 15,
      invulnerabilitySeconds: 0,
      blob: { points: [], velocities: [] },
      equippedTraitId: null,
    },
    camera: {
      position: Vec2.create(0, 0),
      previousPosition: Vec2.create(0, 0),
      velocity: Vec2.create(0, 0),
      zoom: 1.0,
      zoomVelocity: 0.0,
      targetZoom: 1.0,
      transition: { active: false, fromStageIndex: 0, toStageIndex: 0, elapsed: 0, progress: 0 },
    },
    stage: { currentStageIndex: 0, currentStageId: "light-dust", stageProgress: 0 },
    entities: { activeCount: 0, motes: [] },
    particles: { activeCount: 0 },
    run: { elapsedSeconds: 0, memoryShardsEarned: 0 },
    events: { events: [] },
  };
}

describe("Movement Framerate Independence", () => {
  it("should cover similar distances over 1 second across 30Hz, 60Hz, and 120Hz ticks", () => {
    const input: InputSnapshot = {
      move: Vec2.create(1, 0),
      moveMagnitude: 1.0,
      pausePressed: false,
      settlePressed: false,
      inputMethod: "keyboard",
    };

    const runSim = (hz: number): Vec2 => {
      const state = createTestState();
      const movementSystem = new MovementSystem();
      const dt = 1 / hz;
      const totalSteps = hz;

      for (let i = 0; i < totalSteps; i++) {
        const context: UpdateContext = {
          dt,
          input,
          config: mockConfig,
          gameplayRandom: new MulberryRandom(42),
        };
        movementSystem.update(state, context);
      }
      return state.player.position;
    };

    const pos30 = runSim(30);
    const pos60 = runSim(60);
    const pos120 = runSim(120);

    const diff30to60 = Math.abs(pos30.x - pos60.x) / pos60.x;
    const diff120to60 = Math.abs(pos120.x - pos60.x) / pos60.x;

    expect(diff30to60).toBeLessThan(0.02);
    expect(diff120to60).toBeLessThan(0.02);
  });
});

describe("Deterministic Simulation Replay", () => {
  it("should produce identical output coordinates for identical replay inputs", () => {
    const rng = new MulberryRandom(777);
    const inputFrames: InputSnapshot[] = Array.from({ length: 100 }, () => {
      const angle = rng.range(0, Math.PI * 2);
      const mag = rng.range(0.2, 1.0);
      return {
        move: Vec2.create(Math.cos(angle), Math.sin(angle)),
        moveMagnitude: mag,
        pausePressed: false,
        settlePressed: false,
        inputMethod: "keyboard",
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
          gameplayRandom: new MulberryRandom(42),
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
        inputMethod: "keyboard",
      },
      config: mockConfig,
      gameplayRandom: new MulberryRandom(42),
    };

    for (let i = 0; i < 180; i++) {
      cameraSystem.update(state, context);
    }

    expect(state.camera.position.x).toBeCloseTo(200, 1);
    expect(state.camera.position.y).toBeCloseTo(100, 1);
  });
});

describe("Absorption & Mass Conservation", () => {
  it("should conserve mass after consuming motes with efficiency multiplier", () => {
    const state = createTestState();
    const pool = new MotePool(10);

    // Spawn 3 motes inside player reach
    const mote1 = pool.spawn(2, 2, 2.0);
    const mote2 = pool.spawn(-3, 1, 1.5);
    const mote3 = pool.spawn(1, -2, 3.0);

    state.entities.motes.push(mote1, mote2, mote3);

    const absorptionSystem = new AbsorptionSystem();
    const growthSystem = new GrowthSystem();

    const context: UpdateContext = {
      dt: 1 / 60,
      input: {
        move: Vec2.create(0, 0),
        moveMagnitude: 0,
        pausePressed: false,
        settlePressed: false,
        inputMethod: "keyboard",
      },
      config: mockConfig,
      gameplayRandom: new MulberryRandom(123),
    };

    // Run for 3 seconds to let magnetism, merge, and growth settle
    for (let i = 0; i < 180; i++) {
      absorptionSystem.update(state, context);
      growthSystem.update(state, context);
    }

    // All motes must be consumed
    expect(state.entities.motes.every((m) => m.state === "consumed")).toBe(true);

    // Expected Mass: initial (15) + sum(moteMass * commonEfficiency)
    // 15 + (2.0 + 1.5 + 3.0) * 0.85 = 15 + 6.5 * 0.85 = 15 + 5.525 = 20.525
    expect(state.player.currentMass).toBeCloseTo(20.525, 2);
  });
});

describe("Blob Rest State Convergence", () => {
  it("should return the deformed perimeter points back to round rest circles over time", () => {
    const state = createTestState();
    const blobSystem = new BlobSystem();

    const context: UpdateContext = {
      dt: 1 / 60,
      input: {
        move: Vec2.create(0, 0),
        moveMagnitude: 0,
        pausePressed: false,
        settlePressed: false,
        inputMethod: "keyboard",
      },
      config: mockConfig,
      gameplayRandom: new MulberryRandom(42),
    };

    // Run once to initialize points
    blobSystem.update(state, context);

    // Inject a severe impulse on point 5
    blobSystem.applyImpulse(5, 50.0);

    // Verify offset is non-zero
    blobSystem.update(state, context);
    const offsetsActive = blobSystem.getOffsets();
    expect(Math.abs(offsetsActive[5]!)).toBeGreaterThan(0.1);

    // Run for 3.5 seconds to damp the spring oscillations
    for (let i = 0; i < 210; i++) {
      blobSystem.update(state, context);
    }

    // Perimeter offsets must converge back near zero
    const offsetsSettled = blobSystem.getOffsets();
    for (const offset of offsetsSettled) {
      expect(Math.abs(offset)).toBeLessThan(0.01);
    }
  });
});

describe("Audio Manager Rate Limiting", () => {
  it("should prevent noise overlap by enforcing minimum playback time intervals", () => {
    const audio = new AudioManager();

    // Mock audio context to pass guards
    (audio as unknown as { ctx: AudioContext }).ctx = {
      state: "running",
      currentTime: 0,
      createOscillator: () => ({
        type: "",
        frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
        connect: () => {},
        start: () => {},
        stop: () => {},
      }),
      createGain: () => ({
        gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
        connect: () => {},
      }),
      destination: {},
    } as unknown as AudioContext;

    // Fake performance.now() to control test time increments
    const timeSpy = vi.spyOn(performance, "now");

    timeSpy.mockReturnValue(1000);
    expect(audio.canPlaySound()).toBe(true);
    audio.handleEvent({ type: "absorption-started", sourceId: 1, ratio: 0.1 });

    // Instantly try another play (10ms later) -> must be rate limited
    timeSpy.mockReturnValue(1010);
    expect(audio.canPlaySound()).toBe(false);

    // Try 80ms later -> exceeds minIntervalMs (60ms) -> allowed
    timeSpy.mockReturnValue(1080);
    expect(audio.canPlaySound()).toBe(true);

    timeSpy.mockRestore();
  });
});
