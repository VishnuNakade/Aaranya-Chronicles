# Blazefang

42 PNGs are packed without modifying the originals.
The numeric filename suffix controls ordering.

`death` frames 1-8 are the death sequence. Misplaced jump frames 9-16
are excluded from the atlas and animations; their original files are preserved.
Only the `jump` folder supplies rising, falling, and grounded landing frames.

Rebuild the atlas after replacing source PNGs:

```sh
node scripts/pack-warden.mjs --blazefang
```

Output: `public/assets/blazefang/blazefang.png` and `blazefang.json`.
Animation timing lives in `src/game/art/blazefangAnimations.js`.
Combat tuning lives in `src/game/entities/Blazefang.js`.
Arena, checkpoint, healing box and platforms live in `src/game/data/riverbend.js`.
