# Goal 02 — Loop, Input, and Camera Foundation

## Objective

Implement fixed-timestep simulation, lifecycle pause, input normalization, and camera transform.

## Work

- Browser clock and requestAnimationFrame loop.
- 60 Hz accumulator with clamping and dropped-step diagnostics.
- Keyboard, mouse-follow, and touch-relative input adapters.
- Input method arbitration.
- Player point movement with screen-space-consistent speed.
- Camera position spring and world/screen transforms.
- Resize and DPR cap.
- Debug overlay behind a development flag.
- Deterministic replay fixture.

## Acceptance criteria

- Movement distance is within tolerance across 30/60/120 Hz rendering.
- Tab background/resume causes no jump.
- Touch, mouse, and keyboard E2E smoke tests pass.
- Player remains visually centered with bounded look-ahead.
- No browser global is imported by domain systems.
