import { test, expect } from '@playwright/test';

for (const position of [{ name: 'ground', x: 1040, y: 490 }, { name: 'tile', x: 920, y: 390 }, { name: 'air', x: 1040, y: 150 }]) {
  test(`enemy fatal hit on ${position.name} waits for grounded death`, async ({ page }) => {
    await page.goto('/#/play/1-1');
    await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.player?.hasLanded);
    const initial = await page.evaluate(position => {
      const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
      const e = s.enemies.getChildren()[0];
      e.body.reset(position.x, position.y); e.body.updateFromGameObject();
      e.state = 'patrol'; e.health = 1; e.invincibleUntil = 0;
      window.enemyDeathStarted = false; window.enemyDeathFloated = false;
      e.on('animationstart', anim => {
        if (anim.key === 'enemy1-death') {
          window.enemyDeathStarted = true;
          window.enemyDeathFloated = !e.body.blocked.down || e.body.velocity.y !== 0;
        }
      });
      e.takeDamage(1, e.x - 50);
      return { enabled: e.body.enable, vy: e.body.velocity.y };
    }, position);
    expect(initial.enabled).toBe(true); expect(initial.vy).toBeGreaterThanOrEqual(0);
    await page.waitForFunction(() => window.enemyDeathStarted);
    expect(await page.evaluate(() => window.enemyDeathFloated)).toBe(false);
    await page.waitForFunction(() => window.__AARANYA_GAME__.scene.getScene('GameScene').enemies.getLength() === 3);
  });
}
