import type { GameConfig } from "../config/types";
import { CanvasRenderer } from "../rendering/CanvasRenderer";
import { DebugOverlay } from "../diagnostics/DebugOverlay";
import { InputManager } from "../input/InputManager";
import { MovementSystem } from "../domain/systems/MovementSystem";
import { CameraSystem } from "../domain/systems/CameraSystem";
import { AbsorptionSystem } from "../domain/systems/AbsorptionSystem";
import { GrowthSystem } from "../domain/systems/GrowthSystem";
import { BlobSystem } from "../domain/systems/BlobSystem";
import { MulberryRandom } from "../domain/math/Random";
import { ReplayFixture } from "../diagnostics/ReplayFixture";
import { MotePool } from "../domain/entities/Mote";
import { AudioManager } from "../audio/AudioManager";
import type { GameState, UpdateContext, InputSnapshot } from "../domain/state/types";
import { Vec2 } from "../domain/math/Vec2";

export class GameApp {
  private config: GameConfig;
  private canvas: HTMLCanvasElement;
  private renderer: CanvasRenderer;
  private debugOverlay: DebugOverlay;
  private inputManager: InputManager;
  private audioManager: AudioManager;

  // Domain systems
  private movementSystem: MovementSystem;
  private cameraSystem: CameraSystem;
  private absorptionSystem: AbsorptionSystem;
  private growthSystem: GrowthSystem;
  private blobSystem: BlobSystem;
  
  private rng: MulberryRandom;
  private motePool: MotePool;

  // Main Loop stats
  private previousMs: number = 0;
  private accumulator: number = 0;
  private isRunning: boolean = false;
  private animationFrameId: number | null = null;
  private droppedSteps: number = 0;

  // Transient authoritative game state
  private gameState!: GameState;

  // Replay & diagnostics
  private replayFixture: ReplayFixture;
  private isReplaying = false;

  // UI Settings
  private activeScreen: "menu" | "game" | "settings" = "menu";
  private currentDifficulty: "calm" | "standard" | "abyss" = "standard";

  constructor(config: GameConfig) {
    this.config = config;
    
    const canvasEl = document.getElementById("game-canvas");
    if (!(canvasEl instanceof HTMLCanvasElement)) {
      throw new Error("Canvas element not found");
    }
    this.canvas = canvasEl;
    
    this.renderer = new CanvasRenderer(this.canvas);
    this.debugOverlay = new DebugOverlay();
    this.inputManager = new InputManager();
    this.audioManager = new AudioManager();

    this.movementSystem = new MovementSystem();
    this.cameraSystem = new CameraSystem();
    this.absorptionSystem = new AbsorptionSystem();
    this.growthSystem = new GrowthSystem();
    this.blobSystem = new BlobSystem();

    this.rng = new MulberryRandom(12345); // Seeded RNG
    this.motePool = new MotePool(200);
    this.replayFixture = new ReplayFixture();

    this.resetGameState();
    this.initUI();
    this.setupResize();
    this.setupVisibilityChange();
    this.resize();
  }

  private resetGameState(): void {
    this.motePool.clear();
    this.gameState = {
      tick: 0,
      elapsedSeconds: 0,
      status: "ready",
      player: {
        position: Vec2.create(0, 0),
        previousPosition: Vec2.create(0, 0),
        velocity: Vec2.create(0, 0),
        currentMass: 15, // slightly larger base start
        targetMass: 15,
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
        transition: {
          active: false,
          fromStageIndex: 0,
          toStageIndex: 0,
          elapsed: 0,
          progress: 0
        }
      },
      stage: {
        currentStageIndex: 0,
        currentStageId: this.config.stages[0]?.id || "light-dust",
        stageProgress: 0
      },
      entities: {
        activeCount: 0,
        motes: []
      },
      particles: { activeCount: 0 },
      run: { elapsedSeconds: 0, memoryShardsEarned: 0 },
      events: { events: [] }
    };
  }

