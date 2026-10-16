export const blazefangDeathDuration = 2100;
export const blazefangAnimationConfig = {
  idle: { count: 6, frameRate: 5, repeat: -1, registeredHeight: 88 },
  run: { count: 8, frameRate: 12, repeat: -1 },
  jump: { count: 8, duration: 600, repeat: 0 },
  attack: { count: 8, duration: 800, repeat: 0 },
  hurt: { count: 4, duration: 400, repeat: 0 },
  death: { sourceCount: 16, count: 8, duration: blazefangDeathDuration, repeat: 0 },
};

export function preloadBlazefang(scene) {
  scene.load.atlas('blazefang', `${import.meta.env.BASE_URL}assets/blazefang/blazefang.png`, `${import.meta.env.BASE_URL}assets/blazefang/blazefang.json`);
}

export function createBlazefangAnimations(scene) {
  for (const [state, config] of Object.entries(blazefangAnimationConfig)) {
    const frames = Array.from({ length: config.count }, (_, i) => ({ key: 'blazefang', frame: `blazefang-${state}-${i}` }));
    // Reuse the Warden's body-free green smoke ending, not its character poses.
    if (state === 'death') frames.push(...[12, 13, 14, 15].map(i => ({ key: 'warden', frame: `warden-death-${i}` })));
    for (const { key, frame } of frames) if (!scene.textures.get(key).has(frame)) throw new Error(`Missing Blazefang animation frame: ${frame}`);
    scene.anims.create({ key: `blazefang-${state}`, frames, repeat: config.repeat, skipMissedFrames: false,
      ...(config.duration ? { duration: config.duration } : { frameRate: config.frameRate }) });
  }
    for (const [phase, indices, duration] of [['rise', [0, 1, 2], 240], ['fall', [3, 4, 5], 240], ['land', [6, 7], 160]]) {
      scene.anims.create({ key: `blazefang-jump-${phase}`, duration, repeat: 0,
        frames: indices.map(i => ({ key: 'blazefang', frame: `blazefang-jump-${i}` })) });
    }
  scene.anims.create({ key: 'blazefang-fall', frames: [{ key: 'blazefang', frame: 'blazefang-jump-5' }], repeat: -1 });
}
