# Goal 06 — Settlement, Progression, and Reliable Save

## Objective

Complete the run loop and persistent local progression.

## Work

- Voluntary and death settlement.
- Reward formula.
- Results screen.
- Memory Shards.
- Deterministic catalog and purchases.
- Equipment.
- Four side-grade traits through stat modifiers.
- IndexedDB save repository.
- Primary/backup transaction.
- Schema validation, checksum, recovery.
- Export/import.
- Migration test harness.

## Acceptance criteria

- Refresh after settlement preserves currency/unlocks.
- Corrupted primary loads backup.
- Both invalid records produce recovery UI without overwrite.
- Traits have costs and tradeoffs.
- No gacha/random paid reward.
- Save/import fuzz tests do not crash the app.
