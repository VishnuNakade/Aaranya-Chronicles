const images = import.meta.glob('../../assets/dog/*.png', { eager: true, query: '?url', import: 'default' });
import sittingSheet from '../../assets/dog/dog-sit-sheet.png';

export const dogVisual = { cageHeight: 58, dogHeight: 32, sittingHeight: 37 };

// Transparent canvas margins differ between source frames. Align visible pixels,
// not the full PNG rectangle, to the same ground baseline.
function trimFrame(texture, name, x, y, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(texture.getSourceImage(), x, y, width, height, 0, 0, width, height);
  const pixels = ctx.getImageData(0, 0, width, height).data;
  let left = width, top = height, right = 0, bottom = 0;
  for (let row = 0; row < height; row++) for (let col = 0; col < width; col++) {
    if (pixels[(row * width + col) * 4 + 3] < 100) continue;
    left = Math.min(left, col); right = Math.max(right, col);
    top = Math.min(top, row); bottom = Math.max(bottom, row);
  }
  if (left <= right) texture.add(name, 0, x + left, y + top, right - left + 1, bottom - top + 1);
}

export function preloadDog(scene) {
  scene.load.image('dog-sitting', sittingSheet);
  for (const [path, url] of Object.entries(images)) {
    const number = path.match(/-(\d+)\.png$/)?.[1];
    if (number) scene.load.image(`dog-${number}`, url);
  }
}

export function createDogAnimations(scene) {
  for (let n = 1; n <= 10; n++) {
    const texture = scene.textures.get(`dog-${n}`);
    if (!texture.has('grounded')) {
      const source = texture.getSourceImage();
      trimFrame(texture, 'grounded', 0, 0, source.width, source.height);
    }
  }
  const sitting = scene.textures.get('dog-sitting');
  if (!sitting.has('sit')) {
    trimFrame(sitting, 'sit', 905, 0, 580, 724);
    trimFrame(sitting, 'wag', 1490, 0, 682, 724);
  }
  if (!scene.anims.exists('dog-sit')) scene.anims.create({ key: 'dog-sit', frames: [
    { key: 'dog-sitting', frame: 'sit', duration: 450 },
    { key: 'dog-sitting', frame: 'wag', duration: 300 },
  ], frameRate: 3, repeat: -1 });
  for (const [key, frames, frameRate, repeat] of [
    ['dog-release', [3, 4, 5], 5, 0],
    ['dog-run', [6, 7, 8, 9], 8, -1],
  ]) {
    if (!scene.anims.exists(key)) scene.anims.create({ key, frames: frames.map(n => ({ key: `dog-${n}`, frame: 'grounded' })), frameRate, repeat });
  }
}
