# AI Coding Rules

## 1. Operating mode

Implement this repository as a production product, not as a prototype. Work one goal at a time from `goals/`. Before editing, summarize the goal, impacted modules, tests, and risks. After editing, run all required verification commands and report exact results.

## 2. Clean-room restriction

The reference game may be observed only to understand general behavior. Never:

- copy or translate its source code;
- preserve its identifiers, constants, comments, DOM structure, screen arrangement, palettes, text, sound sequences, or collection items;
- use screenshots or extracted assets;
- build by mechanically rewriting its single-file implementation.

All code must be derived from this bundle's contracts and independent engineering decisions.

## 3. Technical rules

- TypeScript `strict: true`.
- No `any` except inside a narrowly-scoped compatibility adapter with justification.
- Core simulation may not access DOM, storage, audio, or browser globals directly.
- Dependency direction: `app → presentation → game systems → domain`.
- Systems communicate through typed state and events, not arbitrary cross-imports.
- Prefer pure functions for formulas, collision decisions, progression, and migrations.
- Fixed-timestep simulation; rendering is allowed to interpolate.
- Clamp long frame deltas and prevent spiral-of-death.
- All random behavior goes through the seeded `RandomSource` interface.
- Balance values come from validated config.
- Keep files below roughly 400 lines; split by responsibility before they become monoliths.
- No network permission or fetch call in gameplay runtime.
- Audio must begin only after a user gesture.
- Save operations must be transactional and retain one backup slot.

## 4. Quality rules

For every behavior change:

1. Add or update unit tests.
2. Add an integration or browser test when the behavior crosses module boundaries.
3. Verify keyboard, pointer, and touch when input is affected.
4. Verify reduced-motion behavior when animation is affected.
5. Run:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run test:e2e
```

Do not claim success when a command was skipped or failed.

## 5. Commit discipline

Use small commits aligned to one acceptance criterion. Recommended prefixes:

- `feat:`
- `fix:`
- `refactor:`
- `test:`
- `docs:`
- `chore:`

Do not combine architecture migration, balancing, and visual polish in one commit.

## 6. Performance discipline

- Do not allocate temporary arrays or objects in hot per-frame loops unless profiling shows it is harmless.
- Reuse particles and frequently spawned entities through pools.
- Use a spatial hash for broad-phase collision.
- Cap device pixel ratio at the configured value.
- Apply quality degradation before lowering simulation correctness.
- Record entity count, update time, render time, and dropped fixed steps in the debug overlay.

## 7. Completion response

At the end of each goal, report:

- implemented acceptance criteria;
- changed files;
- commands run and their results;
- measured performance when relevant;
- known limitations;
- next goal readiness.
