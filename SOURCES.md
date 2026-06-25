# Sources and Verification Notes

Reviewed on 2026-06-25.

## Reference behavior

- Playable reference: https://aitinkerer0.github.io/mote_game/
- Public repository: https://github.com/AItinkerer0/mote_game
- Repository README describes a single HTML, Vanilla JavaScript, Canvas 2D, growth, camera zoom-out, threats, tiers, settlement, skins, Web Audio, and static hosting.
- The inspected implementation uses a player current/target radius, area-style radius aggregation, a screen-space expansion threshold, camera zoom target, spring-like radial blob points, world culling/spawning, local browser save, and procedural Web Audio.

These observations are used only to identify broad behavior. No reference implementation text is included in this bundle.

## Licensing

- GitHub licensing guidance:
  https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository

GitHub states that without a license, default copyright applies and others may not reproduce, distribute, or create derivative works from the code. The reference repository's visible root listing did not show a LICENSE file during review.

## Platform documentation

- Vite guide: https://vite.dev/guide/
- Canvas API: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- requestAnimationFrame: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
- Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- IndexedDB API: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
- Service Worker API: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API

Vite documentation displayed version 8.1.0 and a Node.js compatibility requirement of 20.19+ or 22.12+ when reviewed.
