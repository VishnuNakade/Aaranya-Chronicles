import { test, expect } from '@playwright/test';

for (const viewport of [{ width: 1136, height: 510 }, { width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  test(`live menu moves without shifting controls at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/');
    const canvas = page.locator('.menu-live-background');
    await expect(canvas).toHaveAttribute('data-ready', 'true');
    const read = () => page.evaluate(() => {
      const canvas = document.querySelector('.menu-live-background');
      const gl = canvas.getContext('webgl');
      const pixels = new Uint8Array(canvas.width * canvas.height * 4);
      gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      let sum = 0, changed = 0;
      if (window.previousMenuPixels) for (let i = 0; i < pixels.length; i += 4) {
        const diff = Math.abs(pixels[i] - window.previousMenuPixels[i]) + Math.abs(pixels[i + 1] - window.previousMenuPixels[i + 1]);
        if (diff > 2) changed++;
      }
      for (let i = 0; i < pixels.length; i += 4) sum += pixels[i];
      window.previousMenuPixels = pixels;
      return { sum, changed, count: canvas.width * canvas.height };
    });
    const bounds = await page.locator('.menu-actions').boundingBox();
    expect((await read()).sum).toBeGreaterThan(100000);
    await page.waitForTimeout(900);
    const animated = await read();
    // On narrow portrait views the hero is outside the crop, but river water remains visible.
    expect(animated.changed).toBeGreaterThan(10);
    expect(animated.changed / animated.count).toBeLessThan(0.15);
    expect(await page.locator('.menu-actions').boundingBox()).toEqual(bounds);
    await page.screenshot({ path: `test-results/live-menu-${viewport.width}.png` });
    await page.getByRole('button', { name: 'Use static background' }).click();
    await expect(canvas).toHaveCount(0);
    expect(await page.locator('.menu').evaluate(el => getComputedStyle(el).backgroundImage)).toContain('forest.png');
    await page.reload();
    await expect(page.getByRole('button', { name: 'Use live background' })).toBeVisible();
    await expect(canvas).toHaveCount(0);
    await page.getByRole('button', { name: 'Use live background' }).click();
    await expect(canvas).toHaveAttribute('data-ready', 'true');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(canvas).toBeHidden();
    expect(errors).toEqual([]);
  });
}
