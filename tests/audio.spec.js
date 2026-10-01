import { test, expect } from '@playwright/test';
test('sound assets load and audio switches, pauses and mutes', async ({ page }) => {
  await page.goto('/#/play/1-1');
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.audio);
  await page.mouse.click(400, 300);
  const result = await page.evaluate(() => {
    const s = window.__AARANYA_GAME__.scene.getScene('GameScene');
    s.settings.sound = true; s.audio.update();
    const loaded = Object.keys(s.audio.sounds).every(key => s.cache.audio.exists(key));
    const enemy = s.enemies.getChildren()[0]; enemy.aggro = true; s.audio.update();
    const combat = s.audio.sounds['combat-music'].isPlaying;
    const normal = s.audio.sounds['meadow-ambience'].isPlaying;
    const volume = s.audio.sounds['combat-music'].volume;
    s.audio.effect('veer-sword'); const sword = s.audio.sounds['veer-sword'].isPlaying;
    s.setPaused(true); const paused = !Object.values(s.audio.sounds).some(sound => sound.isPlaying);
    s.setPaused(false); s.settings.sound = false; s.audio.update();
    const muted = !Object.values(s.audio.sounds).some(sound => sound.isPlaying);
    return { loaded, combat, normal, volume, sword, paused, muted };
  });
  expect(result.volume).toBeCloseTo(0.14);
  expect(result).toMatchObject({ loaded: true, combat: true, normal: false, sword: true, paused: true, muted: true });
});
