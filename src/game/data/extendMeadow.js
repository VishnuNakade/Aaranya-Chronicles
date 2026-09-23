// Additional challenge sections leave the introductory route intact.
export function extendMeadow(level, chapter) {
  const sections = 3 + Math.floor((chapter - 1) / 2);
  const gap = 140 + (chapter - 1) * 8;
  let end = level.width;
  level.fallingRocks = [];
  for (let i = 0; i < sections; i++) {
    const x = end + gap;
    level.ground.push([x, 510, 480, 90]);
    level.platforms.push([x + 110, 400, 120, 24], [x + 310, 320, 110, 24]);
    level.coins.push([end + gap / 2, 410], [x + 150, 362], [x + 350, 282]);
    level.enemies.push({ type: i % 2 ? 'goblin' : 'slime', x: x + 370, y: 470, min: x + 280, max: x + 435 });
    level.spikes.push([x + 205, 490, 48 + Math.min(chapter - 1, 3) * 8, 20]);
    level.checkpoints.push({ id: `sanctuary-${i}`, x: x + 40, y: 465, spawn: { x: x + 40, y: 460 } });
    if (i % 2 === 1) level.fallingRocks.push({ type: 'fallingRock', asset: 'fallingRock', x: x + 270, y: 110, size: 28,
      warningMs: Math.max(900, 1300 - chapter * 50), triggerRadius: 100, speed: 230, cooldownMs: 3200, impactY: 503 });
    end = x + 480;
  }
  level.width = end;
  level.exit = { ...level.exit, x: end - 55 };
}
