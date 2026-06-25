# Product Requirements Document

## 1. Product statement

**Lumen Bloom** is a calm infinite-growth arcade game in which the player absorbs smaller light forms, avoids or outgrows larger beings, and repeatedly expands the camera scale until a new visual layer of the universe is revealed.

The product must deliver a satisfying growth sensation in sessions that are immediately understandable but support persistent mastery and collection.

## 2. Goals

### G1. Tactile growth

Every absorption must produce visible approach, contact, deformation, mass gain, sound, and a short after-effect. Growth may never feel like a silent numeric increment.

### G2. Scale revelation

The camera must not merely zoom continuously. Growth phases should culminate in authored expansion moments that change perceived world scale, palette, ambience, spawn composition, and audio layer.

### G3. Low-friction access

The first run begins within two interactions. No account, tutorial modal chain, network dependency, or mandatory consent screen.

### G4. Sustainable progression

A run produces deterministic persistent rewards. Unlocks affect expression or introduce side-grade play styles; paid random rewards are prohibited.

### G5. Production reliability

The game must recover from interrupted saves, resize correctly, pause on backgrounding, respect audio policies, and remain playable offline.

## 3. Non-goals for version 1.0

- multiplayer;
- server-authoritative economy;
- cloud synchronization;
- account system;
- leaderboard;
- ads;
- gacha;
- user-generated content;
- complex narrative campaign;
- 3D rendering;
- WebGL-only requirement.

## 4. Target users

| Segment | Need | Product response |
|---|---|---|
| Casual mobile player | Immediate play, one-thumb control | Direct touch steering and short first settlement |
| Desktop browser player | Precise control and visual smoothness | Mouse-follow and WASD/arrow support |
| Relaxation-oriented player | Low stress and audiovisual comfort | Calm default mode, adjustable danger |
| Mastery player | Optimization and replayability | Route choices, risk multipliers, challenge modifiers |
| Accessibility-sensitive player | Reduced visual and input strain | Reduced motion, contrast mode, scalable UI, full mute |

## 5. Core user journey

1. Open the game.
2. See one central light seed and a minimal start affordance.
3. Move immediately.
4. Absorb small motes.
5. Feel body deformation and growth.
6. Encounter a larger dangerous form.
7. Reach an expansion threshold.
8. Experience camera pullback and stage transformation.
9. Choose to continue or settle the run.
10. Spend earned memory shards on deterministic unlocks.
11. Start again with a cosmetic or side-grade change.

## 6. Session targets

These are initial tuning targets and must be validated through playtesting:

| Milestone | Target |
|---|---:|
| First absorption | under 5 seconds |
| First threat sighting | 20–40 seconds |
| First expansion | 45–90 seconds |
| First voluntary settlement | 6–10 minutes |
| First permanent unlock | within 2 completed runs |
| Meaningful full session | 8–20 minutes |

## 7. Success criteria

### Experience metrics for internal testing

- At least 8 of 10 testers can explain the edible/threat relationship without text.
- At least 7 of 10 testers describe the first expansion as noticeable and satisfying.
- No tester loses progress after forced refresh during the save test.
- Touch users can complete the first expansion without changing settings.
- Reduced-motion mode preserves gameplay clarity.

### Technical release gates

- 60 FPS median on the defined mid-tier test device.
- 95th percentile frame time below 22 ms in standard quality.
- No unhandled exceptions during a 30-minute automated soak.
- Save migration tests pass from every released schema version.
- Offline launch succeeds after one online visit.
- No third-party requests during gameplay.

## 8. Platforms

### Version 1.0

- Chromium desktop browsers: current and previous major.
- Firefox desktop: current and previous major.
- Safari desktop: current and previous major.
- Android Chrome: current and previous major.
- iOS Safari: current and previous major.
- Installable PWA where supported.

### Later packaging

- Android/iOS through Capacitor only after browser version meets release gates.
- Desktop through Tauri or Electron only if distribution demand justifies maintenance.

## 9. Monetization options

The base specification assumes no monetization dependency. Preferred order:

1. Premium one-time mobile/desktop purchase.
2. Free web edition with optional paid cosmetic expansion.
3. Soundtrack or supporter pack.
4. No ads and no randomized paid rewards.

## 10. Product risks

| Risk | Impact | Control |
|---|---|---|
| Growth becomes visually flat | Core appeal fails | Multi-stage absorption and blob impulse acceptance tests |
| Zoom causes disorientation | Motion sickness or loss of agency | Anchored camera, transition cap, reduced-motion alternative |
| Infinite play becomes repetitive | Low retention | Stage modifiers, enemy archetypes, route choices |
| Too many particles hurt mobile performance | Frame drops | Quality tiers, pooling, effect budgets |
| Reference similarity | Legal and brand risk | Clean-room rules and originality review |
| Save corruption | Trust loss | Two-slot transactional saves and migrations |
