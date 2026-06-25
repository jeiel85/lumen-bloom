# Lumen Bloom — Production Design Bundle

> Working title: **Lumen Bloom / 빛의 탄생**<br>
> Genre: infinite-growth ambient arcade<br>
> Target: Web/PWA first, then Android/iOS wrapper and optional desktop build<br>
> Design date: 2026-06-25

## 1. Purpose

This bundle is a production-grade implementation specification for an original game inspired by the general experience of:

- absorbing smaller objects;
- becoming physically larger;
- smoothly changing camera scale;
- revealing a broader world as the player grows;
- converting a run into persistent progression.

It is **not** a copy specification. Source code, names, UI layouts, visual assets, sound designs, balancing values, stage composition, and collection systems from the reference game must not be reused.

## 2. Product concept

The player begins as a faint particle of light and evolves through a sequence of visual scales:

`Light Dust → Droplet → Ripple → Moonlit Lake → Star → Nebula → Galaxy → Cosmic Web`

The emotional arc is:

`fragile → curious → capable → expansive → sublime`

The game should feel calm and tactile, while still creating tension through predators, risky routes, and voluntary run settlement.

## 3. Recommended implementation order

1. Read `AGENTS.md`.
2. Read `docs/01_PRODUCT_REQUIREMENTS.md`.
3. Read `docs/03_TECHNICAL_ARCHITECTURE.md`.
4. Execute `goals/GOAL_01_FOUNDATION.md` through
   `goals/GOAL_10_RELEASE.md` in order.
5. Do not proceed to the next goal until the current Definition of Done is met.
6. Treat `config/*.json` as balance data, not hard-coded constants.
7. Validate every release candidate against `docs/14_RELEASE_CHECKLIST.md`.

## 4. Bundle map

| Path | Purpose |
|---|---|
| `AGENTS.md` | Repository-wide coding rules for an AI coding agent |
| `docs/01_PRODUCT_REQUIREMENTS.md` | Product scope, users, success criteria |
| `docs/02_GAME_DESIGN_DOCUMENT.md` | Full game design |
| `docs/03_TECHNICAL_ARCHITECTURE.md` | Runtime and module architecture |
| `docs/04_CORE_MECHANICS.md` | Movement, absorption, growth, collision |
| `docs/05_CAMERA_AND_BLOB.md` | Camera scaling and blob deformation |
| `docs/06_WORLD_AND_AI.md` | Infinite streaming, spawning, enemy AI |
| `docs/07_PROGRESSION_AND_ECONOMY.md` | Persistent progression and balancing |
| `docs/08_UI_AUDIO_ART.md` | UX, accessibility, visual and audio direction |
| `docs/09_SAVE_AND_DATA.md` | Save model, migrations, corruption recovery |
| `docs/10_TESTING_AND_PERFORMANCE.md` | Test plan and runtime budgets |
| `docs/11_SECURITY_PRIVACY_RELEASE.md` | Privacy, security, deployment |
| `docs/12_IMPLEMENTATION_CONTRACTS.md` | TypeScript interfaces and system contracts |
| `docs/13_CLEAN_ROOM_AND_LICENSE.md` | Originality and license controls |
| `docs/14_RELEASE_CHECKLIST.md` | Production release gates |
| `goals/` | Sequential `/goal` implementation prompts |
| `config/` | Initial balance and stage data |
| `schemas/` | JSON Schema for save/config validation |
| `adr/` | Architecture decisions |

## 5. Bootstrap

```bash
npm create vite@latest lumen-bloom -- --template vanilla-ts
cd lumen-bloom

npm install
npm install -D vitest @vitest/coverage-v8 playwright eslint prettier typescript-eslint

npm run dev
```

Vite 8 requires Node.js 20.19+ or 22.12+ at the time this design was written. Use Node 22.12+ or a newer supported LTS release and commit the package lock file.

## 6. Non-negotiable release principles

- Original implementation and original audiovisual identity.
- No runtime account, login, analytics, advertising, or remote API in the initial release.
- Offline play after the first successful load.
- Stable 60 FPS target on ordinary recent phones and PCs.
- Save migration and recovery from a corrupted primary save.
- Keyboard, mouse, touch, reduced-motion, and mute controls.
- No gacha or paid random rewards.
- Every persistent reward must be earnable through play.

## 7. License

This design bundle is publicly visible but is not open source. Copyright is
reserved under the terms in `LICENSE`. See `THIRD_PARTY_NOTICES.md` for the
current third-party material status.
