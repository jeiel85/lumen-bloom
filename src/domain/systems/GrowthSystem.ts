import type { GameState, UpdateContext } from "../state/types";

export class GrowthSystem {
  public update(state: GameState, context: UpdateContext): void {
    const { dt, config } = context;
    const player = state.player;

    const response = config.absorption?.growthResponse || 6.0;
    const massDiff = player.targetMass - player.currentMass;

    if (Math.abs(massDiff) > 0.001) {
      // Exponential smoothing towards target mass
      const factor = 1 - Math.exp(-dt * response);
      player.currentMass += massDiff * factor;
    } else {
      player.currentMass = player.targetMass;
    }
  }
}
