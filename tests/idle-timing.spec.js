import { test, expect } from '@playwright/test';

test('idle retains all frames with a short blink every four seconds', async ({ page }) => {
  await page.goto('/#/play/1-1');
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.player?.hasLanded);
  const durations = await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene'); const p = s.player;
    window.blinks = [];
    p.on('animationupdate', (animation, frame) => {
      if (animation.key === 'veer-idle' && frame.index === 4) window.blinks.push(p.elapsed);
    });
    p.play('veer-idle');
    const a = s.anims.get('veer-idle');
    return a.frames.map(frame => frame.duration || a.msPerFrame);
  });
  expect(durations).toEqual([900, 550, 500, 100, 500, 550, 900]);
  await page.waitForFunction(() => window.blinks.length >= 2, null, { timeout: 10000 });
  const interval = await page.evaluate(() => window.blinks[1] - window.blinks[0]);
  expect(interval).toBeGreaterThan(3800);
  expect(interval).toBeLessThan(4400);
});
