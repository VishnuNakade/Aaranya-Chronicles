// Fixed-size prototype frames can later be replaced by an artist's sprite atlas.
export function createVeerAnimations(scene) {
  const states = { idle: 2, run: 4, jump: 1, 'double-jump': 2, attack: 3, hurt: 1, death: 3 };
  const g = scene.make.graphics({ x: 0, y: 0 });
  for (const [state, count] of Object.entries(states)) {
    for (let frame = 0; frame < count; frame++) {
      const key = `veer-${state}-${frame}`;
      if (scene.textures.exists(key)) continue;
      g.clear();
      const airborne = state === 'jump' || state === 'double-jump';
      const bob = state === 'idle' ? frame : state === 'run' ? frame % 2 : 0;
      const stride = state === 'run' ? [0, 6, 0, -6][frame] : airborne ? 5 : 0;
      const y = 4 + bob + (state === 'death' ? frame * 5 : 0);
      g.fillStyle(0x36251e).fillRect(21 - stride, y + 40, 10, airborne ? 9 : 12).fillRect(35 + stride, y + 40, 10, airborne ? 8 : 12);
      g.fillStyle(state === 'hurt' ? 0xa76253 : 0x243c3b).fillRoundedRect(22, y + 20, 23, 23, 5);
      g.fillStyle(0xe6b27d).fillCircle(33, y + 13, 13);
      g.fillStyle(0x211e25).fillEllipse(32, y + 5, 30, 14).fillTriangle(18, y + 4, 15, y + 19, 31, y + 4);
      g.fillStyle(0x171d1a).fillRect(38, y + 12, 3, state === 'death' ? 1 : 4);
      g.fillStyle(0xc34742).fillRect(19, y + 22, 26, 6).fillTriangle(22, y + 23, 4, y + 15 + frame, 8, y + 32);
      g.fillStyle(0xe8c572).fillRect(28, y + 34, 17, 4);
      if (state === 'attack') {
        g.lineStyle(5, 0xe7f0dd).lineBetween(43, y + 29, 62, [8, 27, 43][frame]);
        g.lineStyle(4, 0xd5ae58).lineBetween(39, y + 25, 48, y + 34);
        g.lineStyle(2, 0xffe2a3, 0.7).strokeCircle(48, 29, 14 + frame * 3);
      } else if (state !== 'death') g.lineStyle(3, 0xd7ded2).lineBetween(45, y + 29, 53, y + 15);
      if (state === 'double-jump') g.lineStyle(2, 0xf0d788, 0.7).strokeEllipse(32, 55, 42 + frame * 8, 8);
      g.generateTexture(key, 64, 72);
    }
    if (!scene.anims.exists(`veer-${state}`)) scene.anims.create({ key: `veer-${state}`, frames: Array.from({ length: count }, (_, frame) => ({ key: `veer-${state}-${frame}` })), frameRate: state === 'idle' ? 3 : state === 'death' ? 7 : 12, repeat: ['idle', 'run', 'double-jump'].includes(state) ? -1 : 0 });
  }
  g.destroy();
}
