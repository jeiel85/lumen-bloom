import type { GameState, UpdateContext } from "../state/types";
import { Vec2 } from "../math/Vec2";

export class MovementSystem {
  public update(state: GameState, context: UpdateContext): void {
    const { dt, input, config } = context;
    const player = state.player;

    const maxSpeed = config.movement?.maxScreenSpeed || 260;
    const accelTime = config.movement?.accelerationResponseSeconds || 0.35;
    const coastTime = config.movement?.coastToTenPercentSeconds || 0.8;

    // 1. Resolve target velocity
    const targetVel = Vec2.scale(input.move, input.moveMagnitude * maxSpeed);

    // 2. Interpolate velocity based on input state (acceleration or coasting)
    if (input.moveMagnitude > 0) {
      // Accelerating: Use exponential decay towards target velocity
      // time constant tau = accelTime
      const f = 1 - Math.exp(-dt / accelTime);
      player.velocity = Vec2.add(player.velocity, Vec2.scale(Vec2.subtract(targetVel, player.velocity), f));
    } else {
      // Coasting to stop: velocity decays to 10% in coastTime
      // exp(-coastTime / tau) = 0.1 => tau = coastTime / ln(10) ~ coastTime / 2.302585
      const tau = coastTime / Math.log(10);
      const f = Math.exp(-dt / tau);
      player.velocity = Vec2.scale(player.velocity, f);
    }

    // Save previous position for interpolation
    player.previousPosition = Vec2.clone(player.position);

    // 3. Apply velocity to position
    player.position = Vec2.add(player.position, Vec2.scale(player.velocity, dt));
  }
}
