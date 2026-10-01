import { test, expect } from '@playwright/test';
import HealingInventory from '../src/game/items/HealingInventory';

test('healing storage preserves charges at full life and prevents duplicate harvests', () => {
  const values = new Map(); const storage = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) };
  const inventory = new HealingInventory(storage);
  const player = { health: 3, maxHealth: 3, dead: false, emit() {} };
  expect(inventory.collect('1-1:0')).toBe(true); expect(inventory.collect('1-1:0')).toBe(false);
  expect(inventory.use(player)).toBe(false); expect(inventory.charges).toBe(1);
  const restored = new HealingInventory(storage); expect(restored.charges).toBe(1);
  player.health = 2; expect(restored.use(player)).toBe(true); expect(player.health).toBe(3);
  expect(new HealingInventory(storage).charges).toBe(0);
  restored.collect('1-1:1'); player.dead = true; player.health = 0;
  expect(restored.use(player)).toBe(false); expect(restored.charges).toBe(1);
});

test('two sword hits reveal and harvest the plant; all frames play; saved healing works', async ({ page }) => {
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/#/play/1-1');
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.player?.hasLanded);
  await expect(page.getByRole('button', { name: 'Heal (0 stored)', exact: true })).toBeDisabled();
  const counts = await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    s.enemies.clear(true, true);
    const crate = s.objects.crates.getChildren()[0];
    window.boxFrames = [0]; window.smokeFrames = [];
    crate.art.on('animationupdate', (a, f) => { if (a.key === 'health-box') window.boxFrames.push(f.index - 1); });
    s.events.on('postupdate', () => {
      for (const sprite of s.children.list) if (sprite.anims?.currentAnim?.key === 'health-healing') window.smokeFrames.push(sprite.anims.currentFrame.index - 1);
    });
    s.player.respawn(crate.x - 55, 490); s.player.facing = 1; s.player.setFlipX(false);
    return { frames: s.textures.get('health-items').getFrameNames().length, crates: s.objects.crates.getLength() };
  });
  expect(counts.frames).toBe(20); expect(counts.crates).toBeGreaterThan(2);
  await page.keyboard.press('Space');
  await page.waitForFunction(() => window.__AARANYA_GAME__.scene.getScene('GameScene').objects.crates.getChildren()[0].state === 'plant');
  expect(await page.evaluate(() => [...new Set(window.boxFrames)].sort((a, b) => a - b))).toEqual([0, 1, 2, 3, 4, 5]);
  await expect(page.getByRole('button', { name: 'Heal (0 stored)', exact: true })).toBeDisabled();
  await page.screenshot({ path: 'test-results/healing-plant-desktop.png' });
  await page.keyboard.press('Space');
  await expect(page.getByRole('button', { name: 'Heal (1 stored)', exact: true })).toBeEnabled();
  await page.waitForFunction(() => new Set(window.smokeFrames).size === 13);
  await page.getByRole('button', { name: 'Heal (1 stored)', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Heal (1 stored)', exact: true })).toBeEnabled();
  await page.reload();
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.player?.hasLanded);
  await expect(page.getByRole('button', { name: 'Heal (1 stored)', exact: true })).toBeEnabled();
  expect(await page.evaluate(() => window.__AARANYA_GAME__.scene.getScene('GameScene').objects.crates.getLength())).toBe(counts.crates);
  await page.evaluate(() => window.__AARANYA_GAME__.scene.getScene('GameScene').player.takeDamage());
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  expect(await page.evaluate(() => window.__AARANYA_GAME__.scene.getScene('GameScene').tryHeal())).toBe(false);
  await page.getByRole('button', { name: 'Resume', exact: true }).click();
  await page.keyboard.press('h');
  await expect(page.getByRole('progressbar', { name: 'Life', exact: true })).toHaveAttribute('value', '3');
  await expect(page.getByRole('button', { name: 'Heal (0 stored)', exact: true })).toBeDisabled();
  for (const viewport of [{ width: 844, height: 390 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    const button = page.getByRole('button', { name: 'Heal (0 stored)', exact: true });
    const bounds = await button.boundingBox(); expect(bounds.width).toBeGreaterThanOrEqual(44);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(viewport.width);
    await page.screenshot({ path: `test-results/healing-${viewport.width}.png` });
  }
  expect(errors).toEqual([]);
});
