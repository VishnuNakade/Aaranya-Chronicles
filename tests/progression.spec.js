import { test, expect } from '@playwright/test';
import { initialProgress, normalizeProgress, completeLevel } from '../src/app/progression';
import { levels, worlds, getCoinTotal, getEnemyTotal } from '../src/game/data/levels';

const run = (levelId, values = {}) => ({ levelId, won: true, bossDefeated: levelId === '1-8', coins: Math.ceil(getCoinTotal(levels[levelId]) * .8), enemiesDefeated: getEnemyTotal(levels[levelId]), timeMs: 60000, ...values });
test('sequential progression, independent records, migration and invalid saves', () => {
  let save = initialProgress();
  expect(save.unlockedLevels).toEqual(['1-1']);
  expect(completeLevel(save, run('1-8'))).toBe(save);
  expect(completeLevel(save, run('1-1', { won: false }))).toBe(save);
  save = completeLevel(save, run('1-1'));
  save = completeLevel(save, run('1-1', { coins: 2, enemiesDefeated: 0, timeMs: 30000 }));
  expect(save.results['1-1']).toMatchObject({ stars: 3, coins: Math.ceil(getCoinTotal(levels['1-1']) * .8), bestTimeMs: 30000 });
  save = completeLevel(save, run('1-1', { coins: getCoinTotal(levels['1-1']), timeMs: 90000 }));
  expect(save.results['1-1']).toMatchObject({ stars: 3, coins: getCoinTotal(levels['1-1']), bestTimeMs: 30000 });
  for (const id of worlds[0].levelIds.slice(1)) save = completeLevel(save, run(id));
  expect(save.unlockedLevels).toEqual([...worlds[0].levelIds, '2-1']);
  expect(Object.keys(save.results)).toHaveLength(8);
  expect(levels['1-8'].nextLevelId).toBe('2-1');
  expect(normalizeProgress(JSON.parse(JSON.stringify(save))).unlockedLevels).toEqual(save.unlockedLevels);
  expect(normalizeProgress({ completed: true, bestCoins: 5 }).results['1-1']).toMatchObject({ stars: 1, coins: 5, bestTimeMs: null });
  expect(normalizeProgress({ unlockedLevels: ['1-8'], results: { '1-8': { stars: 3 } } }).unlockedLevels).toEqual(['1-1']);
  expect(normalizeProgress(null)).toEqual(initialProgress());
});

test('eight levels, route locks, next level, reload and final completion', async ({ page }) => {
  await page.goto('/#/worlds/meadow/levels');
  await expect(page.locator('.level')).toHaveCount(8);
  await expect(page.locator('.level.available')).toHaveCount(1);
  await page.goto('/#/play/1-8');
  await expect(page).toHaveURL(/worlds\/meadow\/levels/);
  await page.getByRole('link', { name: 'Level 1-1: The First Steps' }).click();
  await page.evaluate(() => { const save = JSON.parse(localStorage.getItem('aaranya:v1')); save.seenStories.push('boss-meadow'); localStorage.setItem('aaranya:v1', JSON.stringify(save)); });
  await page.reload();
  for (const id of worlds[0].levelIds) {
    await page.waitForFunction(id => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.level?.id === id && !!window.__AARANYA_GAME__.scene.getScene('GameScene').player?.body, id);
    await page.evaluate(() => { const s = window.__AARANYA_GAME__.scene.getScene('GameScene'); if (s.boss) { s.boss.state = 'recover'; s.boss.takeDamage(18, 0); } else s.player.respawn(s.level.exit.x, s.level.exit.y); });
    await expect(page.getByRole('heading', { name: 'LEVEL COMPLETE' })).toBeVisible();
    if (id !== '1-8') await page.getByRole('link', { name: 'Next Level' }).click();
    else await expect(page.getByRole('link', { name: /Next Level/ })).toHaveAttribute('href', '#/play/2-1');
  }
  await page.goto('/#/worlds/meadow/levels'); await page.reload();
  await expect(page.locator('.level.available')).toHaveCount(8);
  await expect(page.getByText('1 / 3 stars')).toHaveCount(7);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/progression-mobile.png', fullPage: true });
});
