import { test, expect } from '@playwright/test';
for (const mode of ['system', 'setting']) {
  test(`map marker stays anchored while pressed with ${mode} reduced motion`, async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.emulateMedia({ reducedMotion: mode === 'system' ? 'reduce' : 'no-preference' });
    await page.goto('/#/worlds');
    if (mode === 'setting') await page.evaluate(() => { document.documentElement.dataset.reducedMotion = 'true'; });
    const marker = page.locator('.atlas-location.is-unlocked').first();
    const before = await marker.boundingBox();
    await page.mouse.move(before.x + before.width / 2, before.y + 20);
    await page.mouse.down();
    const pressed = await marker.boundingBox();
    expect(pressed.x).toBeCloseTo(before.x, 1);
    expect(pressed.y).toBeCloseTo(before.y, 1);
    await page.mouse.up();
    await expect(page).toHaveURL(/worlds\/meadow\/levels/);
  });
}
