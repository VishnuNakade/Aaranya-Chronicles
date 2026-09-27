import { test, expect } from '@playwright/test';
import { levels } from '../src/game/data/levels';
import { cratePlacement } from '../src/game/items/cratePlacement';

test('health crates rest on supporting ground and platforms', () => {
  for (const level of Object.values(levels)) {
    for (const config of level.crates) {
      const placed = cratePlacement(level, config);
      expect([...level.ground, ...level.platforms].some(([x, y, w]) =>
        placed.y + 24 === y && placed.x - 24 >= x && placed.x + 24 <= x + w)).toBe(true);
    }
  }
  expect(levels['1-1'].crates.filter(c => c.platform != null)).toHaveLength(2);
});

test('platform crate artwork stays attached to its support', async ({ page }) => {
  await page.goto('/#/play/1-1');
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.player?.body);
  const placement = await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    const config = s.level.crates.find(c => c.platform != null);
    const crate = s.objects.crates.getChildren().find(c => c.x === config.x);
    const surfaceY = s.level.platforms[config.platform][1];
    s.player.respawn(crate.x - 65, surfaceY - 20);
    s.cameras.main.stopFollow(); s.cameras.main.setScroll(crate.x - 480, 0);
    return { bottom: crate.body.bottom, artY: crate.art.y, surfaceY, idleFrame: crate.art.frame.name };
  });
  expect(placement.bottom).toBe(placement.surfaceY);
  expect(placement.idleFrame).toBe('box-1');
  expect(placement.artY).toBe(placement.surfaceY + 4);
  await page.screenshot({ path: 'test-results/platform-crate.png' });
});
