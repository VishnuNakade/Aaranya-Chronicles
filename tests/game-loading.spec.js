import { test, expect } from '@playwright/test';

test('loading hides controls until the level renders', async ({ page }) => {
  test.setTimeout(120000);
  await page.setViewportSize({ width: 844, height: 390 });
  let release;
  const pending = new Promise(resolve => { release = resolve; });
  await page.route('**/*.mp3', async route => { await pending; await route.continue(); });
  await page.goto('/#/play/1-1');
  await expect(page.getByRole('status')).toContainText('Loading your journey');
  await expect(page.getByRole('button', { name: 'Move left', exact: true })).toBeHidden();
  await page.screenshot({ path: 'test-results/level-loading.png' });
  release();
  await expect(page.locator('.level-loading')).toHaveCount(0, { timeout: 30000 });
  await expect(page.getByRole('button', { name: 'Move left', exact: true })).toBeVisible();
  await expect(page.locator('.game-stage')).toHaveAttribute('aria-busy', 'false');
});
