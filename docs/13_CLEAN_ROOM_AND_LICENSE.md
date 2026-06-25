# Clean-room and License Controls

## 1. Reference status

The observed reference repository is publicly viewable, but its visible root file list did not show a license file when reviewed on 2026-06-25. GitHub documentation states that without a license, default copyright applies and others may not reproduce, distribute, or create derivative works from the code, apart from platform terms such as viewing and forking.

Therefore this project must not use the reference source code.

## 2. Allowed observation

Allowed:

- play the publicly available game;
- document high-level genre conventions;
- measure subjective pacing during normal play;
- identify general mechanics such as growth, absorption, camera scaling, and endless streaming;
- research independent mathematical and engineering approaches.

Not allowed:

- copy, translate, minify/de-minify, or mechanically transform reference code;
- transfer constants or arrays from reference source;
- reproduce UI composition;
- reuse names, copy, palettes, skin lists, sound notes, or artwork;
- use screenshots as production assets;
- ask an AI coding agent to “recreate this file with different names.”

## 3. Independent design evidence

This bundle intentionally changes:

- theme: light/water/cosmos rather than virus/cell;
- stage names and progression;
- thresholds and balancing;
- movement and camera spring model;
- damage fragments and near-miss system;
- deterministic store rather than gacha;
- traits and difficulty;
- UI layout;
- audio architecture;
- persistence architecture;
- modular TypeScript implementation.

## 4. Development record

Maintain:

- this design bundle commit;
- ADR history;
- asset provenance table;
- dependency license report;
- playtest notes;
- originality review checklist.

Commit messages should demonstrate implementation from internal specifications rather than reference-source translation.

## 5. Originality review before release

Review side-by-side at the product level:

- title and icon;
- start screen;
- HUD position and wording;
- player silhouette;
- common food shapes;
- threat shapes;
- palette transition order;
- expansion visual;
- shop/collection flow;
- settlement animation;
- sound motifs.

Any element that creates an overall substantially similar impression should be redesigned even when individual mechanics are common.

## 6. Own project license

Choose deliberately:

- proprietary/all-rights-reserved for a commercial closed-source game; or
- an explicit open-source license for code plus separate asset licenses.

Do not publish the new repository without deciding licensing. Put the chosen terms in the repository root and document third-party notices.

## 7. Sources reviewed

- Reference game repository and README: `https://github.com/AItinkerer0/mote_game`
- Reference playable site: `https://aitinkerer0.github.io/mote_game/`
- GitHub licensing guidance: `https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository`
- Vite guide: `https://vite.dev/guide/`
- MDN Canvas API: `https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API`
- MDN Web Audio API: `https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API`
- MDN IndexedDB API: `https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API`
- MDN Service Worker API: `https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API`

This document is an engineering control, not legal advice.
