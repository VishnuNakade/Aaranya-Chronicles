import { test, expect } from '@playwright/test';

test('every visible death frame rests on the same ground as its physics body', async ({ page }) => {
  await page.goto('/#/play/1-1');
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.player?.hasLanded);
  const offsets = await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    const e = s.enemies.getChildren()[0];
    s.physics.pause();
    e.update = () => {};
    e.body.reset(1040, 490); e.body.updateFromGameObject();
    const texture = s.textures.get('enemy1');
    const canvas = document.createElement('canvas'); canvas.width = 160; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    return Array.from({ length: 8 }, (_, i) => {
      const f = texture.get(`enemy1-death-${i}`);
      ctx.clearRect(0, 0, 160, 128);
      ctx.drawImage(texture.getSourceImage(), f.cutX, f.cutY, 160, 128, 0, 0, 160, 128);
      const data = ctx.getImageData(0, 0, 160, 128).data;
      let bottom = 0;
      for (let y = 0; y < 128; y++) for (let x = 0; x < 160; x++) {
        if (data[(y * 160 + x) * 4 + 3] >= 128) bottom = y + 1;
      }
      return e.body.bottom - (e.y - e.displayOriginY + bottom);
    });
  });
  for (const gap of offsets) expect(Math.abs(gap)).toBeLessThanOrEqual(1);
  await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    const e = s.enemies.getChildren()[0];
    e.anims.stop(); e.setFrame('enemy1-death-7');
    s.cameras.main.stopFollow(); s.cameras.main.centerOn(e.x, e.y - 150);
  });
  await page.waitForTimeout(100);
  await page.screenshot({ path: 'test-results/enemy-death-grounded.png' });
});
