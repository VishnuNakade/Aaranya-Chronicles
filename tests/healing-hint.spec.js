import { test, expect } from '@playwright/test';

test('first healing box shows its illustrated hint once', async ({ page }) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/#/play/1-1');
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.player);
  expect(await page.evaluate(() => !!window.__AARANYA_GAME__.scene.getScene('GameScene').healingHint.panel)).toBe(false);
  await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    s.player.body.reset(s.healingHint.first.x - 100, 460);
  });
  await page.waitForFunction(() => window.__AARANYA_GAME__.scene.getScene('GameScene').healingHint.panel?.active);
  await page.screenshot({ path: 'test-results/healing-hint.png' });
  expect(await page.evaluate(() => localStorage.getItem('aaranya:healing-hint:v1'))).toBe('seen');
  await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    s.healingHint.panel.destroy(); s.healingHint.update();
  });
  expect(await page.evaluate(() => window.__AARANYA_GAME__.scene.getScene('GameScene').healingHint.panel.active)).toBe(false);
});
