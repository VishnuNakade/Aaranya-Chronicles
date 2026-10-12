import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import GameScene from './scenes/GameScene';
export function createGame(parent, bridge, level, settings) {
  const viewport = () => ({ width: Math.round(540 * (parent.clientWidth / (parent.clientHeight || 540))), height: 540 });
  const size = viewport();
  const game = new Phaser.Game({ type: Phaser.AUTO, parent, ...size, backgroundColor: '#83b7ad',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    physics: { default: 'arcade', arcade: { gravity: { y: 1150 }, debug: false } },
    input: { activePointers: 4 }, scene: [BootScene, GameScene],
    callbacks: { preBoot(game) { game.registry.set('bridge', bridge); game.registry.set('level', level); game.registry.set('settings', settings); } },
  });
  const observer = new ResizeObserver(() => {
    if (!game.isBooted || !parent.clientWidth || !parent.clientHeight) return;
    const next = viewport();
    if (game.scale.width !== next.width) game.scale.setGameSize(next.width, next.height);
    game.scale.refresh();
  });
  observer.observe(parent);
  game.events.once(Phaser.Core.Events.DESTROY, () => observer.disconnect());
  return game;
}
