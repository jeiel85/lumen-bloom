import type { InputSnapshot } from "../domain/state/types";

export interface ReplayFrame {
  tick: number;
  input: InputSnapshot;
}

export class ReplayFixture {
  private frames: ReplayFrame[] = [];

  // Record an input snapshot on a specific tick
  public record(tick: number, input: InputSnapshot): void {
    // Clone snapshot to prevent reference mutation
    this.frames.push({
      tick,
      input: JSON.parse(JSON.stringify(input)) as InputSnapshot
    });
  }

  // Get all recorded frames
  public getFrames(): readonly ReplayFrame[] {
    return this.frames;
  }

  // Load a pre-recorded sequence
  public load(frames: ReplayFrame[]): void {
    this.frames = [...frames];
  }

  public clear(): void {
    this.frames = [];
  }
}
