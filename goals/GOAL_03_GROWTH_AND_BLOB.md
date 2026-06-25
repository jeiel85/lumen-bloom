# Goal 03 — Absorption, Growth, and Blob Feel

## Objective

Deliver the first playable tactile loop with original blob dynamics.

## Work

- Mote entities and object pool.
- Relationship policy and hysteresis.
- Magnet, contact, merge, consume state machine.
- Area-based mass gain.
- Exponential growth smoothing.
- Blob point spring/tension model.
- Movement and absorption impulses.
- Original player rendering and halo.
- Procedural absorption SFX after user gesture.
- Seeded test scene.

## Acceptance criteria

- Objects are not removed instantly on contact.
- Mass conservation formula tests pass.
- Blob returns to rest.
- Frequent absorption does not exceed particle/entity caps.
- Audio rate limiting prevents excessive simultaneous voices.
- First absorption is satisfying in manual review and occurs within target time.
