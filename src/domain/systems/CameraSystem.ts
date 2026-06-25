import type { GameState, UpdateContext } from "../state/types";
import { Vec2 } from "../math/Vec2";

export class CameraSystem {
  public update(state: GameState, context: UpdateContext): void {
    const { dt, config } = context;
    const camera = state.camera;
    const player = state.player;

    const stiffness = config.camera?.springStiffness || 42;
    const damping = config.camera?.springDamping || 13;
    const lookAheadFraction = config.movement?.cameraLookAheadFraction || 0.06;

    // Save previous position for rendering interpolation
    camera.previousPosition = Vec2.clone(camera.position);

    // 1. Calculate target position including look-ahead offset
    const lookAheadOffset = Vec2.scale(player.velocity, lookAheadOffsetFactor(lookAheadFraction));
    const targetPos = Vec2.add(player.position, lookAheadOffset);

    // 2. Spring-Mass-Damper model (implicit integration or semi-implicit Euler)
    // F = -k * x - c * v
    const displacement = Vec2.subtract(camera.position, targetPos);
    const springForce = Vec2.scale(displacement, -stiffness);
    const dampingForce = Vec2.scale(camera.velocity, -damping);
    
    const acceleration = Vec2.add(springForce, dampingForce);

    // Update velocity and position
    camera.velocity = Vec2.add(camera.velocity, Vec2.scale(acceleration, dt));
    camera.position = Vec2.add(camera.position, Vec2.scale(camera.velocity, dt));

    // Handle zoom springs similarly if targetZoom changes
    const zoomStiffness = stiffness * 0.5;
    const zoomDamping = damping * 0.8;
    const zoomDiff = camera.zoom - camera.targetZoom;
    const zoomAccel = -zoomStiffness * zoomDiff - zoomDamping * camera.zoomVelocity;
    
    camera.zoomVelocity += zoomAccel * dt;
    camera.zoom += camera.zoomVelocity * dt;
  }
}

function lookAheadOffsetFactor(fraction: number): number {
  // Safe helper to evaluate look-ahead scaling factor
  return fraction;
}
