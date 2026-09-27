import { healthAnimationConfig } from './healthAnimationConfig';
export function preloadHealth(scene) {
  scene.load.atlas('health-items', `${import.meta.env.BASE_URL}assets/health/health.png`, `${import.meta.env.BASE_URL}assets/health/health.json`);
}
export function createHealthAnimations(scene) {
  for (const [state, config] of Object.entries(healthAnimationConfig)) {
    const frames = Array.from({ length: config.count }, (_, i) => ({ key: 'health-items', frame: `${state}-${i}` }));
    for (const { frame } of frames) if (!scene.textures.get('health-items').has(frame)) throw new Error(`Missing health frame: ${frame}`);
    if (config.duration && !scene.anims.exists(`health-${state}`)) scene.anims.create({ key: `health-${state}`, frames, duration: config.duration, repeat: 0, skipMissedFrames: false });
  }
}
