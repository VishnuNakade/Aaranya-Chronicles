import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { veerAnimationConfig, veerVisual } from '../src/game/art/veerAnimationConfig.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const sourceDir = path.join(root, 'src/assets/veer-animation-assets');
const outputDir = path.join(root, 'public/assets/veer');
const frames = [];
for (const [state, config] of Object.entries(veerAnimationConfig)) {
  const sequence = name => Number(name.match(/\((\d+)\)\.png$/i)?.[1]);
  const names = (await readdir(path.join(sourceDir, state))).filter(name => /\.png$/i.test(name)).sort((a, b) => sequence(a) - sequence(b));
  if (names.length !== config.count || names.some((name, i) => sequence(name) !== i + 1)) throw new Error(`Invalid ${state} sequence`);
  for (const [index, name] of names.entries()) frames.push({ name: `veer-${state}-${index}`, path: path.join(sourceDir, state, name), anchor: config.anchors?.[index] ?? config.anchorX,
    registration: config.registration?.[index], registeredHeight: config.registeredHeight });
}
const columns = 8;
const width = columns * veerVisual.width;
const height = Math.ceil(frames.length / columns) * veerVisual.height;
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const page = await browser.newPage();
  await page.evaluate(({ width, height }) => {
    window.atlas = document.createElement('canvas'); window.atlas.width = width; window.atlas.height = height;
  }, { width, height });
  const atlasFrames = {};
  for (const [index, frame] of frames.entries()) {
    const x = index % columns * veerVisual.width; const y = Math.floor(index / columns) * veerVisual.height;
    await page.evaluate(async ({ data, x, y, anchor, visual, registration, registeredHeight }) => {
      const image = new Image(); image.src = `data:image/png;base64,${data}`; await image.decode();
      const scale = registration ? registeredHeight / (registration.footY - registration.headY) : Math.min(144 / image.width, 88 / image.height);
      const w = image.width * scale; const h = image.height * scale;
      const rootX = registration ? registration.rootX * scale : w * anchor;
      const footY = registration ? registration.footY * scale : h * .97;
      const ctx = window.atlas.getContext('2d'); ctx.imageSmoothingQuality = 'high';
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, visual.width, visual.height); ctx.clip();
      ctx.drawImage(image, x + visual.footX - rootX, y + visual.footY - footY, w, h); ctx.restore();
    }, { data: (await readFile(frame.path)).toString('base64'), x, y, anchor: frame.anchor, visual: veerVisual,
      registration: frame.registration, registeredHeight: frame.registeredHeight });
    atlasFrames[frame.name] = { frame: { x, y, w: veerVisual.width, h: veerVisual.height }, rotated: false, trimmed: false,
      spriteSourceSize: { x: 0, y: 0, w: veerVisual.width, h: veerVisual.height }, sourceSize: { w: veerVisual.width, h: veerVisual.height } };
  }
  const png = await page.evaluate(() => window.atlas.toDataURL('image/png').split(',')[1]);
  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, 'veer.png'), Buffer.from(png, 'base64'));
  await writeFile(path.join(outputDir, 'veer.json'), JSON.stringify({ frames: atlasFrames, meta: { image: 'veer.png', size: { w: width, h: height }, scale: '1' } }, null, 2));
  console.log(`Packed ${frames.length} frames into ${width}x${height}: ${Math.round(Buffer.from(png, 'base64').length / 1024)} KB`);
} finally { await browser.close(); }