  private initUI(): void {
    const btnStart = document.getElementById("btn-start");
    const btnSettings = document.getElementById("btn-settings");
    const btnSettingsBack = document.getElementById("btn-settings-back");
    const btnPause = document.getElementById("btn-hud-pause");
    const selectDifficulty = document.getElementById("select-difficulty") as HTMLSelectElement | null;
    const selectQuality = document.getElementById("select-quality") as HTMLSelectElement | null;

    btnStart?.addEventListener("click", () => {
      this.audioManager.init(); // Activate Web Audio Context on click gesture
      this.startGame();
    });
    btnSettings?.addEventListener("click", () => this.switchScreen("settings"));
    btnSettingsBack?.addEventListener("click", () => this.switchScreen("menu"));
    
    btnPause?.addEventListener("click", () => {
      if (this.isRunning) {
        this.pauseGame();
      } else {
        this.resumeGame();
      }
    });

    selectDifficulty?.addEventListener("change", (e) => {
      const val = (e.target as HTMLSelectElement).value;
      if (val === "calm" || val === "standard" || val === "abyss") {
        this.currentDifficulty = val;
      }
    });

    selectQuality?.addEventListener("change", (e) => {
      const val = (e.target as HTMLSelectElement).value;
      if (val === "low" || val === "medium" || val === "high") {
        this.renderer.setQuality(val);
      }
    });
  }

  private setupResize(): void {
    window.addEventListener("resize", () => this.resize());
  }

