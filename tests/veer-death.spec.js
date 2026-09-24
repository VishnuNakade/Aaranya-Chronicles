import { test, expect } from '@playwright/test';

for (const pit of [false, true]) {
  test(`fatal damage ${pit ? 'above a pit' : 'in midair'} does not freeze Veer`, async ({ page }) => {
    await page.goto('/#/play/1-1');
    await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.player?.hasLanded);
    await page.evaluate(pit => {
      const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
      const p = s.player;
      p.respawn(p.x, pit ? s.killY + 1 : 100);
      p.health = 1;
      p.invincibleUntil = 0;
      p.takeDamage();
      window.deathStartY = p.y;
    }, pit);
    if (!pit) {
      await page.waitForFunction(() => {
        const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
        return s.player.y > window.deathStartY + 30 && !s.finished;
      });
    }
    await expect(page.getByRole('heading', { name: 'Game Over' })).toBeVisible();
    const result = await page.evaluate(() => {
      const p = window.__AARANYA_GAME__.scene.getScene('GameScene').player;
      return { grounded: p.body.blocked.down, enabled: p.body.enable, state: p.state };
    });
    expect(result.enabled).toBe(true);
    expect(result.state).toBe('death');
    if (!pit) expect(result.grounded).toBe(true);
  });
}
