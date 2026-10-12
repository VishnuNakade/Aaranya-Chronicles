import { test, expect } from '@playwright/test';
test('world map has compact single-line mobile header', async ({ page }) => {
  await page.setViewportSize({ width: 1047, height: 471 });
  await page.goto('/#/worlds');
  await expect(page.getByRole('heading', { name: 'World Map' })).toBeVisible();
  await expect(page.locator('.atlas-header')).not.toContainText('AARANYA CHRONICLES');
  expect((await page.locator('.atlas-header').boundingBox()).height).toBeLessThanOrEqual(54);
  expect((await page.getByRole('link', { name: 'Back to main menu' }).boundingBox()).x).toBe(8);
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(471);
  await page.screenshot({ path: 'test-results/map-header.png' });
});
