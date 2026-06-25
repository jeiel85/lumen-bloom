import type { InputDevice } from "./types";
import type { InputSnapshot } from "../domain/state/types";

export class KeyboardInput implements InputDevice {
  private keys: Record<string, boolean> = {};
  private pausePressed = false;
  private settlePressed = false;

  constructor() {
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    this.keys[e.key.toLowerCase()] = true;
    if (e.key === "Escape" || e.key.toLowerCase() === "p") {
      this.pausePressed = true;
    }
    if (e.key.toLowerCase() === "s" || e.key === "Enter") {
      this.settlePressed = true;
    }
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    this.keys[e.key.toLowerCase()] = false;
  };

  public getSnapshot(): Partial<InputSnapshot> {
    let x = 0;
    let y = 0;

    if (this.keys["w"] || this.keys["arrowup"]) y -= 1;
    if (this.keys["s"] || this.keys["arrowdown"]) y += 1;
    if (this.keys["a"] || this.keys["arrowleft"]) x -= 1;
    if (this.keys["d"] || this.keys["arrowright"]) x += 1;

    // Normalization
    let magnitude = Math.sqrt(x * x + y * y);
    if (magnitude > 1) {
      x /= magnitude;
      y /= magnitude;
      magnitude = 1;
    }

    return {
      move: { x, y },
      moveMagnitude: magnitude,
      pausePressed: this.pausePressed,
      settlePressed: this.settlePressed,
      inputMethod: "keyboard"
    };
  }

  public resetOneShots(): void {
    this.pausePressed = false;
    this.settlePressed = false;
  }

  public destroy(): void {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
  }
}
