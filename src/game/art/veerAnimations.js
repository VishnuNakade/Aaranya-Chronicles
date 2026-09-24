import { veerAnimationConfig, veerLanding } from './veerAnimationConfig';

export const veerFrames = Object.fromEntries(Object.entries(veerAnimationConfig).map(([state, config]) =>
  [state, Array.from({ length: config.count }, (_, i) => ({ key: 'veer', frame: `veer-${state}-${i}` }))]));

export function preloadVeer(scene) {
  if (!scene.textures.exists('veer')) scene.load.atlas('veer', `${import.meta.env.BASE_URL}assets/veer/veer.png`, `${import.meta.env.BASE_URL}assets/veer/veer.json`);
}

export function createVeerAnimations(scene) {
  const atlas = scene.textures.get('veer');
  const missing = Object.values(veerFrames).flat().filter(({ frame }) => !atlas.has(frame));
  if (missing.length) throw new Error(`Veer atlas frames missing: ${missing.map(f => f.frame).join(', ')}`);
  for (const [state, config] of Object.entries(veerAnimationConfig)) {
    if (scene.anims.exists(`veer-${state}`)) continue;
    const timing = config.duration ? { duration: config.duration } : { frameRate: config.frameRate };
    const selected = config.airborneFrames ? config.airborneFrames.map(n => veerFrames[state][n - 1]) : veerFrames[state];
    // Explicit hold durations override Phaser's default frame interval.
    const frames = config.frameHolds ? selected.map((frame, i) => ({ ...frame, duration: config.frameHolds[i] })) : selected;
    scene.anims.create({ key: `veer-${state}`, frames, ...timing, repeat: config.repeat, skipMissedFrames: false });
  }
  if (!scene.anims.exists('veer-double-jump')) scene.anims.create({ key: 'veer-double-jump', frames: veerAnimationConfig.jump.airborneFrames.map(n => veerFrames.jump[n - 1]), duration: veerAnimationConfig.jump.duration, repeat: 0, skipMissedFrames: false });
  if (!scene.anims.exists('veer-land')) scene.anims.create({ key: 'veer-land', frames: veerLanding.frames.map(n => veerFrames.jump[n - 1]), duration: veerLanding.duration, repeat: 0, skipMissedFrames: false });
}
