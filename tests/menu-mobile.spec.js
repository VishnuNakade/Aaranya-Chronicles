import { test, expect } from '@playwright/test';

for (const [width, height] of [[1173, 527], [844, 390], [667, 320], [360, 640], [390, 844]]) {
  test(`main menu fits ${width}x${height} without scrolling`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/#/');
    await expect(page.locator('.menu-actions')).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    for (const selector of ['.menu h1', '.menu-actions', '.story-link', '.menu-header']) {
      const box = await page.locator(selector).boundingBox();
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.y + box.height).toBeLessThanOrEqual(height + 1);
      expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
    }
    expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(height + 1);
    if (width > height) {
      const actions = await page.locator('.menu-actions').boundingBox();
      const title = await page.locator('.menu h1').boundingBox();
      const chapter = await page.locator('.menu-header .chapter').boundingBox();
      expect(Math.abs(chapter.x - title.x)).toBeLessThan(1);
      expect(actions.x + actions.width).toBeLessThanOrEqual(width * 0.5);
      expect(actions.y).toBeGreaterThan(title.y + title.height);
      await expect(page.locator('.menu-footer')).toBeHidden();
    }
    await page.screenshot({ path: `test-results/menu-${width}.png` });
  });
}
