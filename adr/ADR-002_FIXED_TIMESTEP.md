# ADR-002: Fixed-Timestep Simulation

## Status

Accepted.

## Decision

Run gameplay at a fixed 60 Hz and render with interpolation.

## Reason

Growth, blob springs, AI, camera transitions, and deterministic replay should not change materially with display refresh rate. Variable timestep would complicate balancing and tests.

## Controls

- frame delta clamp;
- maximum five simulation steps per render;
- dropped-time diagnostics;
- reset accumulator after backgrounding.
