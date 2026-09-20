import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import GameScene from './scenes/GameScene';
export function createGame(parent, bridge, level, settings) {
  return new Phaser.Game({ type: Phaser.AUTO, parent, width: 960, height: 540, backgroundColor: '#83b7ad',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    physics: { default: 'arcade', arcade: { gravity: { y: 1150 }, debug: false } },
    input: { activePointers: 4 }, scene: [BootScene, GameScene],
    callbacks: { preBoot(game) { game.registry.set('bridge', bridge); game.registry.set('level', level); game.registry.set('settings', settings); } },
  });
}
