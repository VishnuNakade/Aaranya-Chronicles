# Meadow Lands Environment

## Boundaries

All Meadow levels default to `mode: 'assets'`, rendering the supplied independent PNG layers and terrain. Missing files still use plain placeholders. Original PNGs are unchanged; padded terrain is aligned using source-frame metadata. React UI, player mechanics, HUD, coins, controls, checkpoints, boss and pause behavior are preserved. World 2 keeps its previous prototype environment.

`levels.js` remains the level catalog. `levelEnvironment.js` adapts each existing Meadow layout into an independent environment record after prototype layouts are generated. The adapter preserves all existing platform positions and level lengths. Define final environment overrides after that initialization loop. Do not change `GameScene` to author a level.

## Gameplay Geometry

- `width`, `height`, `killY`, `spawn`, `camera`: level boundaries and spawn.
- `ground`, `platforms`: `[x, y, width, height]` collision rectangles, top-left coordinates. `buildLevel.js` creates invisible Arcade zones.
- `coins`, `enemies`, `crates`, `checkpoints`, `exit`: existing gameplay data, unchanged.
- `environment.hazards`: `spikes` creates static damage rectangles; `pit` documents a gap in `ground` (it does not subtract geometry). Falling below `killY` uses the existing damage/respawn flow.
- `fallingRock`: opt-in, reusable hazard with a warning, downward motion and reset cooldown. No existing level enables it. Its Arcade zone is separate from its art. Whole-scene pause freezes it.

## Visual Configuration

All 19 supplied environment PNGs now have World 1 usages. `meadowDecorations.js` places trees, bushes, flowers, rocks, vines, ruins and stone beside existing ground segments. These are non-colliding, rendered behind actors, and do not bridge pits. Boss levels additionally preload `fallingRock` for the Guardian's existing 30-by-30 projectile; attack timings and damage are unchanged. The screenshot reference is excluded from the asset import glob. The three optional props PNGs are still absent and their existing visuals remain unchanged.

```js
const level = levels['1-1'];
level.environment.mode = 'assets'; // Default; 'placeholder' is available for geometry debugging
level.environment.layers = [
  { asset: 'sky', factor: 0, depth: -50, y: 0, height: 600 },
  { asset: 'mountains', factor: 0.12, depth: -40, y: 100, height: 500 },
  { asset: 'temple', factor: 0.25, depth: -30, y: 100, height: 500 },
  { asset: 'forest', factor: 0.45, depth: -20, y: 0, height: 600 },
  { asset: 'foreground', factor: 0.8, depth: -10, y: 450, height: 150 },
];
level.environment.decorations = [
  { asset: 'tree', x: 100, y: 220, width: 220, height: 290, depth: -2 },
  { asset: 'bush', x: 330, y: 480, width: 70, height: 30, flipX: true },
];
// Artwork and collision can intentionally use different bounds.
level.environment.terrain[0].material = 'grass'; // grass | stone | floating
level.environment.hazards.push({
  type: 'fallingRock', asset: 'fallingRock', x: 1200, y: 150, size: 28,
  triggerRadius: 160, warningMs: 900, speed: 250, cooldownMs: 2500, impactY: 500,
});
```

Visual placements use top-left coordinates, except falling rock spawn uses its body center. Dimensions are game units, not PNG pixels. An optional `crop` array specifies PNG source pixels. `parts` allows independent overrides for a terrain material's fill/top/left/right pieces. Decorative `props` are non-interactive; existing interactive crate/flag/gate rendering is deliberately preserved until those assets and their alignment are supplied.

Layers default to `world1.js` if omitted; `layers: []` disables them. Horizontal parallax uses Phaser scroll factors (0 fixed, 1 world speed), with vertical factor 0 by default; set `factorY` explicitly if needed. Width defaults to viewport width plus level travel multiplied by the layer factor. This avoids allocating one background sprite per world tile. Each layer is a single image, not the composite reference. Negative depths keep layers behind actors; place foreground carefully before opting into positive depth.

Missing PNGs or failed texture loads use plain rectangle placeholders for terrain/objects. Missing optional parallax layers are omitted; a flat camera background remains. No texture is fabricated. Terrain visuals never add physics bodies. PNG edits, dimensions, crops or decorative placements cannot alter jump distances or collision surfaces.

## Files

- `src/game/environment/world1.js`: asset manifest, shared layers and material palette.
- `assets.js`: Vite URLs, namespaced texture keys, referenced-only Phaser preload.
- `levelEnvironment.js`: migration adapter from existing Meadow geometry.
- `EnvironmentRenderer.js`: visual-only background, terrain and placement builder.
- `FallingRocks.js`: optional reusable hazard lifecycle.
- `src/assets/world1/README.md`: PNG filename and export guide.
- `tests/environment.spec.js`: independent records, asset loading, placeholder fallback, physics separation and pause coverage.

Restart/navigation relies on Phaser scene teardown for images, zones and colliders. There are no global update callbacks or DOM listeners in this environment system.
