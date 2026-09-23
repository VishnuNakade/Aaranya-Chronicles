import { test, expect } from '@playwright/test';

test('bounded effects, floating pickups, pause, reduced motion and restart cleanup', async ({ page }) => {
  await page.goto('/#/play/1-1');
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.effects);
  const state = await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    const coin = s.coins.getChildren()[0];
    const floating = s.tweens.getTweensOf(coin).length === 1;
    s.effects.burst(s.player.x, s.player.y, 0xffd66d, 100);
    s.player.attack();
    s.effects.checkpoint(s.objects.checkpoints.getChildren()[0]);
    s.setPaused(true);
    return { floating, particles: s.effects.particles.filter(p => p.visible).length, slash: s.effects.slash.visible, alpha: s.effects.particles[0].alpha };
  });
  expect(state).toMatchObject({ floating: true, particles: 24, slash: true });
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => window.__AARANYA_GAME__.scene.getScene('GameScene').effects.particles[0].alpha)).toBe(state.alpha);
  await page.getByRole('button', { name: 'Resume', exact: true }).click();
  await page.waitForTimeout(600);
  expect(await page.evaluate(() => window.__AARANYA_GAME__.scene.getScene('GameScene').effects.particles.filter(p => p.visible).length)).toBe(0);
  const reduced = await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    s.bridge.emit('settings', { ...s.settings, reducedMotion: true });
    s.effects.burst(100, 100); s.effects.sword(s.player); s.effects.shake();
    return { visible: s.effects.particles.some(p => p.visible) || s.effects.slash.visible,
      bobbing: s.coins.getChildren().some(c => s.tweens.getTweensOf(c).length > 0), shaking: s.cameras.main.shakeEffect.isRunning };
  });
  expect(reduced).toEqual({ visible: false, bobbing: false, shaking: false });
  await page.evaluate(() => { const s = window.__AARANYA_GAME__.scene.getScene('GameScene'); s.bridge.emit('restart'); });
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => window.__AARANYA_GAME__.scene.getScene('GameScene').children.list.filter(c => c.texture?.key === 'fx-spark').length)).toBe(24);
  await page.setViewportSize({ width: 844, height: 390 });
  await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    s.bridge.emit('settings', { ...s.settings, reducedMotion: false });
    s.player.respawn(300, 365); s.effects.burst(300, 345); s.effects.sword(s.player); s.cameras.main.centerOn(300, 365); s.setPaused(true);
  });
  // Hide the React pause overlay for an effects-only visual capture.
  await page.locator('.game-overlay').evaluateAll(nodes => nodes.forEach(n => n.style.visibility = 'hidden'));
  await page.screenshot({ path: 'test-results/effects-mobile.png' });
});
