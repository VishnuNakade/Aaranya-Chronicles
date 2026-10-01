export const wardenAnimationConfig = {
  idle: { count: 8, frameRate: 5, repeat: -1 },
  run: { count: 8, frameRate: 12, repeat: -1 },
  jump: { count: 8, duration: 600, repeat: 0 },
  attack: { count: 12, duration: 960, repeat: 0 },
  hurt: { count: 8, duration: 400, repeat: 0 },
  death: { count: 16, duration: 1600, repeat: 0 },
};
export function preloadWarden(scene) {
  scene.load.atlas('warden', `${import.meta.env.BASE_URL}assets/warden/warden.png`, `${import.meta.env.BASE_URL}assets/warden/warden.json`);
}
export function createWardenAnimations(scene) {
  for (const [state, config] of Object.entries(wardenAnimationConfig)) {
    const frames = Array.from({ length: config.count }, (_, i) => ({ key: 'warden', frame: `warden-${state}-${i}` }));
    for (const { frame } of frames) if (!scene.textures.get('warden').has(frame)) throw new Error(`Missing Warden frame: ${frame}`);
    scene.anims.create({ key: `warden-${state}`, frames, repeat: config.repeat, skipMissedFrames: false,
      ...(config.duration ? { duration: config.duration } : { frameRate: config.frameRate }) });
  }
  scene.anims.create({ key: 'warden-fall', frames: [{ key: 'warden', frame: 'warden-jump-4' }], repeat: -1 });
}
