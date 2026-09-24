# Veer Animation Sources

All 55 supplied PNGs are preserved unchanged. Numeric filename suffixes `(1)`, `(2)`, etc. define the sequence; timestamp text does not determine ordering.

| Folder | Frames | Playback |
| --- | --- | --- |
| idle | 7 | 4-second loop; normal poses held, frame 4 blink lasts 100 ms |
| run | 8 | Loop, 14 FPS |
| jump | 7 | Frames 1-5: 250 ms ascent/double jump; frames 6-7: 120 ms grounded landing |
| fall | 7 | 350 ms descent, holds last frame |
| attack | 9 | 250 ms; damage only on frames 3-6 |
| hurt | 10 | 220 ms |
| death | 7 | 450 ms |

`src/game/art/veerAnimationConfig.js` owns durations, frame counts, anchors, body alignment and active sword frames. `veerAnimations.js` owns preload and Phaser animation registration. Movement, jump strength, health, knockback, damage, attack reach and cooldown remain in `Player.js` with their previous values. Only sword activation is gated by the displayed swing frames. Player-facing left uses `flipX`; no duplicate left-facing assets are required.

The renderer uses fixed 160x128 transparent atlas cells with consistent foot anchors. The unchanged 24x42 body occupies world coordinates `(player.x - 12, player.y - 22)` regardless of animation frame. Changing the sprite canvas must not change those gameplay bounds. Source images are proportionally scaled, not stretched; per-frame attack anchors compensate for differing source composition. The supplied sword arcs replace the old additional procedural slash during gameplay.

## Repacking

Idle frames use per-frame source-pixel registration landmarks (`headY`, `footY`, `rootX`) rather than canvas dimensions. All seven are uniformly scaled to an 82-pixel head-to-sole height with the boot midpoint pinned to the same foot anchor. This corrects source padding/centering jitter without changing originals, animation order, or gameplay physics. Recalibrate these landmarks when replacing idle source artwork.

After updating original PNGs, run from the project root:

```powershell
node scripts/pack-veer.mjs
```

The script validates every sequence, then uses the installed Playwright/Edge browser's canvas to pack the original images. It writes `public/assets/veer/veer.png` and `veer.json`. These generated assets are included with the project; normal dev/build does not need Edge or a repack. Originals are never overwritten. Update the configuration's frame counts when adding/removing frames.

Gameplay loads only the compact atlas, not 55 full-resolution originals. All frames are registered, but interrupting an animation with another action can naturally end playback early. `tests/veer-animation.spec.js` verifies sequence order, atlas completeness, body bounds, attack frame timing, both facing directions and desktop/mobile rendering.
