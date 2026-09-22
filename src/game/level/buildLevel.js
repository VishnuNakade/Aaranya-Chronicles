// Geometry uses top-left x/y/width/height; interactive objects use center x/y.
export function buildLevel(scene, level) {
  const solids = scene.physics.add.staticGroup();
  for (const [x, y, width, height] of [...(level.ground ?? []), ...(level.platforms ?? [])]) {
    const block = scene.add.rectangle(x + width / 2, y + height / 2, width, height, 0x354941);
    solids.add(block);
    scene.add.rectangle(x + width / 2, y + 4, width, 8, 0x78a750);
    for (let dx = 8; dx < width - 12; dx += 42) scene.add.rectangle(x + dx, y + 20, 24, Math.min(12, height - 8), 0x566154, 0.7);
  }
  const spikes = scene.physics.add.staticGroup();
  for (const [x, y, width, height] of level.spikes ?? []) {
    const zone = scene.add.zone(x + width / 2, y + height / 2, width, height);
    spikes.add(zone);
    const art = scene.add.graphics();
    art.fillStyle(0xdce3d2).lineStyle(2, 0x596961);
    for (let dx = 0; dx < width; dx += 24) {
      const end = Math.min(dx + 24, width);
      art.fillTriangle(x + dx, y + height, x + (dx + end) / 2, y, x + end, y + height);
      art.strokeTriangle(x + dx, y + height, x + (dx + end) / 2, y, x + end, y + height);
    }
  }
  const crates = scene.physics.add.staticGroup();
  for (const config of level.crates ?? []) {
    const crate = scene.add.rectangle(config.x, config.y, 48, 48, 0xa87b49).setStrokeStyle(3, 0xead099);
    const braces = scene.add.graphics().lineStyle(4, 0xead099);
    braces.lineBetween(config.x - 18, config.y - 18, config.x + 18, config.y + 18);
    braces.lineBetween(config.x - 18, config.y + 18, config.x + 18, config.y - 18);
    crate.once('destroy', () => braces.destroy());
    crates.add(crate);
  }
  const checkpoints = scene.physics.add.staticGroup();
  for (const [index, config] of (level.checkpoints ?? []).entries()) {
    const zone = scene.add.zone(config.x, config.y, 42, 90);
    scene.add.rectangle(config.x, config.y, 5, 90, 0xe2d4a7);
    const flag = scene.add.triangle(config.x + 20, config.y - 27, 0, 0, 32, 10, 0, 22, 0x849389);
    zone.setData({ config, index, flag });
    checkpoints.add(zone);
  }
  const exit = level.exit;
  const gate = scene.add.zone(exit.x, exit.y, exit.width ?? 42, exit.height ?? 86);
  scene.physics.add.existing(gate, true);
  scene.add.rectangle(exit.x, exit.y, (exit.width ?? 42) + 10, (exit.height ?? 86) + 4, 0x283e38).setStrokeStyle(5, 0xd8b867);
  scene.add.rectangle(exit.x, exit.y, (exit.width ?? 42) - 12, (exit.height ?? 86) - 20, 0xb6e8a1, 0.8);
  scene.add.text(exit.x, exit.y - (exit.height ?? 86) / 2 - 22, exit.label ?? 'GATE', { fontSize: '12px', color: '#fff1ba', backgroundColor: '#203b32', padding: { x: 7, y: 5 } }).setOrigin(0.5);
  return { solids, spikes, crates, checkpoints, gate };
}
