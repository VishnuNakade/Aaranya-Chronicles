import { enemyAnimationConfig } from './enemyAnimationConfig';
export function preloadEnemy(scene) {
  scene.load.atlas('enemy1', `${import.meta.env.BASE_URL}assets/enemy1/enemy1.png`, `${import.meta.env.BASE_URL}assets/enemy1/enemy1.json`);
}
export function createEnemyAnimations(scene) {
  for (const [state, config] of Object.entries(enemyAnimationConfig)) {
    const frames = Array.from({ length: config.count }, (_, i) => ({ key: 'enemy1', frame: `enemy1-${state}-${i}` }));
    for (const { frame } of frames) if (!scene.textures.get('enemy1').has(frame)) throw new Error(`Missing enemy frame: ${frame}`);
    scene.anims.create({ key: `enemy1-${state}`, frames, repeat: config.repeat, skipMissedFrames: false,
      ...(config.duration ? { duration: config.duration } : { frameRate: config.frameRate }) });
  }
}
