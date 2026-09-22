import { test, expect } from '@playwright/test';

test('connected map adapts to landscape phones and respects world locks', async ({ page }) => {
  await page.goto('/#/worlds');
  await expect(page.getByRole('heading', { name: 'World Map', exact: true })).toBeVisible();
  await expect(page.locator('.atlas-location')).toHaveCount(5);
  await expect(page.locator('.atlas-location:disabled')).toHaveCount(4);
  expect(await page.locator('.atlas-world-name').allTextContents()).toEqual(['Meadow Lands', 'Whispering Woods', 'Sunken Ruins', 'Crimson Peaks', 'Shadow Citadel']);
  await expect(page.getByLabel('0 of 24 stars', { exact: true })).toBeVisible();
  for (const [name, width, height] of [['desktop',1280,900], ['landscape',844,390], ['small-landscape',568,320]]) {
    await page.setViewportSize({ width, height });
    const bounds = await page.locator('.atlas-location').evaluateAll(nodes => nodes.map(node => { const r = node.getBoundingClientRect(); return { x:r.x, y:r.y, right:r.right, bottom:r.bottom }; }));
    for (const r of bounds) { expect(r.x).toBeGreaterThanOrEqual(0); expect(r.right).toBeLessThanOrEqual(width); expect(r.y).toBeGreaterThanOrEqual(0); expect(r.bottom).toBeLessThanOrEqual(height); }
    for (let i = 0; i < bounds.length; i++) for (let j = i + 1; j < bounds.length; j++) {
      const a = bounds[i], b = bounds[j];
      expect(a.right <= b.x || b.right <= a.x || a.bottom <= b.y || b.bottom <= a.y).toBe(true);
    }
    await page.screenshot({ path: `test-results/map-${name}.png` });
  }
  await page.getByRole('link', { name: /Meadow Lands.*open levels/ }).click();
  await expect(page.locator('.level')).toHaveCount(8);
  await page.goto('/#/worlds'); await page.setViewportSize({ width:390, height:844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('.atlas-scroll').evaluate(element => { element.scrollLeft = element.scrollWidth; });
  await expect(page.getByRole('button', { name: 'Shadow Citadel, locked' })).toBeInViewport();
});
