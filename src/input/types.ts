import type { InputSnapshot } from "../domain/state/types";

export interface InputDevice {
  getSnapshot(): Partial<InputSnapshot>;
  resetOneShots(): void;
  destroy(): void;
}
