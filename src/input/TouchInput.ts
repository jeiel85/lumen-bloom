import type { InputDevice } from "./types";
import type { InputSnapshot } from "../domain/state/types";

export class TouchInput implements InputDevice {
  private startX = 0;
  private startY = 0;
  private currentX = 0;
  private currentY = 0;
  private active = false;
  private settlePressed = false;
  private lastTapTime = 0;

  constructor() {
    window.addEventListener("touchstart", this.handleTouchStart, { passive: false });
    window.addEventListener("touchmove", this.handleTouchMove, { passive: false });
    window.addEventListener("touchend", this.handleTouchEnd);
  }

  private handleTouchStart = (e: TouchEvent): void => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      if (!touch) return;
      this.startX = touch.clientX;
      this.startY = touch.clientY;
      this.currentX = touch.clientX;
      this.currentY = touch.clientY;
      this.active = true;

      // Handle double tap for pause/settle trigger
      const now = performance.now();
      if (now - this.lastTapTime < 300) {
        this.settlePressed = true;
      }
      this.lastTapTime = now;
    }
  };

  private handleTouchMove = (e: TouchEvent): void => {
    if (this.active && e.touches.length > 0) {
      // Prevent scrolling while playing
      e.preventDefault();
      const touch = e.touches[0];
      if (!touch) return;
      this.currentX = touch.clientX;
      this.currentY = touch.clientY;
    }
  };

  private handleTouchEnd = (): void => {
    this.active = false;
  };

  public getSnapshot(): Partial<InputSnapshot> {
    if (!this.active) {
      return {
        move: { x: 0, y: 0 },
        moveMagnitude: 0,
        inputMethod: "touch"
      };
    }

    const dx = this.currentX - this.startX;
    const dy = this.currentY - this.startY;

    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = 80; // Pixels for full joystick deflection

    let x = 0;
    let y = 0;
    let magnitude = 0;

    if (dist > 5) { // Threshold
      x = dx / dist;
      y = dy / dist;
      magnitude = Math.min(dist, maxRadius) / maxRadius;
    }

    return {
      move: { x, y },
      moveMagnitude: magnitude,
      settlePressed: this.settlePressed,
      inputMethod: "touch"
    };
  }

  public resetOneShots(): void {
    this.settlePressed = false;
  }

  public destroy(): void {
    window.removeEventListener("touchstart", this.handleTouchStart);
    window.removeEventListener("touchmove", this.handleTouchMove);
    window.removeEventListener("touchend", this.handleTouchEnd);
  }
}
