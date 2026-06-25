import type { GameConfig } from "../config/types";
import { CanvasRenderer } from "../rendering/CanvasRenderer";
import { DebugOverlay } from "../diagnostics/DebugOverlay";

export class GameApp {
  private config: GameConfig;
  private canvas: HTMLCanvasElement;
  private renderer: CanvasRenderer;
  private debugOverlay: DebugOverlay;

  // Main Loop stats
  private previousMs: number = 0;
  private accumulator: number = 0;
  private isRunning: boolean = false;
  private animationFrameId: number | null = null;
  
  // Game states (Goal 01 simple state)
  private tickCount: number = 0;
  private entityCount: number = 0;
  private droppedSteps: number = 0;

  // UI state
  private activeScreen: "menu" | "game" | "settings" = "menu";
  private currentDifficulty: "calm" | "standard" | "abyss" = "standard";

  public getActiveScreen(): "menu" | "game" | "settings" {
    return this.activeScreen;
  }

  public getCurrentDifficulty(): "calm" | "standard" | "abyss" {
    return this.currentDifficulty;
  }

  constructor(config: GameConfig) {
    this.config = config;
    
    const canvasEl = document.getElementById("game-canvas");
    if (!(canvasEl instanceof HTMLCanvasElement)) {
      throw new Error("Canvas element not found");
    }
    this.canvas = canvasEl;
    
    this.renderer = new CanvasRenderer(this.canvas);
    this.debugOverlay = new DebugOverlay();

    this.initUI();
    this.setupResize();
    this.resize();
  }

  private initUI(): void {
    // Menu navigation
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

  private resize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    this.renderer.resize(width, height, dpr);
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
    this.switchScreen("game");
    this.tickCount = 0;
    this.droppedSteps = 0;
    this.entityCount = 0;
    this.previousMs = performance.now();
    this.accumulator = 0;
    this.isRunning = true;
    this.loop(this.previousMs);
  }

  private pauseGame(): void {
    this.isRunning = false;
    const btnPause = document.getElementById("btn-hud-pause");
    if (btnPause) btnPause.textContent = "Resume";
  }

  private resumeGame(): void {
    this.previousMs = performance.now();
    this.isRunning = true;
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
      this.updateSimulation(STEP);
      this.accumulator -= STEP;
      steps += 1;
    }

    if (steps === MAX_STEPS_PER_FRAME && this.accumulator >= STEP) {
      this.droppedSteps += Math.floor(this.accumulator / STEP);
      this.accumulator = 0;
    }

    const alpha = this.accumulator / STEP;
    this.render(alpha);

    // Update debug panel metrics
    const fps = Math.round(1 / (frameDelta || 0.016));
    this.debugOverlay.update({
      fps,
      entities: this.entityCount,
      droppedSteps: this.droppedSteps
    });

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private updateSimulation(_dt: number): void {
    this.tickCount++;
    // In Goal 01, simulation does not update active entities yet.
    // However, we increment simulation step.
    const hudMass = document.getElementById("hud-mass-value");
    if (hudMass) {
      hudMass.textContent = "1.0";
    }
    const hudStage = document.getElementById("hud-stage-name");
    if (hudStage) {
      const firstStageName = this.config.stages[0]?.nameKo || "빛가루";
      hudStage.textContent = firstStageName;
    }
  }

  private render(alpha: number): void {
    // Passes interpolation factor alpha to rendering subsystem
    const activeStage = this.config.stages[0];
    this.renderer.render({
      alpha,
      stageNameKo: activeStage?.nameKo || "빛가루",
      stageNameEn: activeStage?.nameEn || "Light Dust"
    });
  }

  public destroy(): void {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    // Clean event listeners if hot reload
  }
}
