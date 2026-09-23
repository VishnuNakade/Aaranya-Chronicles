import { levels } from '../src/game/data/levels';
import { test, expect } from '@playwright/test';

test('Meadow can be traversed using movement, jumping and attacks', async ({ page }) => {
  test.setTimeout(60000);
  await page.goto('/#/play/1-1');
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.player?.body?.blocked.down);
  await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    s.touch.right = true;
    let lastJump = -1000;
    const drive = () => {
      if (s.finished || !s.scene.isActive()) return;
      const p = s.player;
      const ground = s.level.ground.find(([x, , w]) => p.x >= x && p.x <= x + w);
      const edge = ground && ground[0] + ground[2] - p.x < 55 && ground[0] + ground[2] < s.level.width;
      const hazard = s.level.spikes.some(([x, , w]) => x - p.x < 95 && x + w > p.x);
      const enemy = s.enemies.getChildren().some(e => !e.dead && e.x > p.x && e.x - p.x < 110);
      const crate = s.objects.crates.getChildren().some(c => c.x > p.x && c.x - p.x < 85);
      const jump = p.body.blocked.down ? edge || hazard || enemy || crate || p.body.blocked.right : p.jumpsUsed === 1 && p.body.velocity.y > 0 && (!ground || hazard || enemy);
      if (jump && p.elapsed - lastJump > 200) { s.pending.jump = true; lastJump = p.elapsed; }
      if (p.elapsed >= p.nextAttack) s.pending.attack = true;
      requestAnimationFrame(drive);
    };
    requestAnimationFrame(drive);
  });
  await expect(page.getByRole('heading', { name: 'LEVEL COMPLETE' })).toBeVisible({ timeout: 40000 });
});

test('Meadow checkpoints, hazards, crates, gate and restart', async ({ page }) => {
  await page.goto('/#/play/1-1');
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.player?.body?.blocked.down);
  await page.evaluate(() => { const s = window.__AARANYA_GAME__.scene.getScene('GameScene'); s.player.respawn(810, 465); });
  await page.waitForFunction(() => window.__AARANYA_GAME__.scene.getScene('GameScene').checkpointIndex === 0);
  await page.evaluate(() => { const s = window.__AARANYA_GAME__.scene.getScene('GameScene'); s.player.respawn(700, s.killY + 10); });
  await expect(page.getByLabel('2 hearts')).toBeVisible();
  expect(await page.evaluate(() => Math.abs(window.__AARANYA_GAME__.scene.getScene('GameScene').player.x - 810))).toBeLessThan(10);
  await page.evaluate(() => { const s = window.__AARANYA_GAME__.scene.getScene('GameScene'); s.player.respawn(1520, 465); });
  await page.waitForFunction(() => window.__AARANYA_GAME__.scene.getScene('GameScene').checkpointIndex === 1);
  await page.evaluate(() => { const s = window.__AARANYA_GAME__.scene.getScene('GameScene'); s.player.respawn(810, 465); });
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => window.__AARANYA_GAME__.scene.getScene('GameScene').respawnPoint.x)).toBe(1520);
  await page.waitForFunction(() => { const p = window.__AARANYA_GAME__.scene.getScene('GameScene').player; return p.elapsed >= p.invincibleUntil; });
  await page.evaluate(() => { const s = window.__AARANYA_GAME__.scene.getScene('GameScene'); s.player.respawn(1725, 485); });
  await expect(page.getByLabel('1 hearts')).toBeVisible();
  await page.evaluate(() => { const s = window.__AARANYA_GAME__.scene.getScene('GameScene'); s.player.respawn(2040, 480); s.player.facing = 1; });
  await page.waitForTimeout(250);
  await page.keyboard.press('Space');
  await page.waitForFunction(() => window.__AARANYA_GAME__.scene.getScene('GameScene').objects.crates.getLength() === 1);
  expect(await page.evaluate(() => window.__AARANYA_GAME__.scene.getScene('GameScene').finished)).toBe(false);
  await page.screenshot({ path: 'test-results/meadow-gate.png' });
  await page.evaluate(() => { const s = window.__AARANYA_GAME__.scene.getScene('GameScene'); s.player.respawn(s.level.exit.x, s.level.exit.y); });
  await expect(page.getByRole('heading', { name: 'LEVEL COMPLETE' })).toBeVisible();
  await page.getByRole('button', { name: 'Replay' }).click();
  await expect(page.getByLabel('3 hearts')).toBeVisible();
  expect(await page.evaluate(() => { const s = window.__AARANYA_GAME__.scene.getScene('GameScene'); return [s.checkpointIndex, s.objects.crates.getLength(), s.physics.world.bounds.width, s.cameras.main.getBounds().width]; })).toEqual([-1, 2, levels['1-1'].width, levels['1-1'].width]);
});
