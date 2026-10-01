import { test, expect } from '@playwright/test';
import { levels } from '../src/game/data/levels';

test('First Steps has no spike geometry or artwork; other levels retain spikes', () => {
  expect(levels['1-1'].spikes).toEqual([]);
  expect(levels['1-1'].environment.hazards.filter(hazard => hazard.type === 'spikes')).toEqual([]);
  expect(levels['1-2'].spikes.length).toBeGreaterThan(0);
  expect(levels['1-2'].environment.hazards.some(hazard => hazard.type === 'spikes')).toBe(true);
});

test('running First Steps scene has no spike sprites or collision bodies', async ({ page }) => {
  await page.goto('/#/play/1-1');
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.player?.body);
  const state = await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    s.player.respawn(1690, 480);
    s.cameras.main.stopFollow(); s.cameras.main.setScroll(1210, 0);
    return { bodies: s.objects.spikes.getLength(), sprites: s.children.list.filter(object => object.texture?.key?.includes('spikes')).length };
  });
  expect(state).toEqual({ bodies: 0, sprites: 0 });
  await page.screenshot({ path: 'test-results/first-steps-no-spikes.png' });
});
