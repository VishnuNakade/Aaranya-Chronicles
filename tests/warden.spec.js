import { test, expect } from '@playwright/test';

test('Forest Warden uses all supplied frames and guards the final gate', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/#/play/1-1');
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.enemies);
  const info = await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    const w = s.enemies.getChildren().find(e => e.patrol.type === 'forestWarden');
    s.player.respawn(s.level.exit.x, 480); s.player.invincibleUntil = 1e9;
    return { hp: w.health, x: w.x, width: s.level.width, frames: s.textures.get('warden').getFrameNames().length };
  });
  expect(info.hp).toBe(6); expect(info.frames).toBe(60);
  expect(info.width - info.x).toBe(210);
  await page.waitForTimeout(500);
  await expect(page.getByRole('heading', { name: 'LEVEL COMPLETE' })).not.toBeVisible();
  await page.screenshot({ path: 'test-results/warden.png' });
  await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    const w = s.enemies.getChildren().find(e => e.patrol.type === 'forestWarden');
    w.state = 'recover'; w.takeDamage(6, w.x - 20);
  });
  await page.waitForTimeout(2000);
  await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene'); s.player.respawn(s.level.exit.x, 480);
  });
  await expect(page.getByRole('heading', { name: 'LEVEL COMPLETE' })).toBeVisible();
  expect(errors).toEqual([]);
});
