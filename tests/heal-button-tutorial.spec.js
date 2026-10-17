import { test, expect } from '@playwright/test';

test('two separate injuries prompt healing each run, but a third does not', async ({ page }) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/#/play/1-1');
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.player);
  await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    s.player.health = s.player.maxHealth - 1;
    s.publish();
  });
  await expect(page.getByText('Tap to heal', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => window.__AARANYA_GAME__.scene.getScene('GameScene').paused)).toBe(true);
  await page.screenshot({ path: 'test-results/heal-button-tutorial.png' });
  await page.getByRole('button', { name: /^Heal \(/ }).click();
  await expect(page.getByText('Tap to heal', { exact: true })).toBeHidden();
  expect(await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    return !s.paused && s.player.health === s.player.maxHealth && s.healing.charges === 1;
  })).toBe(true);
  await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    s.player.health--; s.publish();
  });
  await expect(page.getByText('Tap to heal', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /^Heal \(/ }).click();
  await expect(page.getByText('Tap to heal', { exact: true })).toBeHidden();
  expect(await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    s.player.health--;
    s.healing.charges = 1;
    s.update(0, 16);
    return s.healTutorialCount === 2 && !s.healTutorial && !s.paused;
  })).toBe(true);
  await page.reload();
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.player);
  await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    s.healing.charges = 1; s.player.health--; s.publish();
  });
  await expect(page.getByText('Tap to heal', { exact: true })).toBeVisible();
});
