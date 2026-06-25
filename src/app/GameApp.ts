import type { GameConfig } from "../config/types";
import { CanvasRenderer } from "../rendering/CanvasRenderer";
import { DebugOverlay } from "../diagnostics/DebugOverlay";
import { InputManager } from "../input/InputManager";
import { MovementSystem } from "../domain/systems/MovementSystem";
import { CameraSystem } from "../domain/systems/CameraSystem";
import { MulberryRandom } from "../domain/math/Random";
import { ReplayFixture } from "../diagnostics/ReplayFixture";
import type { GameState, UpdateContext, InputSnapshot } from "../domain/state/types";
import { Vec2 } from "../domain/math/Vec2";

export class GameApp {
  private config: GameConfig;
  private canvas: HTMLCanvasElement;
  private renderer: CanvasRenderer;
  private debugOverlay: DebugOverlay;
  private inputManager: InputManager;

  // Domain systems
  private movementSystem: MovementSystem;
  private cameraSystem: CameraSystem;
  private rng: MulberryRandom;

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

    this.movementSystem = new MovementSystem();
    this.cameraSystem = new CameraSystem();
    this.rng = new MulberryRandom(12345); // Seeded RNG
    this.replayFixture = new ReplayFixture();

    this.resetGameState();
    this.initUI();
    this.setupResize();
    this.setupVisibilityChange();
    this.resize();
  }

  private resetGameState(): void {
    this.gameState = {
      tick: 0,
      elapsedSeconds: 0,
      status: "ready",
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
      entities: { activeCount: 0 },
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

    btnStart?.addEventListener("click", () => this.startGame());
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
    // Reset timer accumulator on visibility resume to avoid framerate spiral of death/jump
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        if (this.isRunning) {
          this.pauseGame();
        }
      } else {
        // Tab resumed
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
      // 1. Query input snapshot
      const inputSnapshot = this.inputManager.getSnapshot();
      
      // Record if playing active game
      if (!this.isReplaying) {
        this.replayFixture.record(this.gameState.tick, inputSnapshot);
      }

      const context: UpdateContext = {
        dt: STEP,
        input: inputSnapshot,
        config: this.config,
        gameplayRandom: this.rng
      };

      // 2. Perform fixed physics simulation step
      this.updateSimulation(context);

      // Reset edge-triggered one-shot buttons
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
    const fps = Math.round(1 / (frameDelta || 0.016));
    this.debugOverlay.update({
      fps,
      entities: this.gameState.entities.activeCount,
      droppedSteps: this.droppedSteps
    });

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private updateSimulation(context: UpdateContext): void {
    this.gameState.tick++;
    this.gameState.elapsedSeconds += context.dt;

    // Run movement and camera spring physics systems
    this.movementSystem.update(this.gameState, context);
    this.cameraSystem.update(this.gameState, context);

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

    const activeStage = this.config.stages[this.gameState.stage.currentStageIndex];

    this.renderer.render({
      alpha,
      stageNameKo: activeStage?.nameKo || "빛가루",
      stageNameEn: activeStage?.nameEn || "Light Dust",
      player: {
        position: playerPos,
        mass: this.gameState.player.currentMass
      },
      camera: {
        position: cameraPos,
        zoom: this.gameState.camera.zoom
      }
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
