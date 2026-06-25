# Core Mechanics Specification

## 1. Coordinate systems

- **World space**: unbounded double-precision coordinates.
- **Camera space**: world position relative to player/camera anchor.
- **Screen space**: CSS pixels after zoom.
- **Physical canvas space**: screen pixels multiplied by capped DPR.

The player remains close to screen center. World entities move relative to camera transform.

## 2. Player movement

### Input vector

`InputManager` produces a normalized intent vector and magnitude in `[0, 1]`.

### Desired acceleration

```text
worldAcceleration = baseScreenAcceleration / cameraZoom
desiredAcceleration = inputDirection × worldAcceleration × inputMagnitude
```

Scaling by inverse zoom keeps perceived screen acceleration approximately stable as world scale changes.

### Velocity integration

Use semi-implicit Euler:

```text
velocity += acceleration × dt
velocity *= exp(-drag × dt)
velocity = clampMagnitude(velocity, maxScreenSpeed / zoom)
position += velocity × dt
```

Initial tuning:

- max screen speed: 260 CSS px/s;
- base acceleration response: reach 90% desired speed in about 350 ms;
- coast decay: velocity falls below 10% in about 800 ms.

## 3. Mass model

Use normalized area:

```text
mass = radius²
radius = sqrt(mass)
```

π is omitted because it cancels during comparisons and aggregation.

When an object is absorbed:

```text
targetMass += absorbedMass × efficiency
targetRadius = sqrt(targetMass)
```

Initial efficiency:

- common mote: `0.85`;
- creature: `0.70`;
- recovered fragment: `0.55`;
- special dense object: data-driven.

## 4. Growth smoothing

Current radius follows target radius using frame-rate-independent exponential smoothing:

```text
alpha = 1 - exp(-growthResponse × dt)
radius += (targetRadius - radius) × alpha
```

Initial `growthResponse = 6.0`. Large absorptions may temporarily lower response to create a heavier swell, but growth must commit fully.

## 5. Absorption eligibility

```text
edible when targetRadius ≤ playerRadius × 0.90
threat when targetRadius ≥ playerRadius × 1.12
contested otherwise
```

Once an object enters a state, use hysteresis:

- edible remains edible until ratio exceeds `0.94`;
- threat remains threat until ratio falls below `1.07`.

## 6. Absorption state machine

```text
Free
 └─ within magnet radius and edible → Attracted
Attracted
 ├─ no longer eligible / too far → Free
 └─ contact envelope reached → Merging
Merging
 └─ tween complete → Consumed
```

### Magnet radius

`playerRadius × 1.85 + targetRadius`

Attraction uses a capped spring rather than direct positional interpolation:

```text
acceleration = directionToPlayer × magnetStrength × falloff
falloff = smoothstep(outerRadius, contactRadius, distance)
```

### Merge duration

`clamp(0.16 + sizeRatio × 0.18, 0.18, 0.42)` seconds.

### Merge trajectory

Use a cubic curve from target position to an offset just inside the player surface. The offset follows player movement during the tween.

## 7. Collision

Broad phase: spatial hash query.
Narrow phase: circle overlap for gameplay.

### Threat collision

Trigger when:

- circles overlap beyond configured penetration;
- threat state is active;
- player invulnerability is zero.

Damage applies to mass:

```text
lostMass = targetMass × damageFraction
targetMass = max(minMass, targetMass - lostMass)
currentMass = min(currentMass, targetMass × 1.05)
```

Initial `damageFraction = 0.18`.

### Knockback

Impulse direction is from threat center to player center. World impulse scales by inverse zoom so screen-space feedback remains legible.

## 8. Lost fragments

On damage:

- 30–45% of lost mass becomes 4–10 fragments;
- fragments eject away from impact with angular spread;
- fragments become edible after 250 ms;
- fragments expire after 6–10 seconds;
- enemies may also absorb them.

## 9. Near miss

A near miss occurs when a threat passes within `1.15 × collisionDistance` without dealing damage and then leaves the detection envelope. It has a per-enemy cooldown.

Near misses:

- add a small settlement multiplier;
- produce a restrained audio accent;
- can activate traits.

## 10. Death

Death occurs when target mass falls below configured minimum or a stage-specific lethal hazard resolves. Standard enemies should normally cause shrinkage rather than instant death.

## 11. Run settlement reward

Initial formula:

```text
base = stageIndex² × 3
massTerm = log2(maxMass / startMass) × 2
skillTerm = min(nearMissCount, 20) × 0.15
difficulty = { calm: 0.8, standard: 1.0, abyss: 1.35 }

reward = floor((base + massTerm + skillTerm) × difficulty × settlementEfficiency)
```

- voluntary settlement efficiency: `1.0`;
- death settlement efficiency: `0.65`;
- early abort before stage 1: `0`.

All coefficients are config-driven.

## 12. Determinism

Given identical:

- seed;
- fixed input stream;
- config version;

the simulation should produce the same domain outcomes within JavaScript number precision. Visual-only random values use a separate RNG stream and do not affect gameplay.
