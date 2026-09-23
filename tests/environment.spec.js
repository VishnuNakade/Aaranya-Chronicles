import { test, expect } from '@playwright/test';
import { levels } from '../src/game/data/levels';
import { world1 } from '../src/game/environment/world1';

test('all 19 supplied environment PNGs have real World 1 usages', () => {
  const used = new Set(world1.layers.map(layer => layer.asset));
  for (const level of Object.values(levels).filter(level => level.environment)) {
    const env = level.environment;
    for (const item of [...env.decorations, ...env.props, ...env.hazards]) if (item.asset) used.add(item.asset);
    for (const asset of env.preload ?? []) used.add(asset);
    for (const terrain of env.terrain) {
      const material = world1.materials[terrain.material];
      for (const part of ['fill', 'top', 'left', 'right']) if (material[part]) used.add(material[part]);
    }
  }
  const supplied = Object.keys(world1.assets).filter(key => !['crate', 'checkpoint', 'gate'].includes(key));
  expect(supplied).toHaveLength(19);
  expect([...used].sort()).toEqual(supplied.sort());
});

test('Meadow artwork is enabled by default on desktop and mobile', async ({ page }) => {
  await page.goto('/#/play/1-1');
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.player?.body?.blocked.down);
  expect(await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    s.setPaused(true);
    return s.environment.layers.map(layer => layer.texture?.key);
  })).toEqual(['world1:sky', 'world1:mountains', 'world1:temple', 'world1:forest', 'world1:foreground']);
  await page.locator('.game-overlay').evaluateAll(nodes => nodes.forEach(n => n.style.visibility = 'hidden'));
  expect(await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    return ['tree', 'bush', 'flower', 'rock', 'vine', 'ruins', 'stone'].every(asset =>
      s.environment.objects.some(object => object.texture?.key === `world1:${asset}` && !object.body));
  })).toBe(true);
  await page.screenshot({ path: 'test-results/meadow-art-desktop.png' });
  await page.setViewportSize({ width: 844, height: 390 });
  await page.screenshot({ path: 'test-results/meadow-art-mobile.png' });
});

test('worlds reuse a theme without sharing mutable placements or changing geometry', () => {
  expect(levels['1-1'].environment.world).toBe('world1');
  expect(levels['1-8'].environment.world).toBe('world1');
  expect(levels['2-1'].environment).toBeUndefined();
  expect(levels['1-1'].environment.terrain).not.toBe(levels['1-2'].environment.terrain);
  expect(levels['1-1'].environment.terrain.map(({ x, y, width, height }) => [x, y, width, height])).toEqual([...levels['1-1'].ground, ...levels['1-1'].platforms]);
  expect(levels['1-1'].environment.hazards.filter(h => h.type === 'pit').map(h => h.width)).toEqual([110, 100, 140, 140, 140]);
});

test('asset mode loads individual PNGs, separates bodies, supports missing assets and parallax', async ({ page }) => {
  test.setTimeout(60000);
  await page.route('**/src/game/data/levels*', async route => {
    const response = await route.fetch();
    await route.fulfill({ response, body: `${await response.text()}\nlevels['1-1'].environment = {
      ...levels['1-1'].environment, mode: 'assets',
      layers: [{ asset: 'sky', factor: 0, depth: -50, y: 0, height: 600 }, { asset: 'forest', factor: .4, depth: -20, y: 0, height: 600 }],
      decorations: [{ asset: 'tree', x: 400, y: 200, width: 150, height: 300 }],
      props: [{ asset: 'missing-test', x: 600, y: 450, width: 20, height: 30 }],
      hazards: [...levels['1-1'].environment.hazards, { type: 'fallingRock', asset: 'fallingRock', x: 100, y: 150 }]
    };` });
  });
  await page.goto('/#/play/1-1');
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.fallingRocks);
  const state = await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    return { sky: s.textures.exists('world1:sky'), tree: s.textures.exists('world1:tree'), reference: s.textures.exists('forest'),
      factors: s.environment.layers.map(l => l.scrollFactorX), decorativeBodies: s.environment.objects.filter(o => o.body).length,
      solidTypes: [...new Set(s.platforms.getChildren().map(o => o.type))], rocks: s.fallingRocks.rocks.length,
      missing: s.environment.objects.some(o => o.x === 600 && o.type === 'Rectangle') };
  });
  expect(state).toEqual({ sky: true, tree: true, reference: false, factors: [0, .4], decorativeBodies: 0, solidTypes: ['Zone'], rocks: 2, missing: true });
  await page.evaluate(() => { const s = window.__AARANYA_GAME__.scene.getScene('GameScene'); s.setPaused(true); });
  const remaining = await page.evaluate(() => window.__AARANYA_GAME__.scene.getScene('GameScene').fallingRocks.rocks[0].remaining);
  await page.waitForTimeout(200);
  expect(await page.evaluate(() => window.__AARANYA_GAME__.scene.getScene('GameScene').fallingRocks.rocks[0].remaining)).toBe(remaining);
  await page.setViewportSize({ width: 844, height: 390 });
  await page.screenshot({ path: 'test-results/environment-assets-mobile.png' });
});
