import { test, expect } from '@playwright/test';

test('Riverbend has a distinct spike-free route with supported encounters', async ({ page }) => {
  test.setTimeout(90000);
  await page.addInitScript(() => {
    const save = JSON.parse(localStorage.getItem('aaranya:v1') || '{}');
    save.results = { '1-1': { stars: 1, coins: 0, bestTimeMs: 60000 } }; save.seenStories = ['world-meadow'];
    localStorage.setItem('aaranya:v1', JSON.stringify(save));
  });
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/#/play/1-2');
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.player);
  const result = await page.evaluate(async () => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    const { levels } = await import('/src/game/data/levels.js');
    return {
      spikes: s.objects.spikes.getLength(), hazards: s.level.environment.hazards.filter(h => h.type === 'spikes').length,
      enemies: s.enemies.getLength(), platforms: s.level.platforms.length,
      distinct: JSON.stringify(s.level.platforms) !== JSON.stringify(levels['1-1'].platforms),
      supported: s.level.enemies.every(e => s.level.ground.some(([x, , w]) => e.min >= x + 24 && e.max <= x + w - 24)),
      boxes: s.objects.crates.getLength(),
      gaps: s.level.ground.slice(1).map((g, i) => g[0] - (s.level.ground[i][0] + s.level.ground[i][2])),
    };
  });
  expect(result).toMatchObject({ spikes: 0, hazards: 0, enemies: 8, platforms: 12, distinct: true, supported: true, boxes: 5 });
  expect(Math.max(...result.gaps)).toBeLessThanOrEqual(170);
  await page.screenshot({ path: 'test-results/riverbend-mobile.png' });
});
