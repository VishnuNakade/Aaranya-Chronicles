import { test, expect } from '@playwright/test';
import { healingSurface } from '../src/game/items/healingSurface';

test('healing smoke anchors below jumps and ignores overhead platforms and pits', () => {
  const level = { ground: [[0, 510, 650, 90]], platforms: [[260, 410, 140, 24]] };
  expect(healingSurface(level, 100, 300)).toBe(510);
  expect(healingSurface(level, 300, 300)).toBe(410);
  expect(healingSurface(level, 300, 480)).toBe(510);
  expect(healingSurface(level, 300, 410)).toBe(410);
  expect(healingSurface(level, 700, 300)).toBeNull();
  expect(healingSurface(level, 100, 600)).toBeNull();
});

test('airborne healing renders smoke on terrain instead of at Veer feet', async ({ page }) => {
  await page.goto('/#/play/1-1');
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.player?.body);
  const result = await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    s.player.respawn(100, 300); s.player.health = 2; s.healing.charges = 1;
    const healed = s.tryHeal();
    const effect = s.children.list.find(child => child.anims?.currentAnim?.key === 'health-healing');
    return { healed, health: s.player.health, effectY: effect?.y, feetY: s.player.body.bottom };
  });
  expect(result.healed).toBe(true);
  expect(result.health).toBe(3);
  expect(result.effectY).toBe(514);
  expect(result.feetY).toBeLessThan(result.effectY);
});
