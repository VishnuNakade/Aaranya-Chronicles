// Keep tree silhouettes clear of raised platforms and root them below the grass lip.
function treeOpening(level, x, width) {
  const blocked = level.platforms.filter(([px, , pw]) => px < x + width && px + pw > x).sort((a, b) => a[0] - b[0]);
  let cursor = x + 18;
  for (const [px, , pw] of blocked) {
    if (px - cursor >= 190) return cursor;
    cursor = Math.max(cursor, px + pw + 16);
  }
  return x + width - cursor >= 190 ? cursor : null;
}

export function meadowDecorations(level) {
  return level.ground.flatMap(([x, y, width], index) => {
    const mirrored = index % 2 === 1;
    const treeX = treeOpening(level, x, width);
    const height = 265 + index % 3 * 18;
    const placements = [
      { asset: 'ruins', x: x + width - 235, y: y - 155, width: 220, height: 174, depth: -7, flipX: mirrored },
      { asset: 'stone', x: x + width - 95, y: y - 31, width: 65, height: 43, depth: -5 },
      { asset: 'rock', x: x + 285, y: y - 32, width: 70, height: 49, depth: -5, flipX: mirrored },
      { asset: 'bush', x: x + 170, y: y - 32, width: 84, height: 39, depth: -2 },
      { asset: 'flower', x: x + 155, y: y - 18, width: 17, height: 21, depth: -1 },
      { asset: 'flower', x: x + 255, y: y - 14, width: 13, height: 17, depth: -1, flipX: true },
    ];
    if (treeX !== null) {
      placements.push({ asset: 'tree', x: treeX, y: y - height + 8, width: 185, height, depth: -8, flipX: mirrored });
      // Both ends sit within the canopy instead of floating above it.
      placements.push({ asset: 'vine', x: treeX + 28, y: y - height + 78, width: 122, height: 73, depth: -6, flipX: mirrored });
    }
    return placements.filter(item => item.x + item.width <= x + width);
  });
}
