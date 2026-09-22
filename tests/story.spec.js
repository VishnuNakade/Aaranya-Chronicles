import { test, expect } from '@playwright/test';
test.use({ storageState: { cookies: [], origins: [] } });

test('introduction, first world entry, skipping and persistence', async ({ page }) => {
  await page.goto('/#/story');
  await expect(page.getByText(/five ancient relics protected/)).toBeVisible();
  await page.getByRole('button', { name: 'Turn the page' }).click();
  await expect(page.getByText(/corrupted the five regions/)).toBeVisible();
  await page.getByRole('button', { name: 'Previous page' }).click();
  await expect(page.getByText(/five ancient relics protected/)).toBeVisible();
  await page.getByRole('button', { name: 'Skip story' }).click();
  await expect(page.getByRole('heading', { name: 'Beyond the village.' })).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.setViewportSize({ width: 844, height: 390 });
  await page.screenshot({ path: 'test-results/story-landscape.png', fullPage: true });
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.locator('.level')).toHaveCount(8);
  await page.reload(); await expect(page.locator('.level')).toHaveCount(8);
  const save = await page.evaluate(() => JSON.parse(localStorage.getItem('aaranya:v1')));
  expect(save.seenStories).toEqual(expect.arrayContaining(['intro', 'world-meadow']));
  expect(save.unlockedLevels).toEqual(['1-1']);
  await page.goto('/#/story/ending');
  await expect(page.getByRole('heading', { name: 'The five lights return.' })).toBeVisible();
  await page.getByRole('combobox', { name: 'Story chapter' }).selectOption('boss-woods');
  await expect(page.getByRole('heading', { name: 'A heart bound in thorns.' })).toBeVisible();
});

test('configured boss entry blocks gameplay; campaign completion exposes ending', async ({ page }) => {
  await page.route('**/src/game/data/levels*', async route => {
    const response = await route.fetch();
    await route.fulfill({ response, body: (await response.text()) + "\nlevels['1-1'].isBoss = true; levels['1-1'].endsCampaign = true;\n" });
  });
  await page.goto('/#/play/1-1');
  await page.getByRole('button', { name: 'Skip story' }).click();
  await expect(page.getByRole('heading', { name: 'The guardian stirs.' })).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.waitForFunction(() => window.__AARANYA_GAME__?.scene.getScene('GameScene')?.player?.body);
  await page.evaluate(() => { const s = window.__AARANYA_GAME__.scene.getScene('GameScene'); s.player.respawn(s.level.exit.x, s.level.exit.y); });
  await page.getByRole('link', { name: 'The final chapter' }).click();
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.getByRole('button', { name: 'Turn the page' }).click();
  await expect(page.getByRole('heading', { name: 'Home, at last.' })).toBeVisible();
  await page.getByRole('button', { name: 'Return to the kingdom' }).click();
  await expect(page.getByRole('heading', { name: 'World Map' })).toBeVisible();
});
