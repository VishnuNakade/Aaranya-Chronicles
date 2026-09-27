import { test, expect } from '@playwright/test';

test('all six enemy idle frames share the physics foot baseline', async ({ page }) => {
  await page.goto('/#/play/1-1');
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.player?.hasLanded);
  const feet = await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    const texture = s.textures.get('enemy1');
    const canvas = document.createElement('canvas'); canvas.width = 160; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    return Array.from({ length: 6 }, (_, i) => {
      const f = texture.get(`enemy1-idle-${i}`);
      ctx.clearRect(0, 0, 160, 128);
      ctx.drawImage(texture.getSourceImage(), f.cutX, f.cutY, 160, 128, 0, 0, 160, 128);
      const data = ctx.getImageData(0, 0, 160, 128).data;
      let top = 128, bottom = 0, left = 160, right = 0;
      for (let y = 0; y < 128; y++) for (let x = 0; x < 160; x++) {
        if (data[(y * 160 + x) * 4 + 3] >= 128) {
          top = Math.min(top, y); bottom = Math.max(bottom, y + 1);
          if (y >= 100 && y < 108) { left = Math.min(left, x); right = Math.max(right, x + 1); }
        }
      }
      return { bottom, height: bottom - top, center: (left + right) / 2 };
    });
  });
  for (const frame of feet) {
    expect(Math.abs(frame.bottom - 108)).toBeLessThanOrEqual(1);
    expect(Math.abs(frame.height - 80)).toBeLessThanOrEqual(1);
    expect(Math.abs(frame.center - 80)).toBeLessThanOrEqual(1);
  }
});
