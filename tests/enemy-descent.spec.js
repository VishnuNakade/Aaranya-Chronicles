import { test, expect } from '@playwright/test';

for (const x of [880, 1000]) {
  test(`enemy leaves its tile when Veer is below at ${x}`, async ({ page }) => {
    await page.goto('/#/play/1-1');
    await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.player?.hasLanded);
    await page.evaluate(x => {
      const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
      s.enemies.getChildren().slice(1).forEach(e => e.destroy());
      const e = s.enemies.getChildren()[0];
      e.body.reset(920, 390); e.body.updateFromGameObject(); e.aggro = true;
      s.player.respawn(x, 490); s.player.invincibleUntil = Infinity;
      window.descentJumped = false;
      s.events.on('postupdate', () => { if (e.body.velocity.y < -300) window.descentJumped = true; });
    }, x);
    await page.waitForFunction(() => {
      const e = window.__AARANYA_GAME__.scene.getScene('GameScene').enemies.getChildren()[0];
      return e.body.blocked.down && Math.abs(e.body.bottom - 510) < 2;
    }, null, { timeout: 8000 });
    expect(await page.evaluate(() => window.descentJumped)).toBe(false);
  });
}
