import { levels, getCoinTotal } from '../src/game/data/levels';
import { test, expect } from '@playwright/test';

test('enemy health, knockback, cooldown, delayed death and one coin drop', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/#/play/1-1');
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.enemies?.getLength() === 2);
  const result = await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    const [slime, goblin] = s.enemies.getChildren();
    const health = [slime.health, goblin.health];
    const first = slime.takeDamage(1, slime.x - 50);
    const second = slime.takeDamage(1, slime.x - 50);
    return { health, first, second, hp: slime.health, vx: slime.body.velocity.x };
  });
  expect(result).toEqual({ health: [2, 3], first: true, second: false, hp: 1, vx: 140 });
  await page.waitForFunction(() => { const e = window.__AARANYA_GAME__.scene.getScene('GameScene').enemies.getChildren()[0]; return e.elapsed >= e.invincibleUntil; });
  expect(await page.evaluate(() => { const s = window.__AARANYA_GAME__.scene.getScene('GameScene'); const e = s.enemies.getChildren()[0]; e.takeDamage(1); e.takeDamage(1); return [e.dead, e.body.enable, s.coins.getLength()]; })).toEqual([true, false, 8]);
  await page.waitForFunction(() => window.__AARANYA_GAME__.scene.getScene('GameScene').enemies.getLength() === 1);
  expect(await page.evaluate(() => window.__AARANYA_GAME__.scene.getScene('GameScene').coins.getLength())).toBe(9);
  await page.evaluate(() => { const s = window.__AARANYA_GAME__.scene.getScene('GameScene'); const coin = s.coins.getChildren().find(c => c.getData('bonus')); s.player.respawn(coin.x, coin.y); });
  await expect(page.locator('.coin-count')).toContainText(`1 / ${getCoinTotal(levels['1-1'])}`);
  expect(errors).toEqual([]);
});

test('goblin detects, chases, attacks and returns to patrol', async ({ page }) => {
  await page.goto('/#/play/1-1');
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.enemies?.getLength() === 2);
  await page.evaluate(() => { const s = window.__AARANYA_GAME__.scene.getScene('GameScene'); const e = s.enemies.getChildren()[1]; s.player.respawn(e.x - 150, 470); });
  await page.waitForFunction(() => window.__AARANYA_GAME__.scene.getScene('GameScene').enemies.getChildren()[1].state === 'chase');
  await page.evaluate(() => { const s = window.__AARANYA_GAME__.scene.getScene('GameScene'); const e = s.enemies.getChildren()[1]; s.player.respawn(e.x - 45, e.y); });
  await page.waitForFunction(() => window.__AARANYA_GAME__.scene.getScene('GameScene').enemies.getChildren()[1].state === 'attack');
  await expect(page.getByLabel('2 hearts')).toBeVisible();
  await page.evaluate(() => window.__AARANYA_GAME__.scene.getScene('GameScene').player.respawn(90, 420));
  await page.waitForFunction(() => window.__AARANYA_GAME__.scene.getScene('GameScene').enemies.getChildren()[1].state === 'patrol');
  await page.screenshot({ path: 'test-results/enemy-system.png' });
});
