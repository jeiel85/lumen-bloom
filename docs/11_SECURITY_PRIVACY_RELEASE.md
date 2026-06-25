# Security, Privacy, and Release

## 1. Threat model

The application is a local single-player game with no server trust boundary. Primary concerns:

- malicious or malformed imported save;
- compromised third-party dependency;
- cross-site scripting through unsafe UI rendering;
- service worker caching mistakes;
- accidental network tracking;
- corrupted local state;
- supply-chain license incompatibility.

## 2. Security controls

- No `innerHTML` for dynamic user-controlled data.
- Validate imported JSON before use.
- No dynamic code execution (`eval`, `Function`).
- No remote scripts, fonts, trackers, or analytics.
- Pin dependencies with lock file.
- Run dependency audit and license report in CI.
- Use a restrictive CSP:
  - `default-src 'self'`;
  - `script-src 'self'`;
  - `style-src 'self'`;
  - `img-src 'self' data: blob:`;
  - `media-src 'self' blob:`;
  - `connect-src 'none'` for the base release;
  - adjust only for hosting requirements.
- Service worker handles only same-origin GET requests for known application assets.
- Cache names include build version.
- Old caches are removed during activation.

## 3. Privacy

Initial release collects and transmits no personal data.

No:

- account;
- email;
- device fingerprint;
- location;
- contacts;
- advertising ID;
- usage analytics;
- crash upload;
- remote configuration.

A privacy page should plainly state local storage use and offline caching.

## 4. Permissions

PWA manifest requests no sensitive permission. Native wrappers must not add internet-adjacent or device permissions unless an actual feature requires them.

## 5. Dependency policy

Prefer zero runtime dependencies beyond browser APIs. Development dependencies must:

- be actively maintained;
- have an understood license;
- be pinned through lock file;
- be reviewed before major upgrade.

Create `THIRD_PARTY_NOTICES.md` for distributed runtime assets and libraries.

## 6. Release channels

- `main`: releasable.
- feature branches: short-lived.
- preview deployments per pull request.
- production tags: `vMAJOR.MINOR.PATCH`.
- save schema version increments independently from app version.

## 7. Static host headers

Recommended:

```text
/index.html
  Cache-Control: no-cache

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/service-worker.js
  Cache-Control: no-cache

Content-Security-Policy:
  default-src 'self'; script-src 'self'; style-src 'self';
  img-src 'self' data: blob:; media-src 'self' blob:;
  connect-src 'none'; object-src 'none'; base-uri 'self';
  frame-ancestors 'none'
```

Host-specific syntax must be configured for Vercel, Cloudflare Pages, or GitHub Pages.

## 8. PWA update behavior

- Detect waiting service worker.
- Show non-blocking “Update ready” control.
- Never force reload during an active run.
- On settlement or main screen, allow safe activation.
- Preserve profile in IndexedDB independent of cache version.

## 9. Store readiness

Before native store release:

- app icon and adaptive icon;
- screenshots for required form factors;
- privacy policy;
- data safety declaration matching no collection;
- age rating review;
- accessibility statement;
- offline behavior description;
- restore after OS process kill;
- wrapper permission audit;
- signing and backup policy.

## 10. Incident response

For a bad release:

1. halt promotion;
2. preserve deployed artifact and commit;
3. identify whether save schema is affected;
4. deploy rollback only if backward save compatibility is safe;
5. otherwise ship forward-fix migration;
6. document root cause and regression test.
