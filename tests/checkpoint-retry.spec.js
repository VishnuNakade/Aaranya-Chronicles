import { test, expect } from '@playwright/test';

test('retry preserves checkpoint and defeated enemies but refills healing boxes', async ({ page }) => {
  await page.goto('/#/play/1-1');
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.player?.body?.blocked.down);
  await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    s.player.respawn(1520, 465);
  });
  await page.waitForFunction(() => window.__AARANYA_GAME__.scene.getScene('GameScene').checkpointIndex === 1);
  await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    s.enemies.getChildren().find(e => e.patrol.type === 'enemy1').die();
    const box = s.objects.crates.getChildren()[0];
    s.healing.collect(box.itemId); box.destroy();
    s.player.health = 2; s.healing.use(s.player);
    s.finish(false);
  });
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await page.waitForFunction(() => !window.__AARANYA_GAME__.scene.getScene('GameScene').finished);
  const state = await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    return { x: s.player.x, checkpoint: s.checkpointIndex, defeated: s.enemiesDefeated,
      enemies: s.enemies.getLength(), totalEnemies: s.level.enemies.length,
      boxes: s.objects.crates.getLength(), totalBoxes: s.level.crates.length, charges: s.healing.charges, hp: s.player.health };
  });
  expect(state.x).toBeCloseTo(1520, 0); expect(state.checkpoint).toBe(1);
  expect(state.defeated).toBe(1); expect(state.enemies).toBe(state.totalEnemies - 1);
  expect(state.boxes).toBe(state.totalBoxes); expect(state.charges).toBe(0); expect(state.hp).toBe(3);
});
