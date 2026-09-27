# Healing Items

The atlas uses every provided frame: box 1-6, plant idle, healing animation 1-13.
Run `node scripts/pack-health.mjs` to rebuild `public/assets/health/`.
Timing lives in `src/game/art/healthAnimationConfig.js`.

First sword hit breaks a box; the next attack harvests its revealed plant.
Harvesting plays all 13 green healing frames and banks one charge, even at full life.
The supplied healing button or H restores one life point per charge. Full life,
death, pause and level completion cannot consume charges.
Charges and harvested box IDs persist under localStorage `aaranya:healing:v1`.
Replaying does not duplicate an already harvested plant. Box positions are the
level's `crates` entries; give each added box a stable `id` when possible.

`plant/plant-transparent.png` is an imagegen-edited cutout of the supplied original.
Built-in imagegen prompt: remove the baked white/gray checkerboard to genuine
transparent alpha; preserve the plant, leaves, trunk, roots, rocks, colors and
silhouette without redesign. The original source PNG is preserved.
Healing control artwork: `src/assets/controls/heal.png`.
