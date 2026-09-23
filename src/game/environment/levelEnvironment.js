import { meadowDecorations } from './meadowDecorations';

// Migration adapter: existing gameplay rectangles remain the source of collision geometry.
export function meadowEnvironment(level) {
  return {
    world: 'world1', mode: 'assets',
    terrain: [
      ...level.ground.map(([x, y, width, height]) => ({ x, y, width, height, material: 'grass' })),
      ...level.platforms.map(([x, y, width, height]) => ({ x, y, width, height, material: 'floating', parts: { fill: { crop: [30, 195, 1710, 570], height: 48 } } })),
    ],
    decorations: meadowDecorations(level), props: [],
    preload: level.boss ? ['fallingRock'] : [],
    hazards: [
      ...(level.fallingRocks ?? []),
      ...level.spikes.map(([x, y, width, height]) => ({ type: 'spikes', asset: 'spikes', x, y, width, height })),
      // Pits are gaps in ground geometry; falling below killY retains existing respawn behavior.
      ...level.ground.slice(0, -1).flatMap(([x, , width], i) => {
        const next = level.ground[i + 1][0];
        return next > x + width ? [{ type: 'pit', x: x + width, width: next - x - width, y: level.killY }] : [];
      }),
    ],
  };
}
