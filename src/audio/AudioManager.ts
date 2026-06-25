import type { DomainEvent } from "../domain/state/types";

export class AudioManager {
  private ctx: AudioContext | null = null;
  private lastPlayTime = 0;
  private minIntervalMs = 60; // Rate limit threshold to prevent noise overlaps

  constructor() {
    // Audio Context is lazily initialized on first user interaction gesture.
  }

  // Safe activation from click handler
  public init(): void {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      console.log("[AudioManager] Web Audio Context initialized.");
    } catch (e) {
      console.warn("[AudioManager] Failed to initialize Web Audio", e);
    }
  }

  // Rate-limiting check helper
  public canPlaySound(): boolean {
    const now = performance.now();
    if (now - this.lastPlayTime < this.minIntervalMs) {
      return false;
    }
    return true;
  }

  public handleEvent(event: DomainEvent): void {
    if (!this.ctx || this.ctx.state === "suspended") {
      return;
    }

    if (!this.canPlaySound()) {
      return;
    }

    this.lastPlayTime = performance.now();

    if (event.type === "absorption-started") {
      this.playSineSweep(220, 440, 0.06);
    } else if (event.type === "absorption-committed") {
      // Soft chime: pitch is proportional to gained mass
      const baseFreq = 523.25; // C5
      const pitchOffset = Math.min(event.gainedMass * 15, 300);
      this.playSineSweep(baseFreq + pitchOffset, (baseFreq + pitchOffset) * 1.5, 0.12);
    }
  }

  private playSineSweep(startFreq: number, endFreq: number, duration: number): void {
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(startFreq, now);
      // Exponential sweep
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

      // Volume envelope (smooth fade-out)
      gainNode.gain.setValueAtTime(0.06, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Audio nodes creation might throw if context state changed unexpectedly
    }
  }
}
