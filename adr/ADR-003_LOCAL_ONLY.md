# ADR-003: Local-Only Initial Release

## Status

Accepted.

## Decision

Version 1.0 has no server, account, analytics, ads, cloud save, or remote config.

## Reason

The core game has no network requirement. Local-only design reduces cost, privacy risk, failure modes, and release complexity.

## Consequences

- save data does not synchronize;
- economy cannot be treated as tamper-proof;
- support workflow needs export/import;
- future online features require a separate architecture review.