  private setupVisibilityChange(): void {
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        if (this.isRunning) {
          this.pauseGame();
        }
      } else {
        this.previousMs = performance.now();
        this.accumulator = 0;
      }
    });
  }

  private resize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    this.renderer.resize(width, height, dpr);
  }

  public getActiveScreen(): "menu" | "game" | "settings" {
    return this.activeScreen;
  }

  public getCurrentDifficulty(): "calm" | "standard" | "abyss" {
    return this.currentDifficulty;
  }

  public getGameState(): GameState {
    return this.gameState;
  }

  private switchScreen(screen: "menu" | "game" | "settings"): void {
    this.activeScreen = screen;

    const mainMenu = document.getElementById("main-menu");
    const settingsMenu = document.getElementById("settings-menu");
    const hudOverlay = document.getElementById("hud-overlay");

    mainMenu?.classList.add("hidden");
    settingsMenu?.classList.add("hidden");
    hudOverlay?.classList.add("hidden");

    if (screen === "menu") {
      mainMenu?.classList.remove("hidden");
    } else if (screen === "settings") {
      settingsMenu?.classList.remove("hidden");
    } else if (screen === "game") {
      hudOverlay?.classList.remove("hidden");
    }
  }

  private startGame(): void {
    this.resetGameState();
    this.switchScreen("game");
    this.droppedSteps = 0;

    // Spawn initial seeded motes
    const testRng = new MulberryRandom(98765);
    const count = 35;
    for (let i = 0; i < count; i++) {
      // Spawn in a radius around center
      const r = testRng.range(80, 700);
      const theta = testRng.range(0, Math.PI * 2);
      const mx = r * Math.cos(theta);
      const my = r * Math.sin(theta);
      const mass = testRng.range(1.2, 4.0);
      
      const mote = this.motePool.spawn(mx, my, mass);
      this.gameState.entities.motes.push(mote);
    }
    this.gameState.entities.activeCount = count;

    this.previousMs = performance.now();
    this.accumulator = 0;
    this.isRunning = true;
    this.gameState.status = "running";
    this.replayFixture.clear();
    this.loop(this.previousMs);
  }

  private pauseGame(): void {
    this.isRunning = false;
    this.gameState.status = "paused";
    const btnPause = document.getElementById("btn-hud-pause");
    if (btnPause) btnPause.textContent = "Resume";
  }

  private resumeGame(): void {
    this.previousMs = performance.now();
    this.accumulator = 0;
    this.isRunning = true;
    this.gameState.status = "running";
    const btnPause = document.getElementById("btn-hud-pause");
    if (btnPause) btnPause.textContent = "Pause";
    this.loop(this.previousMs);
  }

  private loop = (nowMs: number): void => {
    if (!this.isRunning) {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      return;
    }

    const hz = this.config.simulation?.fixedHz || 60;
    const STEP = 1 / hz;
    const MAX_FRAME_DELTA = this.config.simulation?.maxFrameDeltaSeconds || 0.1;
    const MAX_STEPS_PER_FRAME = this.config.simulation?.maxStepsPerFrame || 5;

    const raw = (nowMs - this.previousMs) / 1000;
    const frameDelta = Math.min(raw, MAX_FRAME_DELTA);
    this.previousMs = nowMs;
    this.accumulator += frameDelta;

    let steps = 0;
    while (this.accumulator >= STEP && steps < MAX_STEPS_PER_FRAME) {
      const inputSnapshot = this.inputManager.getSnapshot();
      
      if (!this.isReplaying) {
        this.replayFixture.record(this.gameState.tick, inputSnapshot);
      }

      const context: UpdateContext = {
        dt: STEP,
        input: inputSnapshot,
        config: this.config,
        gameplayRandom: this.rng
      };

      this.updateSimulation(context);

      this.inputManager.resetOneShots();
      this.accumulator -= STEP;
      steps += 1;
    }

    if (steps === MAX_STEPS_PER_FRAME && this.accumulator >= STEP) {
      this.droppedSteps += Math.floor(this.accumulator / STEP);
      this.accumulator = 0;
    }

    const alpha = this.accumulator / STEP;
    this.render(alpha);

    // Update diagnostic stats panel
    const activeMotes = this.gameState.entities.motes.filter(m => m.state !== "consumed").length;
    const fps = Math.round(1 / (frameDelta || 0.016));
    this.debugOverlay.update({
      fps,
      entities: activeMotes + 1, // motes + player
      droppedSteps: this.droppedSteps
    });

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private updateSimulation(context: UpdateContext): void {
    this.gameState.tick++;
    this.gameState.elapsedSeconds += context.dt;

    // Run movement and camera spring systems
    this.movementSystem.update(this.gameState, context);
    this.cameraSystem.update(this.gameState, context);

    // Run new Growth & Blob perimeter springs
    this.absorptionSystem.update(this.gameState, context);
    this.growthSystem.update(this.gameState, context);
    this.blobSystem.update(this.gameState, context);

    // Process collected domain events for Audio playback
    if (this.gameState.events.events.length > 0) {
      for (const event of this.gameState.events.events) {
        this.audioManager.handleEvent(event);
      }
      this.gameState.events.events = [];
    }

    // Sync HTML HUD text labels
    const hudMass = document.getElementById("hud-mass-value");
    if (hudMass) {
      hudMass.textContent = this.gameState.player.currentMass.toFixed(1);
    }
    const hudStage = document.getElementById("hud-stage-name");
    if (hudStage) {
      const activeStage = this.config.stages[this.gameState.stage.currentStageIndex];
      hudStage.textContent = activeStage ? activeStage.nameKo : "-";
    }
  }

  private render(alpha: number): void {
    // Interlaced render states (interpolating player/camera between physics ticks)
    const playerPos = Vec2.lerp(this.gameState.player.previousPosition, this.gameState.player.position, alpha);
    const cameraPos = Vec2.lerp(this.gameState.camera.previousPosition, this.gameState.camera.position, alpha);

    // Interpolate blob perimeter points
    const interpBlobPoints: Vec2[] = [];
    const pointsCount = this.gameState.player.blob.points.length;
    if (pointsCount > 0) {
      // Since previous positions aren't directly held in array to avoid massive garbage collection,
      // we project dynamic points relative to interpolated playerPos using current offsets
      // (This matches base simulation physics and interpolates center position smoothly)
      for (let i = 0; i < pointsCount; i++) {
        const pt = this.gameState.player.blob.points[i]!;
        const dx = pt.x - this.gameState.player.position.x;
        const dy = pt.y - this.gameState.player.position.y;
        interpBlobPoints.push({
          x: playerPos.x + dx,
          y: playerPos.y + dy
        });
      }
    }

    const activeStage = this.config.stages[this.gameState.stage.currentStageIndex];

    this.renderer.render({
      alpha,
      stageNameKo: activeStage?.nameKo || "빛가루",
      stageNameEn: activeStage?.nameEn || "Light Dust",
      player: {
        position: playerPos,
        mass: this.gameState.player.currentMass,
        blobPoints: interpBlobPoints
      },
      camera: {
        position: cameraPos,
        zoom: this.gameState.camera.zoom
      },
      motes: this.gameState.entities.motes
    });
  }

  // Headless simulation for deterministic test suites
  public runSimulationSteps(inputs: readonly { tick: number; input: InputSnapshot }[]): void {
    this.isReplaying = true;
    this.resetGameState();
    
    const hz = this.config.simulation?.fixedHz || 60;
    const STEP = 1 / hz;

    for (const frame of inputs) {
      const context: UpdateContext = {
        dt: STEP,
        input: frame.input,
        config: this.config,
        gameplayRandom: this.rng
      };
      this.updateSimulation(context);
    }
    this.isReplaying = false;
  }

  public getReplayFixture(): ReplayFixture {
    return this.replayFixture;
  }

  public destroy(): void {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.inputManager.destroy();
  }
}
