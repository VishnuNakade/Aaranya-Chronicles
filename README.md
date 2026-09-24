# Aaranya Chronicles

A React + Vite + JavaScript + Phaser 3 foundation for a mobile-friendly 2D platformer. Meadow Lands has eight playable prototype levels. Levels 1-2 through 1-8 use variations of the original terrain; this is not the full game. Later worlds remain unavailable.

## Run

Requires Node.js 22 or newer.

```sh
npm install
npm run dev
npm run build
npm test
```

On Windows PowerShell with restricted script execution, use `npm.cmd` in place of `npm`. The browser tests use locally installed Microsoft Edge; change `channel` in `playwright.config.js` to use another installed Playwright browser. Vite prints the local and LAN addresses. A phone on the same Wi-Fi can use the LAN address if Windows Firewall permits it.

## Prototype controls

- Move: A/D or left/right arrows.
- Jump: W or up arrow. Press again in midair to double jump; landing restores both jumps. Includes 110 ms of coyote time.
- Attack: Space. Face the enemy and attack at close range. Each swing lasts 250 ms with a 400 ms cooldown.
- Pause: Escape or the pause button.
- Touch: hold the movement buttons; tap jump or attack. Multiple simultaneous touches are supported.
- Reach the glowing sanctuary at the right end to complete the level. Collect eight placed coins and two enemy drops. Enemies and falls cost a heart; three lost hearts end the attempt.

## File guide

| File or directory | Responsibility |
| --- | --- |
| `index.html`, `src/main.jsx` | HTML entry point and React mount with hash routing and the save provider. |
| `vite.config.js`, `package.json` | Vite configuration, dependencies and commands; Phaser is split into its own build chunk. |
| `src/app/App.jsx` | Routes for menu, worlds, levels, settings, story and lazy-loaded gameplay. |
| `src/app/ProgressContext.jsx` | Validated, versioned local save data, best coin count and settings. Storage failure does not stop play. |
| `src/screens/MainMenu.jsx` | Entry screen and journey navigation. |
| `src/screens/WorldMap.jsx` | Five-world overview; only Meadow Lands is available. |
| `src/screens/LevelSelect.jsx` | Playable level selection and saved results. |
| `src/screens/Settings.jsx` | Persistent sound effects and reduced-motion preferences. |
| `src/screens/Story.jsx` | Two-page introductory story. |
| `src/screens/Play.jsx` | React HUD, touch buttons, pause and result dialogs; forwards input without running physics. |
| `src/components/Screen.jsx` | Shared navigation and screen frame. |
| `src/components/PhaserGame.jsx` | Owns one Phaser instance and destroys it on unmount. |
| `src/game/createGame.js` | Renderer, responsive canvas, physics and scene registration. |
| `src/game/bridge.js` | Per-game event bridge with unsubscribe functions. |
| `src/game/scenes/BootScene.js` | Loads the background and creates prototype character/coin textures. |
| `src/game/scenes/GameScene.js` | Platforms, coins, camera, collisions, combat, damage, pause and completion. |
| `src/game/entities/Player.js` | Reusable Arcade Physics player: movement, double jump, directional sword hits, three health points, knockback, 1.3-second invincibility and death. Emits gameplay events without depending on React or level data. |
| `src/game/art/veerAnimations.js` | Procedural animation frames for idle, running, jump, double jump, attack, hurt and death. Replaceable with an illustrated atlas. |
| `src/game/entities/Enemy.js` | Shared health, damage, knockback, patrol, death and drop lifecycle. |
| `src/game/entities/Slime.js`, `Goblin.js`, `createEnemy.js` | Enemy types, goblin AI and extensible factory. |
| `src/game/data/levels.js` | Declarative spawn, platforms, enemy patrols, coins and exit. |
| `src/data/worlds.js` | Compatibility re-export of worlds from the central configuration. |
| `src/styles.css` | Responsive screen layout and touch controls. |
| `public/assets/forest.png` | Locally bundled generated forest illustration. |
| `tests/game.spec.js`, `playwright.config.js` | Browser checks for routes, persistence, movement, combat, results, touch and cleanup. |

