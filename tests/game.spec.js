import { levels, getCoinTotal } from '../src/game/data/levels';
import { test, expect } from '@playwright/test';
async function ready(page) {
  await page.goto('/#/play/1-1');
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.player?.body);
  await expect(page.locator('canvas')).toHaveCount(1);
}
test('screens, settings and mobile layout', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/'); await expect(page.getByRole('heading', { name: 'AARANYA CHRONICLES' })).toBeVisible();
  await page.screenshot({ path: 'test-results/menu-desktop.png', fullPage: true });
  await page.getByRole('link', { name: 'Begin your journey' }).click();
  await page.getByRole('button', { name: 'Turn the page' }).click();
  await page.getByRole('button', { name: 'Begin chapter one' }).click();
  await expect(page.getByRole('heading', { name: 'Meadow Lands' })).toBeVisible();
  await page.goto('/#/settings'); await page.getByRole('checkbox', { name: /Sound effects/ }).uncheck();
  await page.reload(); await expect(page.getByRole('checkbox', { name: /Sound effects/ })).not.toBeChecked();
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ['/', '/worlds', '/worlds/meadow/levels', '/story', '/settings']) {
    await page.goto('/#' + route);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.goto('/'); await page.screenshot({ path: 'test-results/menu-mobile.png', fullPage: true });
  expect(errors).toEqual([]);
});
test('movement, jump, coins, combat, damage, completion and cleanup', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await ready(page);
  await page.waitForTimeout(400);
  const x = await page.evaluate(() => window.__AARANYA_GAME__.scene.getScene('GameScene').player.x);
  await page.keyboard.down('ArrowRight'); await page.waitForTimeout(220); await page.keyboard.up('ArrowRight');
  expect(await page.evaluate(() => window.__AARANYA_GAME__.scene.getScene('GameScene').player.x)).toBeGreaterThan(x + 20);
  await page.keyboard.down('ArrowUp'); await page.waitForTimeout(100); await page.keyboard.up('ArrowUp');
  expect(await page.evaluate(() => window.__AARANYA_GAME__.scene.getScene('GameScene').player.body.velocity.y)).toBeLessThan(0);
  await page.evaluate(() => { const s = window.__AARANYA_GAME__.scene.getScene('GameScene'); s.player.setPosition(300, 372).setVelocity(0); });
  await expect(page.locator('.coin-count')).toContainText(`1 / ${getCoinTotal(levels['1-1'])}`);
  await page.evaluate(() => { const s = window.__AARANYA_GAME__.scene.getScene('GameScene'); const enemy = s.enemies.getChildren()[0]; s.player.setPosition(enemy.x - 50, enemy.y); s.player.facing = 1; });
  await page.keyboard.down('Space'); await page.waitForTimeout(80); await page.keyboard.up('Space');
  await page.waitForFunction(() => window.__AARANYA_GAME__.scene.getScene('GameScene').enemies.getChildren()[0].health === 1);
  await page.waitForFunction(() => { const s = window.__AARANYA_GAME__.scene.getScene('GameScene'); return s.player.elapsed >= s.player.nextAttack && s.enemies.getChildren()[0].elapsed >= s.enemies.getChildren()[0].invincibleUntil; });
  await page.evaluate(() => { const s = window.__AARANYA_GAME__.scene.getScene('GameScene'); const e = s.enemies.getChildren()[0]; s.player.respawn(e.x - 50, e.y); s.player.facing = 1; });
  await page.keyboard.press('Space');
  await page.waitForFunction(() => window.__AARANYA_GAME__.scene.getScene('GameScene').enemies.getLength() === 1);
  await page.waitForFunction(() => { const p = window.__AARANYA_GAME__.scene.getScene('GameScene').player; return p.elapsed >= p.attackUntil; });
  await page.evaluate(() => { const s = window.__AARANYA_GAME__.scene.getScene('GameScene'); const enemy = s.enemies.getChildren()[0]; s.player.setPosition(enemy.x, enemy.y); });
  await expect(page.getByLabel('2 hearts')).toBeVisible();
  await page.getByRole('button', { name: 'Pause', exact: true }).click(); await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Resume', exact: true }).click();
  await page.evaluate(() => { const s = window.__AARANYA_GAME__.scene.getScene('GameScene'); s.player.setPosition(s.level.exit.x, s.level.exit.y); });
  await expect(page.getByRole('heading', { name: 'LEVEL COMPLETE' })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('aaranya:v1')).completed)).toBe(true);
  await page.getByRole('button', { name: 'Replay' }).click(); await expect(page.getByLabel('3 hearts')).toBeVisible();
  await page.screenshot({ path: 'test-results/game-desktop.png' });
  await page.getByRole('link', { name: 'Leave level' }).click(); await expect(page.locator('canvas')).toHaveCount(0);
  await ready(page); await expect(page.locator('canvas')).toHaveCount(1);
  await page.setViewportSize({ width: 390, height: 844 });
  const before = await page.evaluate(() => window.__AARANYA_GAME__.scene.getScene('GameScene').player.x);
  const button = page.getByRole('button', { name: 'Move right' });
  const box = await button.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down(); await page.waitForTimeout(250); await page.mouse.up();
  expect(await page.evaluate(() => window.__AARANYA_GAME__.scene.getScene('GameScene').player.x)).toBeGreaterThan(before);
  await page.screenshot({ path: 'test-results/game-mobile.png' });
  expect(errors).toEqual([]);
});
