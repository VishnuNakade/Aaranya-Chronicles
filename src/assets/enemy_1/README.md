# Enemy 1

All 50 supplied PNGs are used in numeric suffix order (-1, -2, ...).
Sources are preserved. Runtime atlas: `public/assets/enemy1/` (1280 x 896).
Rebuild with `node scripts/pack-enemy.mjs` after replacing source PNGs.

Animation counts: idle 6, run 9, jump 8, fall 7, attack 8, hurt 4, death 8.
Animation timing and registration: `src/game/art/enemyAnimationConfig.js`.
Combat tuning: `src/game/combat/enemyCombat.js`.
AI: `Raider.js`; platform routing: `EnemyNavigator.js`.

Three life points, 245 movement speed, -510 / -475 jump velocities match Veer.
Two-slash sequence: warning, swing, short recovery; warning, swing, long recovery.
Attack frames 4-6 cause one hit per swing. No contact damage.
Frontal attacks during windup/swing damage posture instead of life.
Recovery and rear attacks damage life. Broken posture stuns for 900 ms.
Both actors recover posture after two seconds without posture damage.

First Steps has four enemies in two encounters; placements live in levels.js.
Other authored enemies use the same class; Stone Guardian stays unchanged.
