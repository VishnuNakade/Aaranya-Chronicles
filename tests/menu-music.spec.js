import { test, expect } from '@playwright/test';
test('menu music persists through map and levels, stops for gameplay and mute', async ({ page }) => {
  await page.addInitScript(() => {
    const OriginalAudio = window.Audio;
    window.menuAudio = [];
    window.Audio = function (...args) {
      const audio = new OriginalAudio(...args);
      if (String(args[0]).includes('game-bg')) window.menuAudio.push(audio);
      return audio;
    };
  });
  await page.goto('/#/');
  await page.mouse.click(300, 100);
  await expect.poll(() => page.evaluate(() => window.menuAudio.some(a => !a.paused))).toBe(true);
  for (const route of ['/worlds', '/worlds/meadow/levels', '/settings']) {
    await page.evaluate(route => { location.hash = route; }, route);
    await expect.poll(() => page.evaluate(() => window.menuAudio.filter(a => !a.paused).length)).toBe(1);
  }
  await page.getByRole('checkbox', { name: 'Sound effects' }).uncheck();
  await expect.poll(() => page.evaluate(() => window.menuAudio.every(a => a.paused))).toBe(true);
  await page.getByRole('checkbox', { name: 'Sound effects' }).check();
  await expect.poll(() => page.evaluate(() => window.menuAudio.filter(a => !a.paused).length)).toBe(1);
  await page.evaluate(() => { location.hash = '/play/1-1'; });
  await expect.poll(() => page.evaluate(() => window.menuAudio.every(a => a.paused))).toBe(true);
  await page.evaluate(() => { location.hash = '/'; });
  await expect.poll(() => page.evaluate(() => window.menuAudio.some(a => !a.paused))).toBe(true);
  expect(await page.evaluate(() => window.menuAudio.at(-1).volume)).toBe(0.5);
});
