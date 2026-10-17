import { test, expect } from '@playwright/test';

test('regular enemy plays green smoke before dropping coins and disappearing', async ({ page }) => {
  test.setTimeout(90000);
  await page.goto('/#/play/1-1');
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.enemies);
  await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    s.setPaused(false);
    const e = s.enemies.getChildren().find(e => e.patrol.type === 'enemy1');
    window.smokeEnemy = e; window.smokeDrops = 0;
    e.body.reset(300, 490); e.body.updateFromGameObject();
    e.on('coin-drop', () => window.smokeDrops++);
    e.state = 'recover'; e.takeDamage(99, e.x - 10);
  });
  await page.waitForFunction(() => window.smokeEnemy.active && window.smokeEnemy.texture.key === 'warden');
  expect(await page.evaluate(() => ({ dead: window.smokeEnemy.dead, drops: window.smokeDrops,
    frames: window.smokeEnemy.anims.currentAnim.frames.length }))).toEqual({ dead: true, drops: 0, frames: 12 });
  await page.waitForFunction(() => !window.smokeEnemy.active);
  expect(await page.evaluate(() => window.smokeDrops)).toBe(1);
});
