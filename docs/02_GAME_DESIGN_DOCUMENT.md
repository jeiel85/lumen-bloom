# Game Design Document

## 1. High concept

A small light seed floats in darkness. It draws in weaker light, acquires mass, and becomes a larger natural phenomenon. Each major growth event reveals that the previous world was only one layer of a much larger scale.

## 2. Player fantasy

- “I began as almost nothing.”
- “Everything I feared can eventually become food.”
- “The world keeps opening beyond what I expected.”
- “My movement visibly shapes my body.”
- “I choose when to preserve what I have earned.”

## 3. Core loop

```text
Navigate
  → identify edible objects and threats
  → absorb edible mass
  → grow and gain temporary momentum
  → cross a scale threshold
  → experience world expansion
  → take larger risks
  → settle the run or continue
  → unlock persistent expression/side-grades
  → restart
```

## 4. Moment-to-moment rules

### Edibility

Let `ratio = target.radius / player.radius`.

- `ratio ≤ 0.90`: edible.
- `0.90 < ratio < 1.12`: contested; objects avoid or orbit, no instant consumption.
- `ratio ≥ 1.12`: threat.

Hysteresis is mandatory to prevent rapid state flipping near boundaries.

### Absorption

An edible object is not removed instantly. It transitions through:

1. **Magnet phase** — target curves toward the player.
2. **Contact phase** — target stretches and player surface indents.
3. **Merge phase** — target area is committed to player target radius.
4. **Settle phase** — blob surface oscillates and audio tail decays.

### Damage

A threat contact removes a percentage of target area, not a fixed radius, and applies:

- invulnerability window;
- knockback;
- surface impulse;
- short desaturation;
- scattered recoverable fragments.

The player can reclaim some lost fragments, converting failure into a route decision.

## 5. Scale stages

| Index | Name | Visual language | Threat theme | Audio layer |
|---:|---|---|---|---|
| 0 | Light Dust | sparse points, near-black | drifting shadows | high soft ticks |
| 1 | Droplet | liquid halos and small ripples | dark droplets | water-like filtered plucks |
| 2 | Ripple | flowing arcs and currents | current knots | slow pulse |
| 3 | Moonlit Lake | reflected streaks and wide space | eclipsing forms | warm pad |
| 4 | Star | flare particles and orbital debris | cold stars | harmonic shimmer |
| 5 | Nebula | colored clouds and dust lanes | gravity wells | expanded stereo pad |
| 6 | Galaxy | spiral hints and satellite swarms | devouring cores | low sub layer |
| 7+ | Cosmic Web | procedural palette cycles | ancient void forms | generative variation |

Stage index continues indefinitely. After stage 7, authored stage archetypes recur with seeded palette, modifier, and enemy combinations rather than simply increasing object counts.

## 6. Expansion event

### Trigger

The player's screen-space radius exceeds `expansionTriggerFraction × min(viewportWidth, viewportHeight)` while not already transitioning.

### Event sequence

| Time | Event |
|---:|---|
| 0.00 s | Input influence slightly reduced, never disabled |
| 0.00–0.15 s | Halo compresses and ambient sound ducks |
| 0.10–0.70 s | Camera spring moves toward new zoom |
| 0.20–0.90 s | Palette, spawn table, and background blend |
| 0.45 s | Stage title appears only if enabled |
| 0.60–1.10 s | New larger silhouettes become visible |
| 1.10 s | Full control weighting restored |

Reduced-motion mode replaces the large animated pullback with a 150 ms crossfade and immediate camera scale change.

## 7. Run structure

### Start

- Base radius and stage 0.
- One chosen trait.
- Seeded world state.
- No unskippable tutorial.

### Settlement

The player may settle after the first expansion. Settlement converts:

- highest stage;
- total absorbed area;
- close-call events;
- optional challenge modifiers;

into **Memory Shards**.

### Death

Death automatically settles at a reduced efficiency. The run never yields zero unless it ended before the first meaningful action.

## 8. Persistent progression

### Unlock categories

- core color;
- halo style;
- body topology;
- trail;
- background ambience;
- audio motif;
- side-grade trait;
- challenge modifier.

### Side-grade examples

| Trait | Benefit | Cost |
|---|---|---|
| Tide Heart | stronger magnetism | lower top speed |
| Glass Seed | faster acceleration | greater damage loss |
| Quiet Orbit | threats detect later | fewer high-value spawns |
| Comet Veil | dash after near miss | longer post-dash instability |

No trait may be a universal permanent power increase. Permanent progression broadens choices rather than invalidating early balance.

## 9. Difficulty

Difficulty is produced through composition, not raw speed inflation alone:

- threat density;
- predator awareness;
- current fields;
- safe-object scarcity;
- valuable cluster proximity to threats;
- temporary stage modifiers.

Modes:

- **Calm**: reduced pursuit and damage.
- **Standard**: intended balance.
- **Abyss**: aggressive enemies and higher reward multiplier.

## 10. Controls

### Mouse

The player accelerates toward the pointer relative to screen center. Distance controls desired acceleration magnitude.

### Touch

Default is direct relative steering:

- touch anywhere;
- drag direction from initial touch point;
- magnitude capped at a configurable radius;
- release to coast.

A floating joystick option is available for users who prefer a visible control.

### Keyboard

WASD and arrow keys. Opposing keys cancel. Keyboard takes priority only while pressed.

### Gamepad

Optional post-1.0 enhancement. Left stick steering, face button settle confirmation.

## 11. Pause and lifecycle

The simulation pauses when:

- pause menu opens;
- page becomes hidden;
- window loses focus if configured;
- system interruption occurs.

On resume, discard wall-clock gap. Never simulate background elapsed time.

## 12. Tutorial

Tutorial is contextual and suppressible:

1. “Move toward the small light.”
2. First edible target receives a soft ring.
3. First threat receives a contrasting pulse.
4. Settlement becomes visible after first expansion.
5. Tutorial state is saved.

No tutorial step blocks gameplay.

## 13. Content requirement for 1.0

- 8 stage presentations.
- 5 enemy archetypes.
- 4 side-grade traits.
- 24 deterministic cosmetic unlocks.
- 3 difficulty modes.
- 2 control schemes on touch.
- 1 endless mode.
- 8 challenge achievements.
