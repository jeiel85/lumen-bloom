export interface DebugMetrics {
  fps: number;
  entities: number;
  droppedSteps: number;
}

export class DebugOverlay {
  private fpsEl: HTMLElement | null;
  private entitiesEl: HTMLElement | null;
  private droppedEl: HTMLElement | null;

  constructor() {
    this.fpsEl = document.getElementById("debug-fps");
    this.entitiesEl = document.getElementById("debug-entities");
    this.droppedEl = document.getElementById("debug-dropped");
  }

  public update(metrics: DebugMetrics): void {
    if (this.fpsEl) {
      this.fpsEl.textContent = String(metrics.fps);
    }
    if (this.entitiesEl) {
      this.entitiesEl.textContent = String(metrics.entities);
    }
    if (this.droppedEl) {
      this.droppedEl.textContent = String(metrics.droppedSteps);
    }
  }
}
