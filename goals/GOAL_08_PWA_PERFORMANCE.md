# Goal 08 — PWA and Performance Hardening

## Objective

Make the game installable, offline, and stable on target devices.

## Work

- Manifest and icons.
- Versioned service worker.
- Safe update prompt.
- Offline application shell.
- Quality tiers and automatic downshift.
- Pooling audit.
- Rendering allocation audit.
- Bundle budget checks.
- Performance sampler.
- Real-device profiling.

## Acceptance criteria

- Offline relaunch succeeds after first visit.
- Update never reloads an active run.
- Standard quality meets P95 frame target on the designated mid-tier device.
- JS and critical transfer budgets pass.
- Auto quality does not oscillate.
