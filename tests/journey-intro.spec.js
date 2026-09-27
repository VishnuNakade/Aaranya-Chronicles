import { test, expect } from '@playwright/test';

test('new journey shows artwork once and Next opens the map', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.removeItem('aaranya:v1'));
  await page.reload();
  await page.getByRole('link', { name: /Begin your journey/i }).click();
  const art = page.getByRole('img', { name: /opening chronicle/i });
  await expect(art).toBeVisible();
  await expect.poll(() => art.evaluate(img => img.naturalWidth)).toBeGreaterThan(0);
  await page.setViewportSize({ width: 844, height: 390 });
  await page.screenshot({ path: 'test-results/journey-landscape.png' });
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page).toHaveURL(/#\/worlds$/);
  await page.goto('/#/');
  await page.reload();
  await page.getByRole('link', { name: /Begin your journey/i }).click();
  await expect(page).toHaveURL(/#\/worlds$/);
});

test('existing players skip the new intro', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /Begin your journey/i }).click();
  await expect(page).toHaveURL(/#\/worlds$/);
});