React sends `input`, `pause` and `restart` events. Phaser sends `ready`, `hud`, `paused` and `result`. Physics and the completion decision belong to Phaser; React persists successful results and displays the interface. Future scenes should use this same boundary. Development builds expose `window.__AARANYA_GAME__` for debugging and browser testing; production does not.

The integration follows the lifecycle approach in the [official Phaser React template](https://github.com/phaserjs/template-react). Hash routing supports static hosting without server route rewrites. Google Fonts are optional; local serif and sans-serif fallbacks are included.

## Story system

Edit `src/data/stories.js` to change story titles, text, pages and continuation labels. It contains the game introduction, five world entries, five pre-boss scenes and a two-page ending. Each chapter has `name`, `pages: [{ title, text }]`, `next`, and an optional `continueLabel`.

`Story.jsx` renders chapters with previous/next/skip controls. `/story` opens the introduction; `/story/:storyId` opens any chapter, and the chapter selector allows replaying the chronicle, including the ending. Unknown IDs show an unwritten-chapter fallback. `StoryGate.jsx` blocks world or boss entry until the chapter is finished or skipped, before Phaser mounts. `seenStories` persists in the existing save independently of level unlocks and results.

World definitions supply `storyId` and `bossStoryId` in the central level configuration. Entering a world for the first time (including a direct gameplay URL) shows its introduction. Set a level's `isBoss: true` to use its world's pre-boss chapter, or set `bossStoryId` for a specific chapter. Set `endsCampaign: true` on the eventual final encounter to offer The final chapter after victory. No current regular Meadow level is relabeled as a boss or campaign finale; these hooks are ready for those encounters. Story previews never unlock levels.

Gameplay browser tests seed only the world-story seen flags to keep their setup focused; `tests/story.spec.js` uses fresh storage and checks the actual first-entry, boss and ending flows.

## Pause behavior

Pause (button or Escape) opens Resume, Restart, Settings and Exit to Menu. Phaser's entire scene is paused: physics, enemy AI, animations, camera follow, tweens, scene timers and elapsed run time stop. Browser blur or tab hiding also pauses; returning to the tab does not auto-resume. Held inputs are cleared to prevent unwanted movement on resume.

Settings opens inside the pause menu using shared `SettingsControls.jsx`; changes persist and update the existing game without recreating it. Escape backs out of settings before resuming. `RunMenu.jsx` provides both menus, keyboard focus handling and mobile layouts. Death opens Game Over with Retry and Back to World Map. Restart/Retry rebuild the current run while preserving saved best results. Exiting destroys the Phaser instance.

## Completion results

Completing a level opens `LevelComplete.jsx` with stars, coins, enemies defeated, and active gameplay time (pause time is excluded). `src/game/results.js` awards one star for completion, one for at least 80% of all available coins, and one for defeating all enemies. Death does not award stars or unlock anything.

`aaranya:v1` in localStorage now contains a version 2 save with `results[levelId]` and `unlockedLevels`, preserving existing settings and migrating legacy progress. Each record independently stores maximum `stars`, maximum `coins`, and minimum `bestTimeMs`. Faster low-star runs improve time without lowering stars. Replay never erases records. Storage failures are shown on the results screen.

Only 1-1 is unlocked on a fresh save. Completing each level unlocks its configured successor through 1-8; 1-8 has no successor. Next Level opens the newly unlocked stage. Direct URLs cannot open locked levels. World Map shows stars earned out of the world's total. Existing saves keep their progress.

`src/game/data/levels.js` is the single source of truth for world metadata, ordered level IDs, level names, layouts, and `nextLevelId` links. `src/app/progression.js` handles initialization, validated save loading, legacy migration and completion updates as pure functions. `ProgressContext.jsx` handles React state and localStorage. Add a world with ordered `levelIds`, add its level entries, and connect `nextLevelId` to extend the same progression chain without new screen or scene code. Unlocks are reconstructed from reachable completion records when loading, so stale or invalid saves cannot skip levels.

## Enemy behavior

`Enemy.js` owns HP, knockback, a 320 ms damage cooldown, contact damage, health bars, and death/drop lifecycle. `Slime.js` supplies 2 HP and patrol speed. `Goblin.js` supplies 3 HP, a 230-pixel detection range, pursuit, a 280 ms attack windup and 650 ms recovery. Pursuit remains within the configured safe patrol range. Damage interrupts attacks. Enemy timers and animations pause with gameplay.

`createEnemy.js` is the type registry. Add an Enemy subclass there and use `{ type, x, y, min, max, coinDrop }` in level data. Each sword swing deals 1 HP at most once per target. Both World 1 enemies drop one collectible coin after a 400 ms death presentation, bringing the level total to ten coins. Restart resets enemies and drops.

Register `slime-death` or `goblin-death` Phaser animations to use custom death frames; the base class provides a squash/fade fallback. New subclasses can specify their own `deathAnimation` key. Enemy death emits `coin-drop`; the scene creates the pickups, so enemy classes do not depend on the level or React UI.

## Level authoring

World 1 now has a separate visual environment layer. See [World 1 environment configuration](docs/world1-environment.md) and [PNG asset placement](src/assets/world1/README.md). Meadow levels now render the supplied PNG layers and terrain by default; originals remain in `src/assets/world1`, with non-destructive crop metadata for padded terrain. Gameplay collision rectangles remain independent of art.

World 1 Level 1 is Meadow Lands: The First Steps. Two gaps separate three ground sections; optional raised platforms hold coins. Two checkpoint flags remember your latest safe respawn for the current attempt, spikes deal damage, and solid crates can be jumped onto or broken with a sword. Reach the sanctuary gate to win; collecting coins alone never completes the level. Restarting resets checkpoints, crates, coins and health.

Add a new entry to `src/game/data/levels.js`, then link to `/play/<id>`. `GameScene` loads the entry without level-specific branches. `src/game/level/buildLevel.js` builds geometry and interactive objects from it:

- `width`, `height`, `killY`: camera boundaries, horizontal physics limits and fall threshold.
- `spawn`: initial player center; `background`: loaded texture key; `camera`: follow offsets.
- `ground`, `platforms`, `spikes`: arrays of `[left, top, width, height]`. Gaps are spaces between ground sections.
- `coins`: `[x, y]` centers; `enemies`: patrol definitions.
- `crates`: `{ x, y }` centers for 48-pixel breakable solid boxes.
- `checkpoints`: ordered `{ id, x, y, spawn: { x, y } }` entries. Put spawn positions above safe ground.
- `exit`: `{ x, y, width, height, label }`. Its Arcade overlap body is the completion trigger.

The gameplay HUD, level selection, world map, result navigation and progression all consume the central configuration. Available worlds use the generic `/worlds/:worldId/levels` route.

## Art assets

The React world map (`src/screens/WorldMap.jsx` and `WorldMap.css`) displays connected Meadow Lands, Whispering Woods, Sunken Ruins, Crimson Peaks and Shadow Citadel locations. Locks use saved level unlocks. Landscape mobile shows the entire route; portrait supports horizontal map scrolling. SVG is used only for the connecting route; the terrain is a painted bitmap.

`public/assets/world-map.png` was generated with the built-in imagegen tool. Prompt: "Use case: illustration-story. Asset type: 1536x1024 landscape fantasy overworld map background for Aaranya Chronicles game, no text or user interface. Beautiful hand painted top-down isometric illustrated continent surrounded by turquoise sea. Rich fine ink outlines, detailed storybook adventure map, lush green and cool teal with warm red mountain accents, no parchment beige background. Five distinct landmarks positioned carefully: at 14% from left and 60% from top sunny emerald meadows and small golden-roof village; at 33% left 30% top dense dark enchanted woodland; at 52% left 63% top ancient sunken stone temple amid turquoise river wetlands; at 71% left 29% top rugged crimson red alpine peaks; at 87% left 56% top dark stone citadel on grey volcanic mountains. Meandering rivers, waterfalls, tiny bridges, trees, coastal cliffs, farmland. Landscapes connect naturally across a single continent, spacious composition. No letters, labels, numbers, symbols, UI markers, panels, borders or watermark. Bright legible map art with clearly visible terrain and all landmarks."

`public/assets/forest.png` was generated with the built-in imagegen tool. Prompt: "Use case: illustration-story. Asset type: wide 2D fantasy platformer game menu background, 1536x1024. Create a beautiful richly painted forest valley for Aaranya Chronicles: ancient moss-covered Indian-inspired stone temple ruins, enormous trees framing edges, turquoise waterfalls and river, distant sunlit mountains, warm morning rays, small young adventurer with black tousled hair and crimson scarf standing on rocky ledge in right third looking into valley. Hand-painted detailed storybook game art, lush emerald foliage, gold light, atmospheric depth, inviting adventure. Left third darker foliage with clear quiet space for menu typography overlay. No text, letters, UI, frames, panels or watermark."

The supplied reference was treated as visual inspiration, not as instructions. Player, enemy and Guardian textures are intentionally simple procedural prototype art; production animation sheets, later bosses, inventory, additional levels and full music are future work.

## Game Feel

Veer now uses all 55 supplied animation PNGs via a compact generated atlas. See [Veer animation configuration and repacking](src/assets/veer-animation-assets/README.md). Idle/run/jump/fall/attack/hurt/death are registered separately, double jump replays ascent, and sword damage is limited to swing frames 3-6. Original source images and player movement/combat values are preserved.

`src/game/effects/GameEffects.js` owns a reusable pool of 24 spark sprites and one sword arc. Coin pickups and enemy hits reuse these sprites; excess particles are skipped. Effects have short lifetimes, no physics bodies and no continuous emitters. Floating coins use one tween each with synchronized pickup bodies; dropped coins use the same animation. Checkpoints pulse once, and combat shakes are brief and cannot continually restart an active shake.

`BootScene.js` generates the tiny effect textures once. `GameScene.js` connects events to effects and adjusts camera interpolation to elapsed frame time. Scene pause freezes all Phaser effects; restart discards the scene-owned pool. Changing Reduced Motion clears active sparks, slash, shake and checkpoint pulses and stops coin bobbing immediately.

`src/motion.css` adds press feedback, short screen-entry fades and staggered completion stars using only opacity and transforms. These animations respect both the game setting and the browser's reduced-motion preference. React completion effects remain independent of the frozen gameplay scene. No extra animation dependency or full-screen postprocessing is used. `tests/effects.spec.js` covers pool limits, pause, reduced motion and restart cleanup; actual low-end Android frame rates still need device testing.

## Stone Guardian Encounter

Level 1-8 is a dedicated boss arena. `src/game/entities/StoneGuardian.js` owns an Arcade Physics state machine: recovery, windup, attack, phase transition and defeat. Its 18 HP divide into three phases at 12 and 6 HP. Walking strikes commit to a direction, ground smash marks a 170-pixel radius (jump clear), and rocks aim at the player's position captured at windup start. Warnings last 1000/900/800 ms; recovery lasts 1850/1700/1550 ms. Only recovery and phase transitions expose the core. Hits have a 330 ms cooldown. Projectiles clear before recovery and on defeat.

`src/game/art/guardianTextures.js` creates boss, rock and relic textures. `src/components/BossHUD.jsx` and its CSS display a fixed, responsive health bar, phase and attack cue. `GameScene` connects sword damage, the boss encounter and a 2.6-second victory presentation. Whole-scene pause also freezes boss timers, projectiles and the victory sequence.

The central level config supplies `boss`, `relicId`, `relicName` and `nextLevelId`. Defeating the Guardian awards the first relic and unlocks World 2's playable prototype entry, 2-1. `progression.js` persists `bossDefeated` and unique relic IDs; old prototype 1-8 completions cannot unlock World 2 without a boss victory. The gate cannot bypass a living boss. `tests/boss.spec.js` covers armor, sword hits, phases, pause, victory and reward persistence.
