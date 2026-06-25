import type { GameState, UpdateContext } from "../state/types";
import { Vec2 } from "../math/Vec2";

export class BlobSystem {
  private offsets: number[] = [];
  private offsetVelocities: number[] = [];

  public update(state: GameState, context: UpdateContext): void {
    const { dt, config } = context;
    const player = state.player;

    const spring = config.blob?.spring || 58;
    const damping = config.blob?.damping || 10.5;
    const neighborTension = config.blob?.neighborTension || 24;
    const minOffsetPct = config.blob?.minOffset || -0.07;
    const maxOffsetPct = config.blob?.maxOffset || 0.09;

    // Quality tier determines points count
    // Default quality medium -> pointsMedium (20)
    let pointsCount = config.blob?.pointsMedium || 20;
    if (state.camera.zoom < 0.6) {
      pointsCount = config.blob?.pointsLow || 16;
    } else if (state.camera.zoom > 1.4) {
      pointsCount = config.blob?.pointsHigh || 24;
    }

    const baseRadius = Math.sqrt(player.currentMass) * 8;

    // Initialize offsets arrays if they changed size or are empty
    if (this.offsets.length !== pointsCount) {
      this.offsets = new Array(pointsCount).fill(0);
      this.offsetVelocities = new Array(pointsCount).fill(0);
      player.blob.points = new Array(pointsCount).fill(null).map(() => Vec2.create(0, 0));
      player.blob.velocities = new Array(pointsCount).fill(null).map(() => Vec2.create(0, 0));
    }

    // 1. Apply movement deformation impulse (squash on acceleration)
    const velMag = Vec2.magnitude(player.velocity);
    if (velMag > 5) {
      const velDir = Vec2.normalize(player.velocity);
      for (let i = 0; i < pointsCount; i++) {
        const angle = (i / pointsCount) * Math.PI * 2;
        const norm = { x: Math.cos(angle), y: Math.sin(angle) };
        const dot = norm.x * velDir.x + norm.y * velDir.y;
        
        // Squash back, stretch front: add deformation force based on velocity
        const deformForce = -dot * velMag * 0.08;
        this.offsetVelocities[i] += deformForce * dt;
      }
    }

    // 2. Perform spring updates for each perimeter point offset
    const nextOffsets = [...this.offsets];
    for (let i = 0; i < pointsCount; i++) {
      const offset = this.offsets[i]!;
      const v = this.offsetVelocities[i]!;

      // Restoring force pulling back to base circle radius
      const fRestore = -spring * offset;
      // Damping force
      const fDamp = -damping * v;

      // Neighbor tension forces
      const leftIdx = (i - 1 + pointsCount) % pointsCount;
      const rightIdx = (i + 1) % pointsCount;
      const leftDiff = this.offsets[leftIdx]! - offset;
      const rightDiff = this.offsets[rightIdx]! - offset;
      const fNeighbor = neighborTension * (leftDiff + rightDiff);

      // Total acceleration (mass assumed = 1)
      const accel = fRestore + fDamp + fNeighbor;
      this.offsetVelocities[i] = v + accel * dt;
      
      // Update offset
      let nextOffset = offset + this.offsetVelocities[i]! * dt;

      // Clamp offset to configuration bounds
      const minBound = minOffsetPct * baseRadius;
      const maxBound = maxOffsetPct * baseRadius;
      if (nextOffset < minBound) {
        nextOffset = minBound;
        this.offsetVelocities[i] = 0;
      } else if (nextOffset > maxBound) {
        nextOffset = maxBound;
        this.offsetVelocities[i] = 0;
      }
      nextOffsets[i] = nextOffset;
    }
    this.offsets = nextOffsets;

    // 3. Compute final world Vec2 coordinates for rendering
    for (let i = 0; i < pointsCount; i++) {
      const angle = (i / pointsCount) * Math.PI * 2;
      const radius = baseRadius + this.offsets[i]!;
      
      player.blob.points[i] = {
        x: player.position.x + radius * Math.cos(angle),
        y: player.position.y + radius * Math.sin(angle)
      };

      // Export velocities vector to state for outer particle sparks
      player.blob.velocities[i] = {
        x: this.offsetVelocities[i]! * Math.cos(angle),
        y: this.offsetVelocities[i]! * Math.sin(angle)
      };
    }
  }

  // Hook to inject direct offset velocity impulses (used in unit tests)
  public applyImpulse(index: number, velocity: number): void {
    if (index >= 0 && index < this.offsetVelocities.length) {
      this.offsetVelocities[index] += velocity;
    }
  }

  public getOffsets(): readonly number[] {
    return this.offsets;
  }
}
