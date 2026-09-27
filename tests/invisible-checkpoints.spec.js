import { test, expect } from '@playwright/test';

test('invisible checkpoints still activate and respawn Veer', async ({ page }) => {
  await page.goto('/#/play/1-1');
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.player?.hasLanded);
  const expected = await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    const checkpoint = s.objects.checkpoints.getChildren()[0];
    s.enemies.clear(true, true);
    s.player.respawn(checkpoint.x, checkpoint.y);
    return { spawn: checkpoint.getData('config').spawn, flag: Boolean(checkpoint.getData('flag')), type: checkpoint.type };
  });
  expect(expected.flag).toBe(false); expect(expected.type).toBe('Zone');
  await page.waitForFunction(() => window.__AARANYA_GAME__.scene.getScene('GameScene').checkpointIndex === 0);
  await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene'); s.player.respawn(700, s.killY + 1);
  });
  await page.waitForFunction(x => Math.abs(window.__AARANYA_GAME__.scene.getScene('GameScene').player.x - x) < 2, expected.spawn.x);
  expect(await page.evaluate(() => window.__AARANYA_GAME__.scene.getScene('GameScene').respawnPoint)).toEqual(expected.spawn);
});
