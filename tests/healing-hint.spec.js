import { test, expect } from '@playwright/test';

test('first healing box repeats its hint on each approach and ignores saved history', async ({ page }) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 844, height: 390 });
  await page.addInitScript(() => localStorage.setItem('aaranya:healing-hint:v1', 'seen'));
  await page.goto('/#/play/1-1');
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.player);
  expect(await page.evaluate(() => !!window.__AARANYA_GAME__.scene.getScene('GameScene').healingHint.panel)).toBe(false);
  await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    s.player.body.reset(s.healingHint.first.x - 100, 460);
  });
  await page.waitForFunction(() => window.__AARANYA_GAME__.scene.getScene('GameScene').healingHint.panel?.active);
  await page.screenshot({ path: 'test-results/healing-hint.png' });
  expect(await page.evaluate(() => localStorage.getItem('aaranya:healing-hint:v1'))).toBe('seen');
  await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    s.player.body.reset(90, 460); s.healingHint.update();
  });
  expect(await page.evaluate(() => window.__AARANYA_GAME__.scene.getScene('GameScene').healingHint.panel.active)).toBe(false);
  await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    s.player.body.reset(s.healingHint.first.x - 100, 460);
    s.healingHint.update();
  });
  expect(await page.evaluate(() => window.__AARANYA_GAME__.scene.getScene('GameScene').healingHint.panel.active)).toBe(true);
  expect(await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    s.player.setPosition(s.jumpHint.edges[2] - 20, 460);
    s.jumpHint.update();
    return s.jumpHint.edges.length === 3 && s.jumpHint.panel.visible;
  })).toBe(true);
});

test('two later boxes show independent hints after the first was already seen', async ({ page }) => {
  test.setTimeout(90000);
  await page.addInitScript(() => localStorage.setItem('aaranya:healing-hint:v1', 'seen'));
  await page.goto('/#/play/1-1');
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.player);
  const result = await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    const hint = s.healingHint;
    s.physics.pause();
    const shown = hint.targets.slice(1).map(crate => {
      s.player.setPosition(crate.x - 100, crate.y);
      hint.update();
      const panel = hint.panel;
      const active = !!panel?.active;
      hint.update();
      const samePanel = hint.panel === panel;
      panel?.destroy();
      hint.update();
      return { active, samePanel, repeated: !!hint.panel?.active,
        stored: localStorage.getItem(hint.storageKey(crate.itemId)) };
    });
    return { count: hint.targets.length, shown };
  });
  expect(result.count).toBe(3);
  expect(result.shown).toEqual(Array(2).fill({ active: true, samePanel: true, repeated: false, stored: 'seen' }));
});
