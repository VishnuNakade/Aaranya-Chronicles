import { test, expect } from '@playwright/test';
for (const [width, height] of [[1047,471], [844,390], [667,320]]) {
  test(`all eight levels fit landscape ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/#/worlds/meadow/levels');
    await expect(page.locator('.level')).toHaveCount(8);
    await page.evaluate(() => document.fonts.ready);
    for (const card of await page.locator('.level').all()) {
      const box = await card.boundingBox();
      expect(box.y + box.height).toBeLessThanOrEqual(height);
      expect(await card.evaluate(el => el.scrollHeight <= el.clientHeight + 1)).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(height);
    await page.screenshot({ path: `test-results/levels-${width}.png` });
  });
}
