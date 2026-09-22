export const getCoinTotal = level => level.coins.length + (level.enemies ?? []).reduce((sum, enemy) => sum + (enemy.coinDrop ?? 1), 0);
export const worlds = [
  { id: 'meadow', name: 'Meadow Lands', subtitle: 'Where the journey begins', available: true, levelIds: Array.from({ length: 8 }, (_, i) => `1-${i + 1}`) },
  { id: 'woods', name: 'Whispering Woods', subtitle: 'Secrets beneath the canopy', levelIds: ['2-1'] },
  { id: 'ruins', name: 'Sunken Ruins', subtitle: 'Echoes of a lost kingdom', levelIds: [] },
  { id: 'peaks', name: 'Crimson Peaks', subtitle: 'Beyond the clouds', levelIds: [] },
  { id: 'citadel', name: 'Shadow Citadel', subtitle: 'The last light', levelIds: [] },
];
export const firstLevelId = worlds[0].levelIds[0];
worlds.forEach(world => { world.storyId = `world-${world.id}`; world.bossStoryId = `boss-${world.id}`; });
export const levels = {
  '1-1': {
    id: '1-1', nextLevelId: '1-2', worldName: 'Meadow Lands', name: 'The First Steps', width: 2400, height: 600, killY: 650, spawn: { x: 90, y: 420 },
    background: 'forest', camera: { offsetX: -140, offsetY: 35 },
    ground: [[0, 510, 650, 90], [760, 510, 600, 90], [1460, 510, 940, 90]],
    platforms: [[260, 410, 140, 24], [470, 325, 140, 24], [860, 410, 150, 24], [1130, 335, 150, 24], [1600, 400, 150, 24], [1830, 320, 150, 24]],
    coins: [[300, 372], [365, 372], [525, 287], [690, 400], [920, 372], [1190, 297], [1405, 405], [1885, 282]],
    enemies: [{ type: 'slime', x: 1040, y: 470, min: 1020, max: 1290 }, { type: 'goblin', x: 1900, y: 470, min: 1780, max: 2070 }],
    checkpoints: [{ id: 'riverbank', x: 810, y: 465, spawn: { x: 810, y: 460 } }, { id: 'meadow', x: 1520, y: 465, spawn: { x: 1520, y: 460 } }],
    spikes: [[1690, 490, 72, 20]],
    crates: [{ x: 420, y: 486 }, { x: 2090, y: 486 }],
    exit: { x: 2270, y: 460, width: 42, height: 86, label: 'SANCTUARY' },
  },
};

// Prototype Meadow layouts share terrain; each remains an independent data record.
const meadowNames = ['The First Steps', 'The Riverbend', 'Moss & Memories', 'The Old Sanctuary', 'Bramble Crossing', 'The Emerald Trail', 'Ruins in Bloom', 'Heart of the Meadow'];
for (let i = 0; i < meadowNames.length; i++) {
  const id = `1-${i + 1}`;
  if (i > 0) {
    const base = structuredClone(levels['1-1']);
    const rise = i % 3 * 12;
    levels[id] = { ...base, id, name: meadowNames[i],
      platforms: base.platforms.map(([x, y, w, h]) => [x, y - rise, w, h]),
      coins: base.coins.map(([x, y]) => [x, y - rise]),
      enemies: base.enemies.map((enemy, n) => ({ ...enemy, type: (i + n) % 2 ? 'goblin' : 'slime' })),
      crates: [{ x: 420 + i * 8, y: 486 }, { x: 2110 + i * 5, y: 486 }],
    };
  }
  levels[id].worldId = 'meadow';
  levels[id].nextLevelId = i < 7 ? `1-${i + 2}` : null;
}

levels['1-8'] = {
  ...levels['1-8'], name: 'Stone Guardian', width: 960, spawn: { x: 120, y: 440 },
  camera: { offsetX: 0, offsetY: 0 }, ground: [[0, 510, 960, 90]],
  platforms: [], coins: [[180, 400], [260, 350], [760, 350], [840, 400]],
  enemies: [], checkpoints: [], spikes: [], crates: [],
  isBoss: true, boss: { type: 'stone-guardian', x: 700, y: 440 },
  relicId: 'meadow-relic', relicName: 'Relic of the Meadow', nextLevelId: '2-1',
  exit: { x: 900, y: 460, width: 42, height: 86, label: 'WOODS' },
};
// World 2 entry uses prototype terrain until its bespoke levels are authored.
levels['2-1'] = { ...structuredClone(levels['1-1']), id: '2-1', worldId: 'woods',
  worldName: 'Whispering Woods', name: 'Beneath the Canopy', nextLevelId: null };
export const getEnemyTotal = level => level.enemies.length + (level.boss ? 1 : 0);
