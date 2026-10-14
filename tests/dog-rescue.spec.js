import { test, expect } from '@playwright/test';

test('warden arena is safe and rescue replaces the exit', async ({ page }) => {
  test.setTimeout(90000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1000, height: 500 });
  await page.goto('/#/play/1-1');
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.objects?.rescue);
  const visual = await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    return { height: s.objects.rescue.art.displayHeight, bottom: s.objects.rescue.art.getBounds().bottom,
      platforms: s.level.platforms.filter(([x]) => x >= s.level.arena.left).length };
  });
  expect(visual.height).toBeCloseTo(58);
  expect(visual.bottom).toBeCloseTo(512);
  expect(visual.platforms).toBe(2);
  const setup = await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    const boss = s.enemies.getChildren().find(e => e.patrol.requiredForExit);
    boss.body.reset(s.level.arena.left - 80, s.killY + 10);
    boss.update(s.player, 16);
    const safe = !boss.dead && boss.y < s.killY;
    s.player.body.reset(s.level.rescue.x - 65, 460);
    s.cameras.main.centerOn(s.player.x, s.player.y);
    const original = s.player.hitEnemy;
    s.player.hitEnemy = () => true;
    s.objects.rescue.update(s.player, 16);
    const locked = s.objects.rescue.hits === 0;
    boss.destroy();
    s.objects.rescue.update(s.player, 16);
    s.objects.rescue.update(s.player, 16);
    const twoHits = s.objects.rescue.state === 'caged';
    s.objects.rescue.update(s.player, 16);
    s.player.hitEnemy = original;
    return { safe, locked, twoHits, noGate: s.objects.gate === null, width: s.level.ground.at(-1)[2] };
  });
  expect(setup).toEqual({ safe: true, locked: true, twoHits: true, noGate: true, width: 1200 });
  await page.waitForFunction(() => window.__AARANYA_GAME__.scene.getScene('GameScene').objects.rescue.state === 'rescued');
  expect(await page.evaluate(() => window.__AARANYA_GAME__.scene.getScene('GameScene').objects.rescue.art.anims.currentAnim.key)).toBe('dog-sit');
  await page.screenshot({ path: 'test-results/dog-rescued.png' });
  await page.waitForFunction(() => window.__AARANYA_GAME__.scene.getScene('GameScene').finished);
  expect(errors).toEqual([]);
});
