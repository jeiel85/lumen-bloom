# Camera Scaling and Blob Deformation

## 1. Design intent

The player should visibly grow between expansion events. When the on-screen body becomes too large, the camera pulls back and restores breathing room. The world then appears richer and larger rather than making the player simply look small again.

## 2. Camera model

```text
screenPosition = viewportCenter + (worldPosition - cameraPosition) × zoom
screenRadius = worldRadius × zoom
```

Camera position follows the player through a critically damped spring with a small velocity look-ahead.

### Camera position target

```text
target = playerPosition + normalize(playerVelocity) × lookAheadWorldDistance
```

Look-ahead is capped to 6% of the shorter viewport dimension in screen space.

## 3. Expansion thresholds

Initial values, deliberately data-driven:

- post-expansion target fraction: `0.055`;
- expansion trigger fraction: `0.078`;
- death visibility fraction: `0.016`.

Fractions are relative to the shorter viewport dimension.

### Trigger

```text
if not transitioning and playerRadius × zoom ≥ shortSide × triggerFraction:
    nextZoom = shortSide × targetFraction / playerRadius
    start expansion transition
```

## 4. Zoom spring

Use a critically damped or slightly underdamped spring rather than linear interpolation:

```text
acceleration = stiffness × (targetZoom - zoom) - damping × zoomVelocity
zoomVelocity += acceleration × dt
zoom += zoomVelocity × dt
```

Initial tuning:

- stiffness: 42;
- damping: 13;
- maximum transition: 1.1 s;
- completion tolerance: 0.5% target zoom.

Clamp zoom positive and prevent a second expansion until completion plus 150 ms cooldown.

## 5. Expansion choreography

`CameraScaleSystem` emits phase progress `[0, 1]`. Other presentation systems derive:

- palette blend;
- background layer blend;
- audio duck and stem fade;
- HUD scale label;
- effect intensity.

Simulation spawn rules switch at 50% progress, but old objects remain until naturally culled. This avoids popping the entire world.

## 6. Reduced motion

When reduced motion is enabled:

- camera snaps to target after a 100–150 ms fade;
- no radial screen flash;
- no large FOV-like sweep;
- blob impulse amplitude is reduced by 50%;
- gameplay timing and stage switch remain identical.

## 7. Blob topology

Player body is represented by a radial ring of points.

Each point stores:

```ts
interface BlobPoint {
  offset: number;   // normalized radial displacement
  velocity: number; // normalized displacement per second
}
```

Quality-dependent point count:

- low: 16;
- medium: 20;
- high: 24.

## 8. Blob dynamics

For point `i`:

```text
springForce = -springK × offset[i]
dampingForce = -damping × velocity[i]
neighborForce = tension × (average(offset[i-1], offset[i+1]) - offset[i])

velocity[i] += (springForce + dampingForce + neighborForce) × dt
offset[i] += velocity[i] × dt
```

Initial tuning:

- spring K: 58;
- damping: 10.5;
- neighbor tension: 24;
- offset clamp: `[-0.07, +0.09]`.

## 9. Movement impulse

Acceleration deforms the body in the opposite direction of travel. Normalize by player radius and zoom-independent movement to keep deformation consistent across stages.

## 10. Absorption impulse

At merge commit:

- find angular difference between each blob point and impact angle;
- apply a smooth cosine lobe to nearby points;
- apply a smaller counter-wave to the opposite side;
- add a short halo pulse.

The visual impulse does not change gameplay radius.

## 11. Damage impulse

Damage uses:

- stronger inward displacement near impact;
- broad outward rebound;
- desaturated body fill;
- ejected fragments;
- optional 2–4 px camera shake, disabled in reduced-motion mode.

## 12. Rendering path

Compute radial points, then create a closed smooth path using midpoint quadratic curves or Catmull-Rom conversion. The player fill uses:

1. soft outer halo;
2. body gradient;
3. inner highlight offset from movement;
4. trait-specific detail;
5. optional trail.

Avoid expensive full-screen blur. Shadow blur radius is capped by quality tier.

## 13. Acceptance tests

- Growth changes world radius before any camera expansion.
- Screen radius reaches trigger range, then returns within ±3% of target fraction.
- Camera transition remains stable at 30, 60, 90, and 120 Hz render rates.
- Browser tab resume does not produce a zoom jump.
- Reduced-motion mode completes the same stage transition without sweeping motion.
- Blob offsets return within 5% of rest after 2 seconds with no new impulse.
