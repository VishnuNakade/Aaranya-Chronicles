# Aaranya Chronicles

A React + Vite + JavaScript + Phaser 3 foundation for a mobile-friendly 2D platformer. This is a single-level prototype, not the full game. Later worlds and levels are intentionally unavailable.

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
- Jump: W, up arrow, or Space. Includes a short jump buffer and coyote time.
- Attack: J. Face the enemy and attack at close range.
- Pause: Escape or the pause button.
- Touch: hold the movement buttons; tap jump or attack. Multiple simultaneous touches are supported.
- Reach the glowing sanctuary at the right end to complete the level. Collect up to eight coins. Enemies and falls cost a heart; three lost hearts end the attempt.

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
| `src/game/entities/Player.js` | Player physics body, facing and movement. |
| `src/game/entities/Enemy.js` | Enemy body and bounded patrol. |
| `src/game/data/levels.js` | Declarative spawn, platforms, enemy patrols, coins and exit. |
| `src/data/worlds.js` | React world metadata, independent of the physics engine. |
| `src/styles.css` | Responsive screen layout and touch controls. |
| `public/assets/forest.png` | Locally bundled generated forest illustration. |
| `tests/game.spec.js`, `playwright.config.js` | Browser checks for routes, persistence, movement, combat, results, touch and cleanup. |

React sends `input`, `pause` and `restart` events. Phaser sends `ready`, `hud`, `paused` and `result`. Physics and the completion decision belong to Phaser; React persists successful results and displays the interface. Future scenes should use this same boundary. Development builds expose `window.__AARANYA_GAME__` for debugging and browser testing; production does not.

The integration follows the lifecycle approach in the [official Phaser React template](https://github.com/phaserjs/template-react). Hash routing supports static hosting without server route rewrites. Google Fonts are optional; local serif and sans-serif fallbacks are included.

## Art

`public/assets/forest.png` was generated with the built-in imagegen tool. Prompt: "Use case: illustration-story. Asset type: wide 2D fantasy platformer game menu background, 1536x1024. Create a beautiful richly painted forest valley for Aaranya Chronicles: ancient moss-covered Indian-inspired stone temple ruins, enormous trees framing edges, turquoise waterfalls and river, distant sunlit mountains, warm morning rays, small young adventurer with black tousled hair and crimson scarf standing on rocky ledge in right third looking into valley. Hand-painted detailed storybook game art, lush emerald foliage, gold light, atmospheric depth, inviting adventure. Left third darker foliage with clear quiet space for menu typography overlay. No text, letters, UI, frames, panels or watermark."

The supplied reference was treated as visual inspiration, not as instructions. Player and enemy textures are intentionally simple procedural prototype art; animation sheets, bosses, inventory, additional levels and full music are future work.
