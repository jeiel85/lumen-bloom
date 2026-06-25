# World Streaming and Enemy AI

## 1. World model

The world is conceptually infinite. Only entities within an active annulus around the camera are retained.

### Active radii

- visible radius: half viewport diagonal divided by zoom;
- prewarm radius: visible radius × 1.25;
- cull radius: visible radius × 1.65.

Spawn new entities in the annulus between `0.90 × visibleRadius` and `1.30 × visibleRadius`, avoiding obvious pop-in.

## 2. Density model

Desired entity count depends on viewport world area, but counts are capped.

```text
desired = clamp(baseDensity × visibleWorldArea / referenceArea, minCount, maxCount)
```

Do not simply keep a fixed count forever; very wide views need appropriate distribution. Do not scale without a cap; large world area can explode entity count.

Initial caps:

| Entity | Min | Max |
|---|---:|---:|
| common motes | 50 | 130 |
| creatures | 5 | 18 |
| ambience | 25 | 90 |
| fragments | 0 | 40 |
| particles | pooled cap 320 | pooled cap 700 by quality |

## 3. Spawn safety

A spawn candidate is rejected when:

- within the player exclusion radius;
- inside another large entity;
- immediately lethal with no escape route;
- visible in the central 80% of the viewport;
- violates stage composition budget.

After 10 failed candidates, relax overlap but never relax lethal central spawn rules.

## 4. Spawn composition

Each stage config defines weighted archetypes and size bands relative to player radius.

Example bands:

- tiny edible: `0.05–0.16`;
- valuable edible: `0.35–0.72`;
- contested: `0.92–1.08`;
- threat: `1.18–1.75`;
- rare apex: `2.0–3.2`.

Only a bounded fraction of visible creatures may be threats. Standard initial target: 25–35%.

## 5. Enemy archetypes

### Drifter

- wanders;
- flees if edible;
- softly pursues if threat;
- baseline teaching enemy.

### Hunter

- has detection cone/radius;
- predicts player position;
- gives up after distance/time;
- never spawns as the first threat.

### Orbiter

- circles valuable clusters;
- changes orbit direction after disturbance;
- creates route-planning tension.

### Splitter

- when consumed, releases multiple smaller objects;
- when dangerous, periodically sheds bait.

### Gravity Well

- stage 5+;
- applies a gentle field;
- does not collide like ordinary circles;
- telegraphs range clearly.

## 6. AI state machine

```text
Spawn
 → Wander
 → Evaluate relationship
    ├─ edible → Flee
    ├─ contested → Orbit/Avoid
    └─ threat + detected → Pursue
 → Stunned
 → Despawn
```

Relationship checks use hysteresis and do not run every frame for every entity. Stagger evaluation across frames, e.g. 5–10 Hz.

## 7. Steering

Combine weighted vectors:

- seek/flee;
- separation;
- stage flow field;
- obstacle avoidance;
- wander.

Clamp acceleration and speed in screen-space terms by dividing target screen speed by zoom.

## 8. Fairness controls

- Threat top speed is below player maximum in Standard mode.
- A Hunter may briefly exceed player speed only during a telegraphed dash.
- No lethal spawn inside 1.5 viewport radii.
- At least one edible cluster must exist in a reachable quadrant.
- Damage invulnerability prevents chain contacts.
- Camera expansion may not spawn a threat directly on the new visible border within the first 500 ms.

## 9. Stage modifiers

Examples:

- gentle current;
- sparse valuable clusters;
- rotating safe lanes;
- pulsing visibility;
- comet rain;
- mirrored drift.

Modifiers change route structure, not UI complexity.

## 10. Object pooling

Pools are required for:

- motes;
- particles;
- lost fragments;
- transient absorption visuals.

Pool reset functions must clear every gameplay-relevant field. Tests must detect stale state leakage.

## 11. Long-session coordinate stability

World coordinates may grow large. Before precision becomes visible, perform origin rebasing:

- when player magnitude exceeds configured threshold;
- subtract player position from all entities;
- set player and camera near origin;
- preserve velocities and relative positions;
- emit no gameplay event.

Run a deterministic test across rebasing.

## 12. Soak requirements

A bot-driven 30-minute run must:

- remain below entity caps;
- avoid increasing retained object count over time;
- perform repeated origin rebases;
- complete at least 20 expansions;
- produce no NaN/Infinity values;
- stay within the memory budget.
