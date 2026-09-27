import { readdir, readFile, mkdir, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { healthAnimationConfig, healthVisual } from '../src/game/art/healthAnimationConfig.js';
const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.join(root, 'src/assets/health');
const out = path.join(root, 'public/assets/health');
const frames = [];
for (const [state, config] of Object.entries(healthAnimationConfig)) {
  const names = (await readdir(path.join(source, config.folder))).filter(n => /\.png$/i.test(n) && !n.includes('transparent'))
    .sort((a, b) => Number(a.match(/-(\d+)\.png$/)?.[1] ?? 1) - Number(b.match(/-(\d+)\.png$/)?.[1] ?? 1));
  if (names.length !== config.count) throw new Error(`Expected ${config.count} ${state} frames, got ${names.length}`);
  for (const [i, name] of names.entries()) {
    let file = path.join(source, config.folder, name);
    if (state === 'plant') {
      const cutout = path.join(source, config.folder, 'plant-transparent.png');
      try { await access(cutout); file = cutout; } catch { /* Use the supplied original until a cutout is available. */ }
    }
    frames.push({ name: `${state}-${i}`, file, state });
  }
}
const size = healthVisual.width, columns = 5, width = columns * size, height = Math.ceil(frames.length / columns) * size;
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const page = await browser.newPage();
  await page.evaluate(({ width, height }) => { window.sheet = document.createElement('canvas'); window.sheet.width = width; window.sheet.height = height; }, { width, height });
  const atlas = {};
  for (const [i, frame] of frames.entries()) {
    const x = i % columns * size, y = Math.floor(i / columns) * size;
    await page.evaluate(async ({ data, x, y, size, footY }) => {
      const img = new Image(); img.src = `data:image/png;base64,${data}`; await img.decode();
      const probe = document.createElement('canvas'); probe.width = img.width; probe.height = img.height;
      const pc = probe.getContext('2d'); pc.drawImage(img, 0, 0);
      const rgba = pc.getImageData(0, 0, img.width, img.height).data;
      let bottom = img.height;
      outer: for (let row = img.height - 1; row >= 0; row--) for (let col = 0; col < img.width; col++) {
        if (rgba[(row * img.width + col) * 4 + 3] >= 100) { bottom = row + 1; break outer; }
      }
      const scale = Math.min(144 / img.width, 140 / img.height);
      const ctx = window.sheet.getContext('2d'); ctx.imageSmoothingQuality = 'high';
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, size, size); ctx.clip();
      ctx.drawImage(img, x + size / 2 - img.width * scale / 2, y + footY - bottom * scale, img.width * scale, img.height * scale); ctx.restore();
    }, { data: (await readFile(frame.file)).toString('base64'), x, y, size, footY: healthVisual.footY });
    atlas[frame.name] = { frame: { x, y, w: size, h: size }, rotated: false, trimmed: false, spriteSourceSize: { x: 0, y: 0, w: size, h: size }, sourceSize: { w: size, h: size } };
  }
  await mkdir(out, { recursive: true });
  await writeFile(path.join(out, 'health.png'), Buffer.from(await page.evaluate(() => window.sheet.toDataURL('image/png').split(',')[1]), 'base64'));
  await writeFile(path.join(out, 'health.json'), JSON.stringify({ frames: atlas, meta: { image: 'health.png', size: { w: width, h: height }, scale: '1' } }, null, 2));
  console.log(`Packed all ${frames.length} health frames into ${width}x${height}`);
} finally { await browser.close(); }
