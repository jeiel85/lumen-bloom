# Save and Data Specification

## 1. Storage strategy

Use IndexedDB for primary save data.

Database: `lumen-bloom`
Object store: `saves`
Records:

- `profile-primary`
- `profile-backup`
- `settings`
- `meta`

`localStorage` may contain only:

- migration marker from an older prototype;
- last successful schema version;
- service worker update dismissal timestamp.

## 2. Save envelope

```ts
interface SaveEnvelope {
  schemaVersion: number;
  contentVersion: string;
  revision: number;
  writtenAt: string;
  payload: PersistentProfile;
  checksum: string;
}
```

Checksum detects accidental corruption; it is not security.

## 3. Persistent profile

```ts
interface PersistentProfile {
  profileId: string;
  createdAt: string;
  updatedAt: string;
  currency: {
    memoryShards: number;
    lifetimeEarned: number;
    lifetimeSpent: number;
  };
  progression: {
    highestStage: number;
    completedRuns: number;
    selectedDifficulty: DifficultyId;
    equippedTraitId: string | null;
  };
  unlocks: {
    cosmeticIds: string[];
    traitIds: string[];
    achievementIds: string[];
    legacyIds: string[];
  };
  equipment: {
    coreColorId: string;
    haloId: string;
    topologyId: string;
    trailId: string;
    backgroundId: string;
    audioMotifId: string;
  };
  tutorial: Record<string, boolean>;
  statistics: PlayerStatistics;
}
```

## 4. Settings

Settings are separate so they can load before profile recovery.

- language;
- quality;
- auto quality;
- volumes;
- reduced motion;
- camera shake;
- high contrast;
- touch control;
- touch sensitivity;
- large HUD;
- tutorial hints;
- pause on blur.

## 5. Transactional write

1. Validate in-memory profile.
2. Serialize canonical JSON.
3. Compute checksum.
4. Read primary.
5. Write old valid primary to backup.
6. Write new envelope to primary.
7. Read primary back and verify revision/checksum.
8. Update in-memory last-saved revision.

A failed write leaves the previous valid primary or backup intact.

## 6. Save triggers

- run settlement;
- unlock purchase;
- equipment change;
- setting change with debounce;
- tutorial completion;
- background checkpoint every 30 seconds while profile is dirty;
- page hide using best-effort immediate transaction.

Do not rely only on `beforeunload`.

## 7. Load recovery

1. Read primary.
2. Validate envelope shape and checksum.
3. Run migrations sequentially.
4. Validate domain invariants.
5. If failure, repeat with backup.
6. If both fail, present:
   - create fresh profile;
   - export raw corrupted records;
   - retry.
7. Never silently overwrite both invalid records.

## 8. Migrations

Each migration is pure:

```ts
type Migration = (input: unknown) => unknown;
```

Rules:

- one function per version step;
- no browser calls;
- idempotence where possible;
- fixture tests for every historical version;
- unknown future version must not be downgraded.

## 9. Validation invariants

- currency finite integer, `0 ≤ value ≤ configured max`;
- lifetime spent ≤ lifetime earned + granted migration allowance;
- stable IDs exist or move to legacy;
- equipped IDs are owned or defaulted;
- stage and run counts non-negative integers;
- dates parse as ISO strings;
- statistics finite and bounded.

## 10. Export/import

Required for 1.0 and before native packaging:

- export human-readable JSON;
- include schema and content versions;
- import validates without replacing current save first;
- create backup before import;
- show exact validation error;
- no executable content.

## 11. Privacy

All save data remains on device. There is no user identity, location, contact, advertising ID, analytics ID, or cloud copy in the initial release.
