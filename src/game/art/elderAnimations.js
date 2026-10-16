export function preloadElder(scene) {
  scene.load.image('elder', `${import.meta.env.BASE_URL}assets/elder/elder-sheet.png`);
}

export function createElderAnimations(scene) {
  const texture = scene.textures.get('elder');
  const image = texture.getSourceImage();
  const canvas = document.createElement('canvas');
  canvas.width = image.width; canvas.height = image.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(image, 0, 0);
  const pixels = ctx.getImageData(0, 0, image.width, image.height).data;
  // The generated sheet has slightly uneven cage cells; keep debris in its own frame.
  const cageEdges = [0, 0.25, 0.5, 0.78, 1];
  for (let i = 0; i < 12; i++) {
    const row = Math.floor(i / 4), col = i % 4;
    const x0 = Math.floor(image.width * (row === 0 ? cageEdges[col] : col / 4));
    const x1 = Math.floor(image.width * (row === 0 ? cageEdges[col + 1] : (col + 1) / 4));
    const y0 = Math.floor(image.height * [0, 0.315, 0.63][row]);
    const y1 = Math.floor(image.height * [0.315, 0.63, 1][row]);
    let left = x1, right = x0, top = y1, bottom = y0;
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      if (pixels[(y * image.width + x) * 4 + 3] < 100) continue;
      left = Math.min(left, x); right = Math.max(right, x);
      top = Math.min(top, y); bottom = Math.max(bottom, y);
    }
    if (left > right) throw new Error(`Empty elder frame ${i}`);
    const frame = texture.add(`elder-${i}`, 0, left, top, right - left + 1, bottom - top + 1);
    let footLeft = right, footRight = left;
    for (let y = bottom - Math.floor((bottom - top) * 0.08); y <= bottom; y++) for (let x = left; x <= right; x++) {
      if (pixels[(y * image.width + x) * 4 + 3] < 100) continue;
      footLeft = Math.min(footLeft, x); footRight = Math.max(footRight, x);
    }
    frame.elderOriginX = i < 4 ? 0.5 : ((footLeft + footRight) / 2 - left) / frame.width;
  }
  for (const [name, indices, frameRate, repeat] of [
    ['release', [2, 3], 4, 0], ['walk', [4, 5, 6, 7], 7, -1], ['give', [8, 9, 10, 11], 2, 0],
  ]) scene.anims.create({ key: `elder-${name}`, frames: indices.map(i => ({ key: 'elder', frame: `elder-${i}` })), frameRate, repeat });
}
