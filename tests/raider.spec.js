import { test, expect } from '@playwright/test';
async function ready(page) {
  await page.goto('/#/play/1-1');
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.player?.hasLanded);
}
test('all 50 frames load; four equal-strength raiders replace legacy enemies and hearts', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await ready(page);
  const result = await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    return { count: s.enemies.getLength(), health: s.enemies.getChildren().map(e => e.health),
      frames: s.textures.get('enemy1').getFrameNames().length, pairs: s.level.enemies.map(e => e.encounter) };
  });
  expect(result.count).toBe(4); expect(result.health).toEqual([3, 3, 3, 3]); expect(result.frames).toBe(50);
  expect(new Set(result.pairs).size).toBe(2);
  await expect(page.getByRole('progressbar', { name: 'Life', exact: true })).toHaveAttribute('value', '3');
  await expect(page.locator('.hearts')).toHaveCount(0);
  await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene'); s.player.takeDamage();
    s.player.damagePosture(70);
  });
  await expect(page.getByRole('progressbar', { name: 'Life', exact: true })).toHaveAttribute('value', '2');
  await expect(page.getByRole('progressbar', { name: 'Posture', exact: true })).toHaveAttribute('value', '0');
  expect(errors).toEqual([]);
});
test('guard breaks, recovery damage, death animation and one coin drop', async ({ page }) => {
  await ready(page);
  const result = await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene'), e = s.enemies.getChildren()[0];
    s.setPaused(true);
    e.state = 'windup'; e.direction = 1;
    for (let i = 0; i < 3; i++) { e.elapsed += 400; e.takeDamage(1, e.x + 30); }
    const guard = { health: e.health, posture: e.posture.value, staggered: e.hurtUntil > e.elapsed };
    for (let i = 0; i < 3; i++) { e.elapsed += 1400; e.state = 'recover'; e.takeDamage(1, e.x + 30); }
    const dead = e.dead;
    const coins = s.coins.getLength();
    s.setPaused(false);
    return { guard, dead, coins };
  });
  expect(result.guard).toEqual({ health: 3, posture: 0, staggered: true }); expect(result.dead).toBe(true);
  await page.waitForFunction(() => window.__AARANYA_GAME__.scene.getScene('GameScene').enemies.getLength() === 3);
  expect(await page.evaluate(() => window.__AARANYA_GAME__.scene.getScene('GameScene').coins.getLength())).toBe(result.coins + 1);
});
test('raider follows Veer onto a raised platform', async ({ page }) => {
  await ready(page);
  await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    s.enemies.getChildren().slice(1).forEach(e => e.destroy());
    const e = s.enemies.getChildren()[0]; e.body.reset(1030, 490); e.body.updateFromGameObject();
    s.player.respawn(920, 390); s.player.invincibleUntil = Infinity;
    window.jumpSeen = false; window.landedAbove = false; window.failedLandings = 0; window.maxJumps = 0;
    let airborne = false;
    s.events.on('postupdate', () => {
      if (e.body.velocity.y < -400) window.jumpSeen = true;
      window.maxJumps = Math.max(window.maxJumps, e.navigator.jumps);
      if (window.jumpSeen && !e.body.blocked.down) airborne = true;
      if (airborne && e.body.blocked.down) {
        if (e.body.bottom >= 440) window.failedLandings++;
        airborne = false;
      }
      if (window.jumpSeen && e.body.blocked.down && e.body.bottom < 440) window.landedAbove = true;
    });
  });
  await page.waitForFunction(() => window.jumpSeen, null, { timeout: 10000 });
  await page.waitForFunction(() => window.landedAbove, null, { timeout: 15000 });
  expect(await page.evaluate(() => window.failedLandings)).toBe(0);
  expect(await page.evaluate(() => window.maxJumps)).toBe(1);
  await page.setViewportSize({ width: 844, height: 390 });
  await page.screenshot({ path: 'test-results/raider-landscape.png' });
});

test('warning precedes frame-synchronized sword damage and long combo recovery', async ({ page }) => {
  await ready(page);
  await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    s.enemies.getChildren().slice(1).forEach(e => e.destroy());
    const e = s.enemies.getChildren()[0];
    e.body.reset(1070, 490); e.body.updateFromGameObject(); s.player.respawn(1020, 490);
    window.hitFrames = []; window.longRecovery = false;
    s.player.on('damage', () => window.hitFrames.push({ state: e.state, frame: e.anims.currentFrame.index }));
    s.events.on('postupdate', () => { if (e.state === 'recover' && e.phaseUntil - e.elapsed > 900) window.longRecovery = true; });
  });
  await page.waitForFunction(() => window.__AARANYA_GAME__.scene.getScene('GameScene').enemies.getChildren()[0].state === 'windup');
  expect(await page.evaluate(() => window.__AARANYA_GAME__.scene.getScene('GameScene').player.health)).toBe(3);
  await page.waitForFunction(() => window.hitFrames.length > 0);
  const hits = await page.evaluate(() => window.hitFrames);
  expect(hits[0].state).toBe('attack'); expect([4, 5, 6]).toContain(hits[0].frame);
  await page.waitForFunction(() => window.longRecovery, null, { timeout: 12000 });
});

test('enemy uses a second jump to reach a higher tile', async ({ page }) => {
  await ready(page);
  await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    s.enemies.getChildren().slice(1).forEach(e => e.destroy());
    const e = s.enemies.getChildren()[0]; e.body.reset(1080, 490); e.body.updateFromGameObject();
    s.player.respawn(1190, 315); s.player.invincibleUntil = Infinity;
    window.doubleSeen = false; window.highLanding = false;
    s.events.on('postupdate', () => {
      if (e.navigator.jumps === 2) window.doubleSeen = true;
      if (e.body.blocked.down && e.body.bottom < 350) window.highLanding = true;
    });
  });
  await page.waitForFunction(() => window.doubleSeen, null, { timeout: 10000 });
  await page.waitForFunction(() => window.highLanding, null, { timeout: 10000 });
});
