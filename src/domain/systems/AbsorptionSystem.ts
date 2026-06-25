import type { GameState, UpdateContext, BlobState } from "../state/types";
import { Vec2 } from "../math/Vec2";

export class AbsorptionSystem {
  public update(state: GameState, context: UpdateContext): void {
    const { dt, config, gameplayRandom } = context;
    const player = state.player;
    const motes = state.entities.motes;

    // Derive player physical radius: R = sqrt(mass) * scaleFactor
    // We align scaleFactor with rendering to ensure boundary contact logic is accurate
    const playerRadius = Math.sqrt(player.currentMass) * 8;

    const magnetMultiplier = config.absorption?.magnetRadiusMultiplier || 1.85;
    const magnetRadius = playerRadius * magnetMultiplier;

    const commonEfficiency = config.absorption?.commonEfficiency || 0.85;
    const mergeMin = config.absorption?.mergeDurationMin || 0.18;
    const mergeMax = config.absorption?.mergeDurationMax || 0.42;

    for (let i = motes.length - 1; i >= 0; i--) {
      const mote = motes[i];
      if (!mote || mote.state === "consumed") continue;

      const toPlayer = Vec2.subtract(player.position, mote.position);
      const dist = Vec2.magnitude(toPlayer);

      if (mote.state === "idle") {
        // Magnet boundary check
        if (dist <= magnetRadius) {
          mote.state = "magnetized";
        }
      }

      if (mote.state === "magnetized") {
        // Pull mote towards player center
        const pullSpeed = 400; // Pull velocity
        const dir = Vec2.normalize(toPlayer);
        mote.velocity = Vec2.scale(dir, pullSpeed);
        mote.position = Vec2.add(mote.position, Vec2.scale(mote.velocity, dt));

        // Border contact check (Merge boundary)
        const currentDist = Vec2.distance(player.position, mote.position);
        if (currentDist <= playerRadius) {
          mote.state = "merging";
          mote.mergeElapsed = 0;
          mote.mergeDuration = gameplayRandom.range(mergeMin, mergeMax);
          mote.targetAngle = Math.atan2(-toPlayer.y, -toPlayer.x);

          // Emit absorption-started event
          state.events.events.push({
            type: "absorption-started",
            sourceId: mote.id,
            ratio: mote.mass / player.currentMass
          });
        }
      } else if (mote.state === "merging") {
        mote.mergeElapsed += dt;
        
        // Slowly ease mote into player center during merge
        const progress = Math.min(mote.mergeElapsed / mote.mergeDuration, 1.0);
        mote.position = Vec2.lerp(mote.position, player.position, progress);

        if (progress >= 1.0) {
          // Fully consumed
          mote.state = "consumed";

          // Add mass with efficiency multiplier
          const gainedMass = mote.mass * commonEfficiency;
          player.targetMass += gainedMass;

          // Emit absorption-committed event
          state.events.events.push({
            type: "absorption-committed",
            sourceId: mote.id,
            gainedMass,
            angle: mote.targetAngle
          });

          // Trigger impulse on player blob points
          this.triggerBlobImpulse(player.blob, mote.targetAngle);
        }
      }
    }
  }

  private triggerBlobImpulse(blob: BlobState, angle: number): void {
    if (!blob || !Array.isArray(blob.points) || blob.points.length === 0) return;
    
    // Find closest blob point matching the contact angle
    const pointsCount = blob.points.length;
    let closestIndex = 0;
    let minAngleDiff = Infinity;

    for (let i = 0; i < pointsCount; i++) {
      const pointAngle = (i / pointsCount) * Math.PI * 2;
      let diff = Math.abs(pointAngle - angle);
      if (diff > Math.PI) {
        diff = Math.PI * 2 - diff;
      }
      if (diff < minAngleDiff) {
        minAngleDiff = diff;
        closestIndex = i;
      }
    }

    // Apply positive (outward) or negative (inward indentation) impulse on contact points
    // Contact absorption creates indentation splash first, then expansion
    const velocities = blob.velocities as Vec2[];
    if (velocities && velocities[closestIndex]) {
      // Indentation impulse
      velocities[closestIndex] = Vec2.scale(velocities[closestIndex], -1.8);
      // Affect neighbors
      const leftIndex = (closestIndex - 1 + pointsCount) % pointsCount;
      const rightIndex = (closestIndex + 1) % pointsCount;
      if (velocities[leftIndex]) velocities[leftIndex] = Vec2.scale(velocities[leftIndex], -1.2);
      if (velocities[rightIndex]) velocities[rightIndex] = Vec2.scale(velocities[rightIndex], -1.2);
    }
  }
}
