# Goal 04 — Expansion and Stage Presentation

## Objective

Implement the signature camera-scale revelation independently.

## Work

- Screen-radius threshold calculation.
- Zoom spring and transition state.
- Eight stage configs.
- Palette/background crossfade.
- Stage spawn-table handoff.
- Expansion event sequence.
- Stage title and HUD.
- Reduced-motion alternative.
- Original expansion audio cue.

## Acceptance criteria

- Screen radius returns to target fraction after expansion.
- No second trigger during transition.
- Resize during transition remains stable.
- Reduced-motion path has identical gameplay result.
- Old objects do not all pop away at the stage boundary.
- E2E test reaches and verifies first expansion.
