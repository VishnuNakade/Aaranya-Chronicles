// A separate riverbank route: staggered platforms, broad combat islands,
// and optional high coin paths above the safe ground route.
export function configureRiverbend(level) {
  const platforms = [
    [180, 430, 170, 24], [430, 350, 160, 24],
    [940, 405, 180, 24], [1200, 315, 170, 24],
    [1660, 425, 160, 24], [1880, 340, 180, 24], [2110, 410, 140, 24],
    [2540, 400, 190, 24], [2810, 310, 160, 24],
    [3320, 420, 180, 24], [3570, 335, 160, 24],
    [4100, 410, 180, 24],
  ];
  const patrol = (x, min, max, encounter) => ({ type: 'enemy1', x, y: 470, min, max, encounter });
  Object.assign(level, {
    width: 4700, spawn: { x: 90, y: 420 }, spikes: [], fallingRocks: [],
    ground: [[0, 510, 690, 90], [840, 510, 620, 90], [1610, 510, 700, 90],
      [2480, 510, 650, 90], [3290, 510, 600, 90], [4060, 510, 640, 90]],
    platforms,
    coins: [
      ...platforms.flatMap(([x, y, width]) => [[x + 40, y - 38], [x + width - 40, y - 38]]),
      [765, 405], [1535, 405], [2395, 400], [3210, 405], [3975, 400], [4530, 460],
    ],
    enemies: [
      patrol(1160, 1030, 1390, 'riverbank'),
      patrol(1850, 1770, 2240, 'crossing-pair'), patrol(2140, 1770, 2240, 'crossing-pair'),
      patrol(2740, 2670, 3050, 'ruins-pair'), patrol(2970, 2670, 3050, 'ruins-pair'),
      patrol(3680, 3480, 3810, 'upper-bank'),
      patrol(4350, 4270, 4590, 'exit-pair'), patrol(4540, 4270, 4590, 'exit-pair'),
    ],
    checkpoints: [
      { id: 'river-entry', x: 900, y: 465, spawn: { x: 900, y: 460 } },
      { id: 'river-ruins', x: 2540, y: 465, spawn: { x: 2540, y: 460 } },
      { id: 'river-homebank', x: 4120, y: 465, spawn: { x: 4120, y: 460 } },
    ],
    crates: [
      { id: 'river-start', x: 540, y: 486 },
      { id: 'river-upper', x: 1280, y: 291, platform: 3 },
      { id: 'river-rest', x: 2520, y: 486 },
      { id: 'river-canopy', x: 3650, y: 311, platform: 10 },
      { id: 'river-final', x: 4170, y: 486 },
    ],
    exit: { x: 4630, y: 460, width: 42, height: 86, label: 'MOSS & MEMORIES' },
  });
}
