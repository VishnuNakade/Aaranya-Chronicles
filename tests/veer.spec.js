import { test, expect } from '@playwright/test';

async function ready(page) {
  await page.goto('/#/play/1-1');
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.player?.body?.blocked.down);
}
async function read(page) {
  return page.evaluate(() => {
    const p = window.__AARANYA_GAME__.scene.getScene('GameScene').player;
    return { state: p.state, health: p.health, jumps: p.jumpsUsed, vx: p.body.velocity.x, vy: p.body.velocity.y, facing: p.facing, elapsed: p.elapsed, dead: p.dead, enabled: p.body.enable };
  });
}
test('Veer jump limit, facing, attack cooldown, invincibility, pause and death', async ({ page }) => {
  await ready(page);
  expect((await read(page)).state).toBe('idle');
  await page.keyboard.down('a'); await page.waitForTimeout(90); await page.keyboard.up('a');
  expect((await read(page)).facing).toBe(-1);
  await page.keyboard.down('d'); await page.waitForTimeout(90);
  expect((await read(page)).state).toBe('run');
  expect((await read(page)).facing).toBe(1);
  await page.keyboard.up('d');
  await page.keyboard.press('w');
  await page.waitForFunction(() => window.__AARANYA_GAME__.scene.getScene('GameScene').player.jumpsUsed === 1);
  await page.waitForTimeout(100);
  await page.keyboard.press('ArrowUp');
  await page.waitForFunction(() => window.__AARANYA_GAME__.scene.getScene('GameScene').player.state === 'double-jump');
  await page.waitForTimeout(100);
  const secondJumpVelocity = (await read(page)).vy;
  await page.keyboard.press('w'); await page.waitForTimeout(50);
  expect((await read(page)).jumps).toBe(2);
  expect((await read(page)).vy).toBeGreaterThan(secondJumpVelocity);
  await page.waitForFunction(() => window.__AARANYA_GAME__.scene.getScene('GameScene').player.state === 'idle');
  expect((await read(page)).jumps).toBe(0);
  await page.keyboard.press('Space');
  await page.waitForFunction(() => window.__AARANYA_GAME__.scene.getScene('GameScene').player.state === 'attack');
  expect((await read(page)).jumps).toBe(0);
  expect(await page.evaluate(() => { const p = window.__AARANYA_GAME__.scene.getScene('GameScene').player; p.attack(); return p.attack(); })).toBe(false);
  await page.evaluate(() => { const p = window.__AARANYA_GAME__.scene.getScene('GameScene').player; p.takeDamage(); p.takeDamage(); });
  expect((await read(page)).health).toBe(2);
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  const pausedTime = (await read(page)).elapsed;
  await page.waitForTimeout(1400);
  expect((await read(page)).elapsed).toBe(pausedTime);
  expect(await page.evaluate(() => window.__AARANYA_GAME__.scene.getScene('GameScene').player.takeDamage())).toBe(false);
  await page.getByRole('button', { name: 'Resume', exact: true }).click();
  for (let remaining = 1; remaining >= 0; remaining--) {
    await page.waitForFunction(() => { const p = window.__AARANYA_GAME__.scene.getScene('GameScene').player; return p.elapsed >= p.invincibleUntil; });
    await page.evaluate(() => window.__AARANYA_GAME__.scene.getScene('GameScene').player.takeDamage());
    expect((await read(page)).health).toBe(remaining);
  }
  expect((await read(page)).state).toBe('death');
  expect((await read(page)).enabled).toBe(false);
  expect(await page.evaluate(() => window.__AARANYA_GAME__.scene.getScene('GameScene').player.attack())).toBe(false);
  await expect(page.getByRole('heading', { name: 'Game Over' })).toBeVisible();
  await page.getByRole('button', { name: 'Retry' }).click();
  await expect(page.getByLabel('3 hearts')).toBeVisible();
  expect((await read(page)).dead).toBe(false);
});

test('touch jump, double jump and attack buttons', async ({ browser }) => {
  const context = await browser.newContext({ baseURL: 'http://127.0.0.1:5173', hasTouch: true, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.addInitScript(() => { if (!localStorage.getItem('aaranya:v1')) localStorage.setItem('aaranya:v1', JSON.stringify({ seenStories: ['world-meadow'] })); });
  await page.goto('http://127.0.0.1:5173');
  await ready(page);
  await page.getByRole('button', { name: 'Jump', exact: true }).tap();
  await page.waitForFunction(() => window.__AARANYA_GAME__.scene.getScene('GameScene').player.jumpsUsed === 1);
  await page.getByRole('button', { name: 'Jump', exact: true }).tap();
  await page.waitForFunction(() => window.__AARANYA_GAME__.scene.getScene('GameScene').player.jumpsUsed === 2);
  await page.getByRole('button', { name: 'Attack', exact: true }).tap();
  await page.waitForFunction(() => window.__AARANYA_GAME__.scene.getScene('GameScene').player.state === 'attack');
  await page.screenshot({ path: 'test-results/veer-touch.png' });
  await context.close();
});
