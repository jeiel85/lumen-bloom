# Goal 05 — Infinite World and Enemy Ecology

## Objective

Create bounded endless streaming and the five launch enemy archetypes.

## Work

- Visible/prewarm/cull radii.
- Density calculation and spawn annulus.
- Spatial hash.
- Relationship-aware AI.
- Drifter, Hunter, Orbiter, Splitter, Gravity Well.
- Threat fairness controls.
- Lost fragments and near misses.
- Origin rebasing.
- Headless bot and soak test.

## Acceptance criteria

- No visible central pop-in under normal movement.
- Threat caps and safe spawn rules pass simulation tests.
- 30-minute bot soak has no NaN, runaway entity count, or monotonic heap growth.
- Origin rebase preserves relative positions.
- Threat/edible behavior uses hysteresis without flicker.
