import { test, expect } from '@playwright/test';

test('Veer hurt frames touch ground and damage does not launch a grounded Veer', async ({ page }) => {
  await page.goto('/#/play/1-1');
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.player?.body.blocked.down);
  const result = await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene'), e = s.player;
    e.takeDamage(e.x - 50);
    const vy = e.body.velocity.y;
    const texture = s.textures.get('veer');
    const c = document.createElement('canvas'); c.width = 160; c.height = 128;
    const ctx = c.getContext('2d');
    const feet = Array.from({ length: 10 }, (_, i) => {
      const f = texture.get(`veer-hurt-${i}`); ctx.clearRect(0, 0, 160, 128);
      ctx.drawImage(texture.getSourceImage(), f.cutX, f.cutY, 160, 128, 0, 0, 160, 128);
      const rgba = ctx.getImageData(0, 0, 160, 128).data;
      for (let y = 127; y >= 0; y--) for (let x = 0; x < 160; x++) if (rgba[(y * 160 + x) * 4 + 3] >= 128) return y + 1;
      return 0;
    });
    return { vy, feet, health: e.health };
  });
  expect(result.vy).toBe(0); expect(result.health).toBe(2);
  for (const foot of result.feet) expect(Math.abs(foot - 108)).toBeLessThanOrEqual(1);
});
