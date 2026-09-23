import { test, expect } from '@playwright/test';
import { calculateStars, formatTime } from '../src/game/results.js';

test('star thresholds and time formatting', () => {
  const run = { won: true, coins: 0, totalCoins: 10, enemiesDefeated: 0, totalEnemies: 2 };
  expect(calculateStars(run)).toBe(1);
  expect(calculateStars({ ...run, coins: 7 })).toBe(1);
  expect(calculateStars({ ...run, coins: 8 })).toBe(2);
  expect(calculateStars({ ...run, enemiesDefeated: 2 })).toBe(2);
  expect(calculateStars({ ...run, coins: 8, enemiesDefeated: 2 })).toBe(3);
  expect(calculateStars({ ...run, won: false })).toBe(0);
  expect(formatTime(125999)).toBe('2:05');
});

test('results persist, unlock next level, preserve best run and support navigation', async ({ page }) => {
  await page.goto('/#/play/1-1');
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.player?.body);
  await page.evaluate(() => { const s = window.__AARANYA_GAME__.scene.getScene('GameScene'); s.coinsCollected = s.level.coins.length + s.level.enemies.length; s.enemiesDefeated = s.level.enemies.length; s.elapsedMs = 65000; s.player.respawn(s.level.exit.x, s.level.exit.y); });
  await expect(page.getByRole('heading', { name: 'LEVEL COMPLETE' })).toBeVisible();
  await expect(page.getByRole('img', { name: '3 of 3 stars' })).toBeVisible();
  await expect(page.getByText('1:05', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Next Level' })).toHaveAttribute('href', '#/play/1-2');
  for (const [name, width, height] of [['desktop',1280,900], ['mobile',390,844], ['landscape',844,390]]) {
    await page.setViewportSize({ width, height });
    await expect(page.getByRole('link', { name: 'World Map', exact: true })).toBeInViewport();
    await page.screenshot({ path: `test-results/results-${name}.png` });
  }
  await page.getByRole('button', { name: 'Replay', exact: true }).click();
  await expect(page.getByLabel('3 hearts')).toBeVisible();
  await page.evaluate(() => { const s = window.__AARANYA_GAME__.scene.getScene('GameScene'); s.player.respawn(s.level.exit.x, s.level.exit.y); });
  await expect(page.getByRole('img', { name: '1 of 3 stars' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('aaranya:v1')).results['1-1'].lastRun.stars)).toBe(1);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('aaranya:v1')));
  expect(saved.results['1-1'].stars).toBe(3);
  expect(saved.unlockedLevels).toContain('1-2');
  await page.getByRole('link', { name: 'World Map', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'World Map', exact: true })).toBeVisible();
  await page.goto('/#/worlds/meadow/levels'); await page.reload();
  await expect(page.getByText('3 / 3 stars')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Level 1-2: The Riverbend' })).toBeVisible();
});
