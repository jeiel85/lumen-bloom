# Technical Architecture

## 1. Stack

| Layer | Choice |
|---|---|
| Language | TypeScript, strict mode |
| Build | Vite 8.x |
| Rendering | Canvas 2D |
| UI overlay | Semantic HTML/CSS |
| Simulation | Fixed timestep |
| Audio | Web Audio API |
| Persistence | IndexedDB, localStorage only for bootstrap/migration marker |
| Offline | Service Worker + versioned application shell cache |
| Unit tests | Vitest |
| Browser tests | Playwright |
| CI | GitHub Actions |
| Packaging | Static hosting first |

React, Vue, Phaser, PixiJS, and a physics engine are deliberately excluded from the initial implementation. The game has one scene, limited UI, custom blob rendering, and simple circle-based collision; a smaller dependency surface is preferable.

## 2. Runtime layers

```text
Bootstrap
 ├─ Platform adapters
 │   ├─ BrowserClock
 │   ├─ BrowserInput
 │   ├─ WebAudioAdapter
 │   ├─ IndexedDbSaveStore
 │   └─ ServiceWorkerRegistration
 ├─ Application
 │   ├─ GameSessionController
 │   ├─ PauseController
 │   ├─ SettingsController
 │   └─ ProgressionController
 ├─ Domain simulation
 │   ├─ MovementSystem
 │   ├─ AbsorptionSystem
 │   ├─ GrowthSystem
 │   ├─ CollisionSystem
 │   ├─ EnemyAiSystem
 │   ├─ CameraScaleSystem
 │   ├─ StageSystem
 │   └─ WorldStreamingSystem
 └─ Presentation
     ├─ CanvasRenderer
     ├─ BlobRenderer
     ├─ BackgroundRenderer
     ├─ EffectsRenderer
     ├─ HudView
     └─ MenuViews
```

## 3. Dependency rule

Domain simulation imports only:

- domain types;
- math utilities;
- config types;
- deterministic random interface;
- event queue interface.

It must not import:

- `window`;
- `document`;
- Canvas types;
- Audio types;
- IndexedDB;
- service worker APIs;
- UI modules.

## 4. Suggested source tree

```text
src/
├─ app/
│  ├─ bootstrap.ts
│  ├─ GameApp.ts
│  ├─ GameSessionController.ts
│  └─ lifecycle.ts
├─ domain/
│  ├─ state/
│  ├─ entities/
│  ├─ events/
│  ├─ math/
│  └─ systems/
├─ config/
│  ├─ loadConfig.ts
│  ├─ validateConfig.ts
│  └─ types.ts
├─ input/
│  ├─ InputManager.ts
│  ├─ PointerInput.ts
│  ├─ TouchInput.ts
│  └─ KeyboardInput.ts
├─ rendering/
│  ├─ CanvasRenderer.ts
│  ├─ CameraTransform.ts
│  ├─ BlobRenderer.ts
│  ├─ WorldRenderer.ts
│  ├─ BackgroundRenderer.ts
│  ├─ ParticleRenderer.ts
│  └─ QualityController.ts
├─ audio/
│  ├─ AudioManager.ts
│  ├─ ProceduralSfx.ts
│  └─ MusicDirector.ts
├─ persistence/
│  ├─ SaveRepository.ts
│  ├─ IndexedDbSaveStore.ts
│  ├─ migrations/
│  └─ checksum.ts
├─ ui/
│  ├─ screens/
│  ├─ hud/
│  └─ accessibility/
└─ diagnostics/
   ├─ DebugOverlay.ts
   ├─ PerformanceSampler.ts
   └─ EventRecorder.ts
```

## 5. Main loop

Use a fixed 60 Hz simulation:

```ts
const STEP = 1 / 60;
const MAX_FRAME_DELTA = 0.1;
const MAX_STEPS_PER_FRAME = 5;

function frame(nowMs: number): void {
  const raw = (nowMs - previousMs) / 1000;
  const frameDelta = Math.min(raw, MAX_FRAME_DELTA);
  previousMs = nowMs;
  accumulator += frameDelta;

  let steps = 0;
  while (accumulator >= STEP && steps < MAX_STEPS_PER_FRAME) {
    game.update(STEP);
    accumulator -= STEP;
    steps += 1;
  }

  if (steps === MAX_STEPS_PER_FRAME && accumulator >= STEP) {
    diagnostics.recordDroppedSimulationTime(accumulator);
    accumulator = 0;
  }

  renderer.render(game.snapshot(), accumulator / STEP);
  requestAnimationFrame(frame);
}
```

The pseudocode establishes behavior, not exact implementation. Browser lifecycle pause must reset `previousMs` and `accumulator`.

## 6. State ownership

`GameState` is the single authoritative transient run state. UI derives read-only view models. Persistent progression is separate and injected at run start.

```text
PersistentProfile
       ↓ creates
RunConfiguration
       ↓
GameState ── emits DomainEvents ──→ presentation/audio/save coordinator
```

Rendering may never mutate simulation state.

## 7. Events

Use a bounded per-step event buffer:

- `AbsorptionStarted`
- `AbsorptionCommitted`
- `PlayerDamaged`
- `NearMiss`
- `ExpansionStarted`
- `ExpansionCompleted`
- `RunSettled`
- `PlayerDied`
- `UnlockGranted`

Audio and visual effects consume events after each fixed update. Events carry IDs and numerical parameters, not references to mutable entities.

## 8. Spatial partition

Use a uniform spatial hash:

- cell size based on the largest ordinary interaction radius in the current stage;
- entities registered after movement;
- query neighboring cells for edible/threat candidates;
- large boss-like entities stored in a separate list;
- no all-pairs collision.

Rebuild each step initially. Optimize to incremental updates only if profiling justifies complexity.

## 9. Configuration

All balance and content tables load at bootstrap and validate before the start screen. Invalid production config must fail closed to bundled safe defaults and log a structured diagnostic.

## 10. Rendering pipeline

1. Resize and DPR normalization.
2. Background clear and stage blend.
3. Distant ambience.
4. World objects back-to-front.
5. Absorption bridges and trails.
6. Player blob.
7. Particles and flash effects.
8. Canvas-space guidance.
9. DOM HUD and menus.

Canvas is sized in physical pixels, while simulation and UI use CSS pixels. Cap DPR at 2 by default.

## 11. Quality tiers

| Tier | Blob points | Particle multiplier | Background layers | Shadow blur |
|---|---:|---:|---:|---|
| Low | 16 | 0.45 | 1 | reduced |
| Medium | 20 | 0.75 | 2 | standard |
| High | 24 | 1.00 | 3 | full |

Auto quality may reduce one level after sustained frame pressure, but must not oscillate more than once per 15 seconds.

## 12. Deployment

The production output is a static site:

- hashed immutable assets;
- no secrets;
- no runtime backend;
- `index.html` no-cache or short cache;
- assets long-cache;
- service worker update prompt;
- strict Content Security Policy where host permits.

## 13. CI pipeline

```text
install locked dependencies
→ typecheck
→ lint
→ unit tests + coverage
→ production build
→ Playwright smoke tests
→ artifact size check
→ dependency/license report
→ deploy preview
```
