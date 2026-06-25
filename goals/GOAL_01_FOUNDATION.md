# Goal 01 — Foundation and CI

## Objective

Create a strict, testable Vite + TypeScript repository with no gameplay yet.

## Work

- Scaffold vanilla TypeScript.
- Configure TypeScript strict mode.
- Configure ESLint, Prettier, Vitest, Playwright.
- Add scripts: `dev`, `build`, `preview`, `typecheck`, `lint`, `format`, `test`, `test:coverage`, `test:e2e`.
- Create source tree from architecture document.
- Add config loader with schema validation and safe defaults.
- Add GitHub Actions pipeline.
- Add responsive canvas shell and semantic main menu.
- Add CSP-compatible code; no inline runtime scripts.
- Add `LICENSE` decision placeholder that blocks release until resolved.
- Add `THIRD_PARTY_NOTICES.md`.

## Acceptance criteria

- `npm ci` works from clean checkout.
- All quality commands pass.
- Production build contains no remote URL dependency.
- Main screen renders in portrait and landscape.
- Config validation failure is covered by test.
- CI uploads test/build artifacts on failure.

## Do not implement

Movement, entities, growth, audio, persistence, service worker.
