// Select the first terrain surface below the effect, never an overhead platform.
export function healingSurface(level, x, feetY) {
  const surfaces = [...(level.ground ?? []), ...(level.platforms ?? [])]
    .filter(([left, top, width]) => x >= left && x <= left + width && top >= feetY - 6)
    .sort((a, b) => a[1] - b[1]);
  return surfaces[0]?.[1] ?? null;
}
