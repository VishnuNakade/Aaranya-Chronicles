import { test, expect } from '@playwright/test';

test('Warden lands and waits instead of jumping toward a hero outside the arena', async ({ page }) => {
  test.setTimeout(90000);
  await page.goto('/#/play/1-1');
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.enemies);
  await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    s.setPaused(false);
    const w = s.enemies.getChildren().find(e => e.patrol.type === 'forestWarden');
    s.encounterStorySeen = true;
    s.player.body.reset(s.level.arena.left - 260, 460);
    s.player.invincibleUntil = 1e9;
    w.body.reset(s.level.arena.left + 24, 280);
    w.body.updateFromGameObject();
    w.setVelocity(-100, -100); w.aggro = true;
    window.wardenJumps = 0;
    w.on('jump', () => window.wardenJumps++);
  });
  await page.waitForTimeout(2400);
  const waiting = await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    const w = s.enemies.getChildren().find(e => e.patrol.type === 'forestWarden');
    return { grounded: w.body.blocked.down, vx: w.body.velocity.x, jumps: window.wardenJumps,
      state: w.state, animation: w.anims.currentAnim.key, dead: w.dead };
  });
  expect(waiting).toEqual({ grounded: true, vx: 0, jumps: 0, state: 'waiting', animation: 'warden-idle', dead: false });
  await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    s.player.body.reset(s.level.arena.left + 300, 460);
  });
  await page.waitForFunction(() => window.__AARANYA_GAME__.scene.getScene('GameScene').enemies.getChildren()
    .find(e => e.patrol.type === 'forestWarden').aggro);
});
