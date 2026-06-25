# Testing and Performance Plan

## 1. Test pyramid

### Unit

- mass/radius conversion;
- growth smoothing;
- camera target and spring;
- edibility hysteresis;
- collision and damage;
- reward formula;
- RNG determinism;
- config validation;
- save migrations;
- checksum and recovery;
- stat modifiers.

### Integration

- absorption event to growth and visual event queue;
- damage to fragments and invulnerability;
- expansion to stage switch and spawn table;
- settlement to currency and save;
- lifecycle pause/resume;
- quality change while running.

### Browser/E2E

- start first run;
- keyboard movement;
- mouse movement;
- touch emulation;
- force first expansion;
- settle and reload;
- offline relaunch;
- corrupted primary recovery;
- settings persistence;
- reduced-motion transition;
- resize portrait/landscape.

## 2. Deterministic simulation tests

Use a test clock and seeded RNG. Record input frames and replay them.

Golden assertions should focus on domain outcomes:

- stage reached;
- mass range;
- event sequence;
- entity counts;
- no invalid numbers.

Do not assert every floating-point coordinate unless necessary.

## 3. Visual regression

Capture stable seeded scenes:

- stage 0 normal;
- active absorption;
- damage;
- expansion at 50%;
- stage 5 high quality;
- reduced motion;
- high contrast;
- portrait and landscape.

Mask animated timestamps. Keep threshold low enough to catch geometry changes but tolerate antialiasing differences across browser engines where needed.

## 4. Performance budgets

### Runtime

| Metric | Target |
|---|---:|
| Median FPS | 60 |
| P95 frame time | < 22 ms |
| Simulation step P95 | < 4 ms |
| Render P95 | < 12 ms |
| Long tasks >50 ms | none during ordinary play |
| JS heap after 30-min soak | < 160 MB desktop, < 110 MB mobile target |
| Dropped fixed-step events | 0 ordinary, bounded under throttling |

### Delivery

| Metric | Target |
|---|---:|
| Initial compressed JS | < 300 KB |
| Initial critical transfer excluding optional audio | < 1.5 MB |
| First usable screen on broadband | < 2 s target |
| Service worker application shell | versioned and bounded |

## 5. Test devices

Maintain at least:

- Windows 11 + current Chrome/Edge;
- Windows 11 + Firefox;
- macOS + Safari;
- mid-tier Android phone;
- recent iPhone or iOS simulator plus real-device smoke;
- high-DPR tablet.

Exact device models belong in release records, not hard-coded into this design.

## 6. Profiling workflow

1. Enable debug overlay.
2. Capture 60-second baseline at stage 0.
3. Capture dense stage.
4. Capture repeated expansion.
5. Capture 30-minute soak.
6. Inspect allocation timeline.
7. Change one bottleneck.
8. compare before/after with same seed.

Never optimize based only on intuition.

## 7. Adaptive quality

Sample frame pressure over a rolling window.

Downshift when:

- P95 frame time exceeds 24 ms for 8 seconds;
- tab is active;
- no recent manual quality change.

Upshift only when:

- P95 remains under 15 ms for 30 seconds;
- device is not thermally constrained as inferred by sustained performance;
- at least 15 seconds since last shift.

Manual quality disables auto changes until re-enabled.

## 8. Coverage

Minimum targets:

- domain/config/persistence: 90% statement and branch where practical;
- application coordinators: 80%;
- rendering: behavior and visual tests rather than artificial line coverage;
- critical migrations: 100% branch.

Coverage is a guardrail, not proof of correctness.

## 9. Failure injection

Test:

- IndexedDB quota failure;
- write interruption;
- invalid config;
- audio context unavailable;
- service worker update during session;
- canvas context creation failure;
- resize to zero height temporarily;
- background gap of several minutes;
- extreme DPR;
- malformed imported save.

## 10. Release soak

Before 1.0:

- 30-minute automated bot soak on desktop;
- 20-minute real-device mobile soak;
- 50 start/pause/resume cycles;
- 20 save/reload cycles;
- offline start;
- update from previous deployed build;
- clean install.
