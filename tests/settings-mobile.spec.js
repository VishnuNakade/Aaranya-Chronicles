import { test, expect } from '@playwright/test';
for (const [width, height] of [[1047,471], [844,390], [667,320], [360,640]]) {
  test(`settings fit ${width}x${height} with working saved controls`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/#/settings');
    await expect(page.getByRole('heading', { name: 'Settings', exact: true })).toBeVisible();
    expect((await page.locator('.settings-header').boundingBox()).height).toBeLessThanOrEqual(54);
    for (const checkbox of await page.getByRole('checkbox').all()) {
      const box = await checkbox.boundingBox();
      expect(box.y + box.height).toBeLessThan(height);
    }
    expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(height);
    const sound = page.getByRole('checkbox', { name: 'Sound effects' });
    const initial = await sound.isChecked(); await sound.setChecked(!initial);
    await page.reload(); await expect(sound).toBeChecked({ checked: !initial });
    await page.screenshot({ path: `test-results/settings-${width}.png` });
    await page.getByRole('link', { name: 'Go back' }).click();
    await expect(page.locator('.menu')).toBeVisible();
  });
}
