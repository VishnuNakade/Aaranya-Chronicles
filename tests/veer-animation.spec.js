import { test, expect } from '@playwright/test';

test('jump recovery frames only play after ground contact and never lock controls', async ({ page }) => {
  await page.goto('/#/play/1-1');
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.player?.hasLanded);
  await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    window.landFrames = []; window.airFrames = [];
    const record = (anim, frame) => {
      if (anim.key === 'veer-land') window.landFrames.push({ frame: frame.textureFrame, grounded: s.player.body.blocked.down });
      if (anim.key === 'veer-jump') window.airFrames.push(frame.textureFrame);
    };
    s.player.on('animationstart', record); s.player.on('animationupdate', record);
  });
  await page.keyboard.press('ArrowUp');
  await page.waitForFunction(() => window.landFrames.length >= 2);
  expect(await page.evaluate(() => window.landFrames)).toEqual([
    { frame: 'veer-jump-5', grounded: true }, { frame: 'veer-jump-6', grounded: true },
  ]);
  expect(await page.evaluate(() => window.airFrames.every(frame => !['veer-jump-5', 'veer-jump-6'].includes(frame)))).toBe(true);
  const control = await page.evaluate(() => {
    const p = window.__AARANYA_GAME__.scene.getScene('GameScene').player;
    p.landingUntil = p.elapsed + 120; p.update({ right: true, jump: true }, 0);
    return [p.body.velocity.x, p.body.velocity.y, p.jumpsUsed];
  });
  expect(control).toEqual([245, -510, 1]);
});

test('idle frames keep boots on the same baseline without moving the body', async ({ page }) => {
  await page.goto('/#/play/1-1');
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.player?.body?.blocked.down);
  const result = await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene'); const p = s.player;
    s.setPaused(true);
    const source = s.textures.get('veer').getSourceImage();
    const canvas = document.createElement('canvas'); canvas.width = source.width; canvas.height = source.height;
    const ctx = canvas.getContext('2d'); ctx.drawImage(source, 0, 0);
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const soles = []; const bodies = [];
    for (const frame of s.anims.get('veer-idle').frames) {
      p.anims.setCurrentFrame(frame); p.body.updateFromGameObject();
      bodies.push([p.body.x, p.body.y, p.body.width, p.body.height]);
      let sole = 0;
      for (let y = 88; y < 120; y++) for (let x = 60; x < 110; x++) {
        const i = ((frame.frame.cutY + y) * canvas.width + frame.frame.cutX + x) * 4;
        if (pixels[i + 3] > 245) sole = Math.max(sole, y);
      }
      soles.push(sole);
    }
    return { soles, bodies };
  });
  expect(Math.max(...result.soles) - Math.min(...result.soles)).toBeLessThanOrEqual(2);
  expect(Math.min(...result.soles)).toBeGreaterThanOrEqual(105);
  expect(result.bodies.every(body => JSON.stringify(body) === JSON.stringify(result.bodies[0]))).toBe(true);
});

test('all final frames load in sequence with stable physics and swing-only damage', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (/missing.*texture|texture.*not found/i.test(message.text())) errors.push(message.text()); });
  await page.goto('/#/play/1-1');
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.player?.body?.blocked.down);
  const result = await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene'); const p = s.player;
    s.setPaused(true);
    const counts = { idle: 7, run: 8, jump: 5, fall: 7, attack: 9, hurt: 10, death: 7 };
    const ordered = Object.entries(counts).every(([state, count]) => {
      const frames = s.anims.get(`veer-${state}`).frames;
      return frames.length === count && frames.every((f, i) => f.textureFrame === `veer-${state}-${i}`);
    });
    const body = [p.body.width, p.body.height, p.body.x - p.x, p.body.y - p.y];
    const target = s.add.rectangle(p.x + 45, p.y, 20, 30);
    p.attack();
    const hits = [];
    for (let i = 0; i < 9; i++) {
      p.hitTargets.clear(); p.anims.setCurrentFrame(p.anims.currentAnim.frames[i]); hits.push(p.hitEnemy(target));
    }
    p.hitTargets.clear(); p.anims.setCurrentFrame(p.anims.currentAnim.frames[3]);
    const once = [p.hitEnemy(target), p.hitEnemy(target)];
    p.hitTargets.clear(); p.facing = -1; p.setFlipX(true); target.x = p.x - 45;
    const leftHit = p.hitEnemy(target);
    target.destroy();
    return { ordered, body, hits, once, leftHit, frameCount: s.textures.get('veer').getFrameNames().length };
  });
  expect(result).toMatchObject({ ordered: true, frameCount: 55, body: [24, 42, -12, -22],
    hits: [false, false, true, true, true, true, false, false, false], once: [true, false], leftHit: true });
  expect(errors).toEqual([]);
  await page.locator('.game-overlay').evaluateAll(nodes => nodes.forEach(n => n.style.visibility = 'hidden'));
  await page.screenshot({ path: 'test-results/veer-final-desktop.png' });
  await page.setViewportSize({ width: 844, height: 390 });
  await page.screenshot({ path: 'test-results/veer-final-mobile.png' });
});

test('attack animation plays every numbered frame, then falls back to idle', async ({ page }) => {
  await page.goto('/#/play/1-1');
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.player?.body?.blocked.down);
  await page.evaluate(() => {
    const p = window.__AARANYA_GAME__.scene.getScene('GameScene').player;
    window.swingFrames = [];
    p.on('animationstart', (anim, frame) => { if (anim.key === 'veer-attack') window.swingFrames.push(frame.index); });
    p.on('animationupdate', (anim, frame) => { if (anim.key === 'veer-attack') window.swingFrames.push(frame.index); });
  });
  await page.keyboard.press('Space'); await page.waitForTimeout(350);
  expect(await page.evaluate(() => [...new Set(window.swingFrames)])).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  expect(await page.evaluate(() => window.__AARANYA_GAME__.scene.getScene('GameScene').player.state)).toBe('idle');
});
