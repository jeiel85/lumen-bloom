import type { InputDevice } from "./types";
import type { InputSnapshot } from "../domain/state/types";

export class PointerInput implements InputDevice {
  private mouseX: number = 0;
  private mouseY: number = 0;
  private active: boolean = false;
  private settlePressed = false;

  constructor() {
    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("mousedown", this.handleMouseDown);
    // Suppress cursor checks when pointer leaves window
    window.addEventListener("mouseout", this.handleMouseOut);
  }

  private handleMouseMove = (e: MouseEvent): void => {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
    this.active = true;
  };

  private handleMouseDown = (e: MouseEvent): void => {
    if (e.button === 0) { // Left click
      this.settlePressed = true;
    }
  };

  private handleMouseOut = (): void => {
    this.active = false;
  };

  public getSnapshot(): Partial<InputSnapshot> {
    if (!this.active) {
      return {
        move: { x: 0, y: 0 },
        moveMagnitude: 0,
        inputMethod: "mouse"
      };
    }

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const dx = this.mouseX - centerX;
    const dy = this.mouseY - centerY;

    const dist = Math.sqrt(dx * dx + dy * dy);
    // Define a deadzone (e.g., 20 pixels) and a max boundary (e.g., 200 pixels)
    const deadzone = 25;
    const maxBound = 180;

    let x = 0;
    let y = 0;
    let magnitude = 0;

    if (dist > deadzone) {
      const activeDist = Math.min(dist, maxBound) - deadzone;
      magnitude = activeDist / (maxBound - deadzone);
      x = dx / dist;
      y = dy / dist;
    }

    return {
      move: { x, y },
      moveMagnitude: magnitude,
      settlePressed: this.settlePressed,
      inputMethod: "mouse"
    };
  }

  public resetOneShots(): void {
    this.settlePressed = false;
  }

  public destroy(): void {
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("mousedown", this.handleMouseDown);
    window.removeEventListener("mouseout", this.handleMouseOut);
  }
}
