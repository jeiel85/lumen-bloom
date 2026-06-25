import { KeyboardInput } from "./KeyboardInput";
import { PointerInput } from "./PointerInput";
import { TouchInput } from "./TouchInput";
import type { InputSnapshot } from "../domain/state/types";
import type { InputDevice } from "./types";

export class InputManager {
  private devices: {
    keyboard: KeyboardInput;
    pointer: PointerInput;
    touch: TouchInput;
  };
  private currentMethod: InputSnapshot["inputMethod"] = "keyboard";

  constructor() {
    this.devices = {
      keyboard: new KeyboardInput(),
      pointer: new PointerInput(),
      touch: new TouchInput()
    };
  }

  public getSnapshot(): InputSnapshot {
    const kSnap = this.devices.keyboard.getSnapshot();
    const pSnap = this.devices.pointer.getSnapshot();
    const tSnap = this.devices.touch.getSnapshot();

    // Input method arbitration logic based on activity
    let finalSnapshot: InputSnapshot = {
      move: { x: 0, y: 0 },
      moveMagnitude: 0,
      pausePressed: false,
      settlePressed: false,
      inputMethod: this.currentMethod
    };

    if (tSnap.moveMagnitude && tSnap.moveMagnitude > 0) {
      this.currentMethod = "touch";
      finalSnapshot = { ...finalSnapshot, ...tSnap } as InputSnapshot;
    } else if (kSnap.moveMagnitude && kSnap.moveMagnitude > 0) {
      this.currentMethod = "keyboard";
      finalSnapshot = { ...finalSnapshot, ...kSnap } as InputSnapshot;
    } else if (pSnap.moveMagnitude && pSnap.moveMagnitude > 0) {
      this.currentMethod = "mouse";
      finalSnapshot = { ...finalSnapshot, ...pSnap } as InputSnapshot;
    } else {
      // No active movement, default to priority hierarchy check for button triggers
      const primarySnap = 
        tSnap.settlePressed ? tSnap :
        kSnap.pausePressed || kSnap.settlePressed ? kSnap :
        pSnap.settlePressed ? pSnap : kSnap;
      
      finalSnapshot = {
        move: { x: 0, y: 0 },
        moveMagnitude: 0,
        pausePressed: !!kSnap.pausePressed,
        settlePressed: !!primarySnap.settlePressed,
        inputMethod: this.currentMethod
      };
    }

    finalSnapshot.inputMethod = this.currentMethod;
    return finalSnapshot;
  }

  public resetOneShots(): void {
    (Object.values(this.devices) as InputDevice[]).forEach(d => d.resetOneShots());
  }

  public destroy(): void {
    (Object.values(this.devices) as InputDevice[]).forEach(d => d.destroy());
  }
}
