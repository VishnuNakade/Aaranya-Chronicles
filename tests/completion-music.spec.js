import { test, expect } from '@playwright/test';

test('completion plays menu music and replay stops it', async ({ page }) => {
  test.setTimeout(90000);
  await page.addInitScript(() => {
    const NativeAudio = window.Audio;
    window.__testAudio = [];
    window.Audio = function (...args) {
      const audio = new NativeAudio(...args);
      window.__testAudio.push(audio);
      return audio;
    };
  });
  await page.goto('/#/play/1-1');
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.player);
  await page.locator('canvas').click();
  await page.evaluate(() => window.__AARANYA_GAME__.scene.getScene('GameScene').finish(true));
  await expect(page.getByRole('heading', { name: 'LEVEL COMPLETE' })).toBeVisible();
  await page.waitForFunction(() => window.__testAudio.some(audio => audio.src.includes('game-bg') && !audio.paused && audio.loop && audio.volume === 1));
  await page.getByRole('button', { name: 'Replay' }).click();
  await expect(page.getByRole('heading', { name: 'LEVEL COMPLETE' })).toBeHidden();
  expect(await page.evaluate(() => window.__testAudio.every(audio => audio.paused))).toBe(true);
});
