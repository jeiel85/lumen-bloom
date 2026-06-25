# UI, Accessibility, Audio, and Art Direction

## 1. Visual identity

The reference point is not biological cells or a virus. Lumen Bloom uses natural light and water-to-cosmos transformation.

### Design words

- luminous;
- spacious;
- soft;
- tidal;
- contemplative;
- precise.

### Avoid

- copied black-and-white minimal arrangement;
- virus/cell terminology;
- identical HUD placement;
- identical circular shop capsule;
- matching palette sequences;
- copied creature silhouettes;
- copied procedural melodies.

## 2. Screen map

```text
Boot
 → Main
    ├─ Start
    ├─ Collection
    ├─ Traits
    ├─ Settings
    └─ Credits
 → Gameplay
    ├─ Pause
    ├─ Settlement confirm
    └─ Results
 → Unlock detail
 → Main
```

## 3. Main screen

- Animated light seed centered slightly above the vertical midpoint.
- Primary Start button is explicit text, not only the seed.
- Collection and Settings use labeled controls.
- Current equipped appearance is visible.
- Version and offline status appear discreetly.

## 4. HUD

Default HUD:

- upper-left: current stage and mass label;
- upper-right: pause;
- bottom-center: settlement becomes available after stage 1;
- transient center: expansion title;
- optional edge threat cues.

HUD may be hidden in minimalist mode.

## 5. Readability

- Minimum interactive target: 44 × 44 CSS px.
- Text contrast target: WCAG AA where applicable.
- Do not encode edible/threat status by color alone.
- Threats use shape rhythm and pulse.
- UI respects safe-area insets.
- Support 100–200% text scaling without clipping.
- Landscape and portrait both supported; portrait is primary on mobile.

## 6. Accessibility settings

- reduced motion;
- camera shake off;
- high contrast relationship outlines;
- color vision presets;
- master/music/effects volume;
- mute when unfocused;
- touch control style;
- touch sensitivity;
- keyboard remapping;
- persistent tutorial hints;
- large HUD;
- photosensitivity-safe effects.

No effect may strobe more than 3 times per second at high contrast.

## 7. Audio architecture

Use a dedicated `AudioManager` with buses:

- master;
- music;
- effects;
- ambience;
- UI.

Audio starts after a user gesture. Resume suspended context on interaction.

## 8. Procedural sound strategy

1.0 may use procedural sound plus original rendered assets.

### Absorption sound

- pitch scales softly with absorbed ratio;
- frequent small motes use a short low-volume transient;
- creature absorption adds body and tail;
- rate limiting prevents harsh clusters.

### Expansion sound

- duck ambience;
- upward spectral sweep;
- stage-specific harmonic arrival;
- no copied note sequence.

### Damage sound

- low transient;
- short filtered noise;
- avoid alarm-like harshness in Calm mode.

## 9. Music director

Music is stem-based:

- base drone;
- pulse;
- shimmer;
- low foundation;
- stage texture.

Stages fade stems rather than starting a new track abruptly. Use deterministic generative variation only for ornament; musical identity remains authored.

## 10. Art production

### Asset types

- texture gradients;
- soft masks;
- optional noise tiles;
- UI icons;
- app icon;
- store screenshots;
- stage promotional key art.

Most in-game geometry should be procedural to preserve resolution independence.

### Originality checklist

Every asset must have:

- source/author record;
- license record;
- editable source where applicable;
- export settings;
- explicit confirmation that it was not traced from the reference.

## 11. Responsive behavior

### Portrait

- full playfield;
- settlement at bottom safe area;
- HUD compact;
- touch origin follows initial touch.

### Landscape

- HUD moves toward corners;
- collection menus use two columns;
- visual field expands without changing spawn fairness.

Resize must preserve world state and recompute camera target from the shorter side.

## 12. Localization

1.0 target: Korean and English.

- All UI strings use keys.
- No concatenated grammar-dependent strings.
- Numeric formatting uses `Intl.NumberFormat`.
- Stage names have localized display text but stable internal IDs.
