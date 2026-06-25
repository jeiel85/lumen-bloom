# Progression and Economy

## 1. Principles

- No paid random rewards.
- No energy timers.
- No mandatory daily streak.
- No permanent stat escalation that makes early play meaningless.
- Cosmetics and side-grades must have transparent costs.
- The player always sees what an unlock changes before purchase.

## 2. Currency

**Memory Shards** are earned at run settlement.

Sources:

- stage reached;
- maximum mass;
- near misses;
- challenge modifier;
- first-time achievement.

Sinks:

- deterministic cosmetic unlock;
- side-grade trait unlock;
- background/audio theme;
- challenge slot.

## 3. Reward curve

The reward curve must favor reaching a new stage, while preventing very long low-risk farming from dominating.

```text
reward =
  stageReward
  + logarithmicMassReward
  + cappedSkillReward
  + firstTimeBonuses
```

Use the formula in `04_CORE_MECHANICS.md` as the initial implementation.

## 4. Unlock tiers

| Tier | Example cost | Purpose |
|---|---:|---|
| Common | 4–8 | early feedback |
| Uncommon | 12–20 | visible identity |
| Rare | 30–50 | substantial style |
| Mastery | achievement + 40 | proof of skill |

Costs are initial ranges, not final economy values.

## 5. Launch unlock catalog

### Core colors

- Pearl
- Dawn
- Tide
- Ember
- Violet
- Moss

### Halo styles

- Soft
- Ringed
- Pulsing
- Prismatic

### Body topology

- Round
- Petal
- Comet
- Orbiting Seeds

### Backgrounds

- Empty Night
- Deep Water
- Moon Lake
- Star Nursery
- Quiet Galaxy

### Audio motifs

- Glass
- Water
- Bell
- Breath

## 6. Trait loadout

One trait may be equipped at run start in 1.0. Traits are side-grades.

Each trait definition contains:

```ts
interface TraitDefinition {
  id: string;
  titleKey: string;
  descriptionKey: string;
  modifiers: readonly Modifier[];
  unlockCost: number;
  incompatibleWith: readonly string[];
}
```

Modifiers must be consumed through a centralized stat resolver. Systems may not branch on trait IDs.

## 7. Achievements

Initial set:

- reach stage 3 without damage;
- reclaim 80% of one damage event;
- perform five near misses in one stage;
- settle at stage 5;
- consume a former apex threat;
- complete a Calm run without settlement until stage 4;
- complete an Abyss settlement;
- discover all launch stages.

Achievements are local-only in 1.0.

## 8. Balance simulation

Create a headless simulation harness. It does not need to imitate human strategy perfectly; it should compare relative changes.

Track:

- time to first expansion;
- stage per minute;
- damage frequency;
- settlement reward per minute;
- currency time-to-unlock;
- entity composition;
- trait pick performance.

A balance PR must include before/after simulation output and manual playtest notes.

## 9. Anti-exploit considerations

Because the initial product is local-only, economy integrity is not a security boundary. Still:

- validate finite numbers;
- cap reward inputs;
- ignore negative or impossible timestamps;
- checksum save payload for corruption detection;
- do not obfuscate or claim tamper-proof storage.

## 10. Content update compatibility

Content is keyed by stable IDs. Removing content requires migration:

- equipped removed item → default fallback;
- ownership retained in `legacyUnlocks` for audit;
- currency is not silently deducted;
- save remains loadable.
