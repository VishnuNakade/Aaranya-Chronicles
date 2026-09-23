// Paths are relative to src/assets/world1. Originals are never modified.
export const world1 = {
  id: 'world1',
  assets: {
    sky: 'backgrounds/sky.png', mountains: 'backgrounds/far_mountains.png',
    temple: 'backgrounds/distant_temple.png', forest: 'backgrounds/forest_back.png',
    foreground: 'backgrounds/forest_front.png',
    grass: 'tiles/grass_top.png', dirt: 'tiles/dirt.png', stone: 'tiles/stone.png',
    edgeLeft: 'tiles/grass_edge_left.png', edgeRight: 'tiles/grass_edge_right.png', platform: 'tiles/platform.png',
    tree: 'decorations/tree_01.png', bush: 'decorations/bush_01.png', flower: 'decorations/flower_01.png',
    rock: 'decorations/rock_01.png', vine: 'decorations/vine_01.png', ruins: 'decorations/ruins_01.png',
    spikes: 'hazards/spikes.png', fallingRock: 'hazards/falling_rock.png',
    crate: 'props/crate.png', checkpoint: 'props/checkpoint.png', gate: 'props/gate.png',
  },
  layers: [
    { asset: 'sky', factor: 0, depth: -50, y: 0, height: 600 },
    { asset: 'mountains', factor: 0.12, depth: -40, y: 100, height: 500 },
    { asset: 'temple', factor: 0.25, depth: -30, y: 100, height: 500 },
    { asset: 'forest', factor: 0.45, depth: -20, y: 0, height: 600 },
    { asset: 'foreground', factor: 0.8, depth: -10, y: 0, height: 600 },
  ],
  materials: {
    grass: { fill: 'dirt', top: 'grass', left: 'edgeLeft', right: 'edgeRight', topHeight: 16, edgeWidth: 24 },
    stone: { fill: 'stone' },
    floating: { fill: 'platform' },
  },
  // Source frames remove transparent padding without changing original PNGs.
  crops: {
    dirt: [30, 150, 1700, 700],
    grass: [45, 365, 1680, 185],
    spikes: [15, 50, 1740, 735],
  },
};
