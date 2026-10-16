import { test, expect } from '@playwright/test';

test('Blazefang loads every frame and guards a supported Riverbend arena', async ({ page }) => {
  test.setTimeout(90000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    localStorage.setItem('aaranya:v1', JSON.stringify({
      results: { '1-1': { stars: 1, coins: 0, bestTimeMs: 60000 } }, seenStories: ['world-meadow'],
    }));
  });
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/#/play/1-2');
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.player);
  const result = await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    const boss = s.enemies.getChildren().find(e => e.patrol.type === 'blazefang');
    const arena = boss.patrol.arena;
    s.setPaused(false);
    s.encounterStorySeen = true;
    s.player.body.reset(5100, 460);
    boss.body.reset(5480, s.killY + 30);
    boss.update(s.player, 16);
    const rescued = !boss.dead && boss.body.bottom <= arena.floor;
    const frames = s.textures.get('blazefang').getFrameNames();
    s.cameras.main.stopFollow();
    s.cameras.main.setScroll(4700, 0);
    boss.body.reset(5480, 490);
    return { health: boss.maxHealth, required: boss.patrol.requiredForExit,
      frames: frames.length, deathFrames: s.anims.get('blazefang-death').frames.length,
      rescued, arenaWidth: arena.right - arena.left,
      platforms: s.level.platforms.filter(([x, , w]) => x >= arena.left && x + w <= arena.right).length };
  });
  expect(result).toMatchObject({ health: 8, required: true, frames: 42, deathFrames: 12, rescued: true, platforms: 3 });
  expect(result.arenaWidth).toBeGreaterThanOrEqual(1200);
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'test-results/blazefang-arena-mobile.png' });
  await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    const boss = s.enemies.getChildren().find(e => e.patrol.type === 'blazefang');
    boss.state = 'recover'; boss.takeDamage(99, boss.x - 10);
  });
  await page.waitForFunction(() => {
    const boss = window.__AARANYA_GAME__.scene.getScene('GameScene').enemies.getChildren().find(e => e.patrol.type === 'blazefang');
    return boss?.anims.currentAnim?.key === 'blazefang-death' && boss.texture.key === 'warden';
  });
  await page.screenshot({ path: 'test-results/blazefang-death-smoke.png' });
  await page.waitForFunction(() => !window.__AARANYA_GAME__.scene.getScene('GameScene').enemies.getChildren().some(e => e.patrol.type === 'blazefang'));
  expect(errors).toEqual([]);
});
