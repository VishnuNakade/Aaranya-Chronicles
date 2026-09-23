import { test, expect } from '@playwright/test';
import { initialProgress, completeLevel, normalizeProgress } from '../src/app/progression';

function arenaSave() {
  let save = initialProgress();
  for (let i = 1; i <= 7; i++) save = completeLevel(save, { levelId: `1-${i}`, won: true, coins: 0, enemiesDefeated: 0, timeMs: 1000 });
  save.seenStories = ['world-meadow', 'boss-meadow'];
  return save;
}
test('boss rewards require a defeat and survive normalization without duplicates', () => {
  const save = arenaSave();
  const result = { levelId: '1-8', won: true, coins: 4, enemiesDefeated: 1, timeMs: 45000 };
  expect(completeLevel(save, result)).toBe(save);
  const legacy = normalizeProgress({ ...save, results: { ...save.results, '1-8': { stars: 3 } } });
  expect(legacy.unlockedLevels).not.toContain('2-1');
  expect(legacy.relics).toEqual([]);
  const win = completeLevel(save, { ...result, bossDefeated: true });
  expect(normalizeProgress(win).unlockedLevels).toContain('2-1');
  expect(normalizeProgress(win).relics).toEqual(['meadow-relic']);
  expect(completeLevel(win, { ...result, bossDefeated: true }).relics).toEqual(['meadow-relic']);
});

test('Guardian arena: sword, armor, phases, pause, victory and World 2', async ({ page }) => {
  test.setTimeout(60000);
  await page.goto('/');
  await page.evaluate(save => localStorage.setItem('aaranya:v1', JSON.stringify(save)), arenaSave());
  await page.goto('/#/play/1-8'); await page.reload();
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.boss?.body);
  await expect(page.getByRole('progressbar', { name: 'Boss health' })).toHaveAttribute('aria-valuenow', '18');
  await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    s.finish(true); if (s.finished) throw new Error('Gate bypassed boss');
    s.boss.state = 'windup'; if (s.boss.takeDamage(1, 0)) throw new Error('Armor failed');
    s.boss.state = 'recover'; s.boss.remaining = 5000;
    s.player.respawn(s.boss.x - 100, 475); s.player.facing = 1;
  });
  await page.keyboard.press('Space');
  await expect(page.getByRole('progressbar', { name: 'Boss health' })).toHaveAttribute('aria-valuenow', '17');
  await page.screenshot({ path: 'test-results/boss-desktop.png' });
  await page.setViewportSize({ width: 844, height: 390 });
  await page.screenshot({ path: 'test-results/boss-landscape.png' });
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  const remaining = await page.evaluate(() => window.__AARANYA_GAME__.scene.getScene('GameScene').boss.remaining);
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => window.__AARANYA_GAME__.scene.getScene('GameScene').boss.remaining)).toBe(remaining);
  await page.getByRole('button', { name: 'Resume', exact: true }).click();
  const attacks = await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene'); const b = s.boss; const p = s.player;
    const start = name => { b.state = 'windup'; b.attackName = name; b.remaining = 1; b.target = { x: p.x, y: p.y }; b.attackDirection = -1; };
    p.respawn(b.x - 120, 470); p.invincibleUntil = 0;
    start('smash'); const before = p.health; b.update(p, 2); const smashHit = p.health === before - 1;
    p.respawn(b.x - 120, 350); p.invincibleUntil = 0;
    start('smash'); const airborne = p.health; b.update(p, 2); const jumpSafe = p.health === airborne;
    start('rock'); b.update(p, 2); const rock = b.projectiles.getChildren()[0]; const rockMoving = rock.body.velocity.length() > 200;
    if (rock.texture.key !== 'world1:fallingRock' || rock.displayWidth !== 30) throw new Error('Supplied rock artwork or projectile size missing');
    b.update(p, 500); const rockPersists = b.projectiles.countActive() === 1;
    b.update(p, 1000); const rockCleared = b.projectiles.countActive() === 0;
    start('walk'); b.update(p, 2); const walk = b.body.velocity.x < 0;
    b.state = 'recover'; b.remaining = 5000; b.setVelocityX(0); p.respawn(120, 440);
    return { smashHit, jumpSafe, rockMoving, rockPersists, rockCleared, walk };
  });
  expect(Object.values(attacks).every(Boolean)).toBe(true);
  for (const [damage, phase] of [[5, 2], [6, 3]]) {
    await page.evaluate(damage => { const b = window.__AARANYA_GAME__.scene.getScene('GameScene').boss; b.invincibleUntil = 0; b.takeDamage(damage, 0); }, damage);
    await expect(page.getByText(`Phase ${phase} / 3`, { exact: true })).toBeVisible();
  }
  await page.evaluate(() => { const b = window.__AARANYA_GAME__.scene.getScene('GameScene').boss; b.invincibleUntil = 0; b.takeDamage(6, 0); });
  await expect(page.getByRole('heading', { name: 'Relic restored' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'LEVEL COMPLETE' })).toBeVisible();
  await expect(page.getByText('Relic of the Meadow recovered')).toBeVisible();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('aaranya:v1')));
  expect(saved.relics).toEqual(['meadow-relic']); expect(saved.unlockedLevels).toContain('2-1');
  await page.getByRole('link', { name: 'World Map', exact: true }).click();
  await expect(page.getByRole('link', { name: /Whispering Woods/ })).toBeVisible();
});
