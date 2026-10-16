import { test, expect } from '@playwright/test';

test('Riverbend elder rescue, story pause, gift and saved reward', async ({ page }) => {
  test.setTimeout(90000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem('aaranya:v1', JSON.stringify({
    results: { '1-1': { stars: 1, coins: 0, bestTimeMs: 60000 } }, seenStories: ['world-meadow'],
  })));
  await page.setViewportSize({ width: 1000, height: 500 });
  await page.goto('/#/play/1-2');
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.objects?.rescue);
  await page.evaluate(() => window.__AARANYA_GAME__.scene.getScene('GameScene').setPaused(false));
  await page.waitForTimeout(700);
  const waiting = await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    const boss = s.enemies.getChildren().find(e => e.patrol.requiredForExit);
    return { x: boss.x, grounded: boss.body.blocked.down, animation: boss.anims.currentAnim.key };
  });
  expect(waiting).toEqual({ x: 5480, grounded: true, animation: 'blazefang-idle' });
  await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    s.setPaused(false); s.player.body.reset(4750, 460);
  });
  await expect(page.getByRole('heading', { name: 'The Captive Elder' })).toBeVisible();
  expect(await page.evaluate(() => window.__AARANYA_GAME__.scene.getScene('GameScene').physics.world.isPaused)).toBe(true);
  await expect(page.locator('.encounter-art')).toHaveJSProperty('complete', true);
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.waitForFunction(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    const boss = s.enemies.getChildren().find(e => e.patrol.requiredForExit);
    return boss.aggro && boss.state === 'chase' && s.enemies.getLength() > 1;
  });
  const setup = await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    const r = s.objects.rescue;
    s.player.body.reset(r.config.x - 100, 460);
    const original = s.player.hitEnemy;
    s.player.hitEnemy = () => true;
    r.update(s.player, 16);
    const guarded = r.hits === 0;
    s.enemies.getChildren().slice().forEach(e => e.destroy());
    s.player.hitEnemy = original;
    s.cameras.main.centerOn(s.player.x, s.player.y);
    return { guarded, gate: s.objects.gate, height: r.art.displayHeight, bottom: r.art.getBounds().bottom,
      frames: s.textures.get('elder').getFrameNames().length };
  });
  expect(setup).toMatchObject({ guarded: true, gate: null, bottom: 512, frames: 12 });
  expect(setup.height).toBeCloseTo(88);
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'test-results/elder-cage.png' });
  await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    const original = s.player.hitEnemy; s.player.hitEnemy = () => true;
    for (let i = 0; i < 3; i++) s.objects.rescue.update(s.player, 16);
    s.player.hitEnemy = original;
  });
  await expect(page.getByRole('heading', { name: "The Elder's Gift" })).toBeVisible({ timeout: 15000 });
  await page.waitForFunction(() => document.querySelector('.encounter-art')?.naturalWidth > 0);
  expect(await page.evaluate(() => window.__AARANYA_GAME__.scene.getScene('GameScene').finished)).toBe(false);
  await page.screenshot({ path: 'test-results/elder-gift.png' });
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.waitForFunction(() => window.__AARANYA_GAME__.scene.getScene('GameScene').finished);
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('aaranya:v1')).results['1-2']?.rewardId)).toBe('elder-power-stone');
  const saved = await page.evaluate(async () => {
    const { normalizeProgress } = await import('/src/app/progression.js');
    return normalizeProgress(JSON.parse(localStorage.getItem('aaranya:v1'))).results['1-2'].rewardId;
  });
  expect(saved).toBe('elder-power-stone');
  expect(errors).toEqual([]);
});
