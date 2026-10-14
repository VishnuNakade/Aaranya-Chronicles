import { test, expect } from '@playwright/test';

test('Ranga story pauses the arena and Next resumes without repeating', async ({ page }) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/#/play/1-1');
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.player);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    s.player.body.reset(s.level.encounterStory.triggerX + 5, 460);
  });
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('Ranga');
  await expect.poll(() => page.locator('.encounter-art').evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
  const snapshot = () => page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    return { time: s.elapsedMs, x: s.player.x, enemy: s.enemies.getChildren()[0].x };
  });
  const before = await snapshot();
  await page.waitForTimeout(250);
  expect(await snapshot()).toEqual(before);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();
  await page.screenshot({ path: 'test-results/ranga-story-mobile.png' });
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect.poll(async () => (await snapshot()).time).toBeGreaterThan(before.time);
  await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    s.player.body.reset(s.level.encounterStory.triggerX + 5, 460);
  });
  await page.waitForTimeout(150);
  await expect(dialog).toHaveCount(0);
});
