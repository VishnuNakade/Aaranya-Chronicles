import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { wardenAnimationConfig as enemyAnimationConfig } from '../src/game/art/wardenAnimationConfig.js';
const enemyVisual = { width: 160, height: 128, footX: 80, footY: 108 };

const root = fileURLToPath(new URL('../', import.meta.url));
const sourceDir = path.join(root, 'src/assets/mini boss/Forest Warden');
const outputDir = path.join(root, 'public/assets/warden');
const frames = [];
for (const [state, config] of Object.entries(enemyAnimationConfig)) {
  const sequence = name => Number(name.match(/-(\d+)\.png$/i)?.[1]);
  const names = (await readdir(path.join(sourceDir, state))).filter(name => /\.png$/i.test(name)).sort((a, b) => sequence(a) - sequence(b));
  if (names.length !== config.count || names.some((name, i) => sequence(name) !== i + 1)) throw new Error(`Invalid ${state} sequence`);
  for (const [index, name] of names.entries()) frames.push({ name: `warden-${state}-${index}`, path: path.join(sourceDir, state, name), anchor: 0.5,
    registration: config.registration?.[index], registeredHeight: config.registeredHeight, alignFeet: true });
}
const columns = 8;
const width = columns * enemyVisual.width;
const height = Math.ceil(frames.length / columns) * enemyVisual.height;
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const page = await browser.newPage();
  await page.evaluate(({ width, height }) => {
    window.atlas = document.createElement('canvas'); window.atlas.width = width; window.atlas.height = height;
  }, { width, height });
  const atlasFrames = {};
  for (const [index, frame] of frames.entries()) {
    const x = index % columns * enemyVisual.width; const y = Math.floor(index / columns) * enemyVisual.height;
    await page.evaluate(async ({ data, x, y, anchor, visual, registration, registeredHeight, alignFeet }) => {
      const image = new Image(); image.src = `data:image/png;base64,${data}`; await image.decode();
      let scale = registration ? registeredHeight / (registration.footY - registration.headY) : Math.min(144 / image.width, 88 / image.height);
      let sourceRoot = registration ? registration.rootX : image.width * anchor;
      let sourceFoot = image.height * .97;
      if (alignFeet) {
        // Ignore transparent canvas padding when positioning the boot soles.
        const probe = document.createElement('canvas'); probe.width = image.width; probe.height = image.height;
        const pixels = probe.getContext('2d'); pixels.drawImage(image, 0, 0);
        const rgba = pixels.getImageData(0, 0, image.width, image.height).data;
        let top = image.height, bottom = 0;
        for (let row = 0; row < image.height; row++) {
          for (let col = 0; col < image.width; col++) {
            if (rgba[(row * image.width + col) * 4 + 3] >= 128) { top = Math.min(top, row); bottom = row + 1; }
          }
        }
        sourceFoot = bottom;
        if (registeredHeight && bottom > top) {
          scale = registeredHeight / (bottom - top);
          // Use the boots, not the moving scarf or sword, as the horizontal anchor.
          let left = image.width, right = 0;
          for (let row = Math.floor(bottom - (bottom - top) * 0.10); row < bottom; row++) {
            for (let col = 0; col < image.width; col++) {
              if (rgba[(row * image.width + col) * 4 + 3] >= 128) { left = Math.min(left, col); right = Math.max(right, col + 1); }
            }
          }
          sourceRoot = (left + right) / 2;
        }
      }
      const w = image.width * scale, h = image.height * scale;
      const rootX = sourceRoot * scale;
      const footY = registration ? registration.footY * scale : sourceFoot * scale;
      const ctx = window.atlas.getContext('2d'); ctx.imageSmoothingQuality = 'high';
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, visual.width, visual.height); ctx.clip();
      ctx.drawImage(image, x + visual.footX - rootX, y + visual.footY - footY, w, h); ctx.restore();
    }, { data: (await readFile(frame.path)).toString('base64'), x, y, anchor: frame.anchor, visual: enemyVisual,
      registration: frame.registration, registeredHeight: frame.registeredHeight, alignFeet: frame.alignFeet });
    atlasFrames[frame.name] = { frame: { x, y, w: enemyVisual.width, h: enemyVisual.height }, rotated: false, trimmed: false,
      spriteSourceSize: { x: 0, y: 0, w: enemyVisual.width, h: enemyVisual.height }, sourceSize: { w: enemyVisual.width, h: enemyVisual.height } };
  }
  const png = await page.evaluate(() => window.atlas.toDataURL('image/png').split(',')[1]);
  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, 'warden.png'), Buffer.from(png, 'base64'));
  await writeFile(path.join(outputDir, 'warden.json'), JSON.stringify({ frames: atlasFrames, meta: { image: 'warden.png', size: { w: width, h: height }, scale: '1' } }, null, 2));
  console.log(`Packed ${frames.length} frames into ${width}x${height}: ${Math.round(Buffer.from(png, 'base64').length / 1024)} KB`);
} finally { await browser.close(); }
