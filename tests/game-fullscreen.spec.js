import { test, expect } from '@playwright/test';
test('wide landscape canvas fills the screen with large touch controls', async ({ page }) => {
  await page.setViewportSize({ width: 1257, height: 566 });
  await page.goto('/#/play/1-1');
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.player);
  for (const viewport of [{ width: 1257, height: 566 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(viewport);
    await expect.poll(async () => Math.round((await page.locator('canvas').boundingBox()).width)).toBe(viewport.width);
    const canvas = await page.locator('canvas').boundingBox();
    expect(Math.abs(canvas.x)).toBeLessThan(2);
    expect(Math.abs(canvas.height - viewport.height)).toBeLessThan(2);
    expect((await page.getByRole('button', { name: 'Move left', exact: true }).boundingBox()).width).toBe(88);
    await page.screenshot({ path: `test-results/fullscreen-${viewport.width}.png` });
  }
});
