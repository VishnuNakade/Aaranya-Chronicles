import { test, expect } from '@playwright/test';

test('heal responds on second-finger press while moving and does not double consume', async ({ page }) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/#/play/1-1');
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.player);
  await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    s.player.health = 1; s.healing.charges = 3; s.publish();
  });
  const move = page.getByRole('button', { name: 'Move right', exact: true });
  const heal = page.getByRole('button', { name: /Heal \(/ });
  await move.dispatchEvent('pointerdown', { pointerId: 1, pointerType: 'touch', button: 0 });
  await heal.dispatchEvent('pointerdown', { pointerId: 2, pointerType: 'touch', button: 0, isPrimary: false });
  const state = () => page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    return { health: s.player.health, charges: s.healing.charges, moving: s.touch.right };
  });
  expect(await state()).toEqual({ health: 2, charges: 2, moving: true });
  await heal.dispatchEvent('pointerup', { pointerId: 2, pointerType: 'touch', button: 0 });
  await heal.dispatchEvent('click', { detail: 1 });
  expect(await state()).toEqual({ health: 2, charges: 2, moving: true });
  await move.dispatchEvent('pointerup', { pointerId: 1, pointerType: 'touch', button: 0 });
  await heal.focus();
  await page.keyboard.press('Enter');
  await expect.poll(async () => (await state()).health).toBe(3);
});
