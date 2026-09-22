import { test, expect } from '@playwright/test';
async function ready(page) {
  await page.goto('/#/play/1-1');
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.player?.body?.blocked.down);
}
async function snapshot(page) {
  return page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    return { elapsed:s.elapsedMs, player:[s.player.x,s.player.y,s.player.elapsed,s.player.texture.key], enemies:s.enemies.getChildren().map(e=>[e.x,e.y,e.elapsed]), camera:[s.cameras.main.scrollX,s.cameras.main.scrollY], coin:s.coins.getChildren()[0].alpha, timer:s.testTimer.getElapsed(), fired:s.testFired };
  });
}
test('pause freezes all scene systems; settings preserves the run; resume and restart work', async ({ page }) => {
  await ready(page);
  await page.keyboard.down('ArrowRight'); await page.waitForTimeout(180);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name:'Paused', exact:true })).toBeVisible();
  await page.keyboard.up('ArrowRight');
  await page.evaluate(() => { const s=window.__AARANYA_GAME__.scene.getScene('GameScene'); window.testOriginalPlayer=s.player; s.testFired=false; s.testTimer=s.time.delayedCall(500,()=>{s.testFired=true;}); });
  const before=await snapshot(page);
  await page.keyboard.press('w'); await page.waitForTimeout(800);
  expect(await snapshot(page)).toEqual(before);
  await page.getByRole('button',{name:'Settings',exact:true}).click();
  await page.getByRole('checkbox',{name:'Sound effects'}).uncheck();
  await page.getByRole('checkbox',{name:'Reduced motion'}).check();
  expect(await page.evaluate(() => { const s=window.__AARANYA_GAME__.scene.getScene('GameScene'); return s.player===window.testOriginalPlayer && s.settings.sound===false && s.player.reducedMotion && s.sys.isPaused(); })).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading',{name:'Paused',exact:true})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.waitForFunction(()=>window.__AARANYA_GAME__.scene.getScene('GameScene').testFired);
  expect(await page.evaluate(()=>window.__AARANYA_GAME__.scene.getScene('GameScene').player.body.velocity.x)).toBe(0);
  await page.getByRole('button',{name:'Pause',exact:true}).click();
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:'test-results/pause-mobile.png'});
  await page.getByRole('button',{name:'Restart',exact:true}).click();
  await page.waitForFunction(()=>{const s=window.__AARANYA_GAME__.scene.getScene('GameScene');return s.player!==window.testOriginalPlayer && s.sys.isActive();});
  await expect(page.getByLabel('3 hearts')).toBeVisible();
  await page.getByRole('button',{name:'Pause',exact:true}).click();
  await page.getByRole('link',{name:'Exit to Menu'}).click();
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.getByRole('heading',{name:'AARANYA CHRONICLES'})).toBeVisible();
});
test('game over freezes scene; retry resets run; map exit cleans up', async ({ page }) => {
  await ready(page);
  const die = () => page.evaluate(()=>{ const s=window.__AARANYA_GAME__.scene.getScene('GameScene'); for(let i=0;i<3;i++){s.player.invincibleUntil=0;s.player.takeDamage();} });
  await die();
  await expect(page.getByRole('heading',{name:'Game Over',exact:true})).toBeVisible();
  expect(await page.evaluate(()=>window.__AARANYA_GAME__.scene.getScene('GameScene').sys.isPaused())).toBe(true);
  await page.setViewportSize({width:844,height:390});
  await page.screenshot({path:'test-results/game-over-landscape.png'});
  await page.getByRole('button',{name:'Retry',exact:true}).click();
  await expect(page.getByLabel('3 hearts')).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(1);
  expect(await page.evaluate(()=>window.__AARANYA_GAME__.scene.getScene('GameScene').coinsCollected)).toBe(0);
  await die();
  await page.getByRole('link',{name:'Back to World Map'}).click();
  await expect(page.getByRole('heading',{name:'World Map',exact:true})).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
});
