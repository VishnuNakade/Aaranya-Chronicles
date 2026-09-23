import { test, expect } from '@playwright/test';
import { levels } from '../src/game/data/levels';

test('longer Meadow routes retain safe checkpoints and grounded scenery', () => {
  expect(levels['1-1'].width).toBe(4260);
  expect(levels['1-7'].width).toBeGreaterThan(levels['1-1'].width);
  expect(levels['1-8'].width).toBe(960);
  for (const level of Object.values(levels).filter(l => l.worldId === 'meadow')) {
    for (const tree of level.environment.decorations.filter(d => d.asset === 'tree')) {
      expect(level.ground.some(([x, y, w]) => tree.x >= x && tree.x + tree.width <= x + w && tree.y + tree.height >= y)).toBe(true);
      expect(level.platforms.some(([x, , w]) => tree.x < x + w && tree.x + tree.width > x)).toBe(false);
      const vine = level.environment.decorations.find(d => d.asset === 'vine' && d.x > tree.x && d.x + d.width < tree.x + tree.width);
      expect(vine).toBeTruthy();
      expect(vine.y).toBeGreaterThan(tree.y);
    }
    for (const checkpoint of level.checkpoints) {
      expect(level.ground.some(([x, , w]) => checkpoint.spawn.x > x + 12 && checkpoint.spawn.x < x + w - 12)).toBe(true);
    }
  }
});

test('extended section has a working checkpoint and warned rock drop', async ({ page }) => {
  await page.goto('/#/play/1-1');
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.player?.body);
  await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    const c = s.level.checkpoints[3]; s.player.respawn(c.spawn.x, c.spawn.y);
  });
  await page.waitForFunction(() => window.__AARANYA_GAME__.scene.getScene('GameScene').checkpointIndex === 3);
  await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    const r = s.fallingRocks.rocks[0]; s.player.respawn(r.config.x - 75, 440);
  });
  await page.waitForFunction(() => window.__AARANYA_GAME__.scene.getScene('GameScene').fallingRocks.rocks[0].state === 'warning');
  expect(await page.evaluate(() => {
    const r = window.__AARANYA_GAME__.scene.getScene('GameScene').fallingRocks.rocks[0];
    return r.warning.visible && !r.body.body.enable && !r.art.visible;
  })).toBe(true);
  await page.waitForFunction(() => window.__AARANYA_GAME__.scene.getScene('GameScene').fallingRocks.rocks[0].state === 'fall');
  expect(await page.evaluate(() => window.__AARANYA_GAME__.scene.getScene('GameScene').fallingRocks.rocks[0].art.visible)).toBe(true);
});
