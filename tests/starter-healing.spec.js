import { test, expect } from '@playwright/test';

test('First Steps grants two healing charges only once, even after spending and replaying', async ({ page }) => {
  test.setTimeout(90000);
  await page.goto('/#/play/1-1');
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.healing);
  await expect(page.getByRole('button', { name: 'Heal (2 stored)', exact: true })).toBeEnabled();
  await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    s.player.health = 1;
    s.healing.use(s.player); s.healing.use(s.player);
    s.scene.restart();
  });
  await expect(page.getByRole('button', { name: 'Heal (0 stored)', exact: true })).toBeDisabled();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Heal (0 stored)', exact: true })).toBeDisabled();
  const otherLevel = await page.evaluate(async () => {
    const { default: HealingInventory } = await import('/src/game/items/HealingInventory.js');
    let data = JSON.stringify({ charges: 3 });
    const storage = { getItem: () => data, setItem: (_, value) => { data = value; } };
    const inventory = new HealingInventory(storage);
    const granted = inventory.grantStarterGift('1-2');
    return { granted, charges: inventory.charges };
  });
  expect(otherLevel).toEqual({ granted: false, charges: 3 });
});
