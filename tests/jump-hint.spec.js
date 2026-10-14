import { test, expect } from '@playwright/test';
test('jump hint appears at the first two gaps including while airborne', async ({ page }) => {
  test.setTimeout(90000);
  await page.goto('/#/play/1-1');
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.player);
  const state = await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    const hidden = !s.jumpHint.panel.visible;
    const visible = s.jumpHint.edges.map(edge => {
      s.player.body.reset(edge + 20, 340); s.jumpHint.update();
      return s.jumpHint.panel.visible;
    });
    const third = s.level.ground[2];
    s.player.body.reset(third[0] + third[2] + 20, 340); s.jumpHint.update();
    return { hidden, visible, thirdHidden: !s.jumpHint.panel.visible, image: s.textures.exists('jump-hint-button') };
  });
  expect(state).toEqual({ hidden: true, visible: [true, true], thirdHidden: true, image: true });
});
