import Phaser from 'phaser';
import { createVeerAnimations } from '../art/veerAnimations';
import { createGuardianTextures } from '../art/guardianTextures';
export default class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }
  preload() { this.load.image('forest', '/assets/forest.png'); }
  create() {
    createVeerAnimations(this);
    createGuardianTextures(this);
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x69ba96).fillEllipse(20, 26, 38, 28);
    g.fillStyle(0xa6efd0).fillEllipse(14, 20, 12, 6);
    g.fillStyle(0x19382e).fillRect(12, 25, 4, 5).fillRect(26, 25, 4, 5);
    g.generateTexture('slime', 40, 42); g.clear();
    g.fillStyle(0x416455).fillRoundedRect(8, 22, 25, 18, 4); g.fillStyle(0x9da952).fillCircle(20, 16, 15).fillTriangle(2, 6, 2, 21, 16, 14).fillTriangle(38, 6, 38, 21, 25, 14);
    g.fillStyle(0x17291d).fillRect(12, 13, 5, 4).fillRect(24, 13, 5, 4); g.generateTexture('enemy', 40, 42); g.clear();
    g.fillStyle(0xffd66d).fillCircle(12, 12, 11); g.lineStyle(2, 0xaf762d).strokeCircle(12, 12, 8); g.lineStyle(2, 0xfff0ab).lineBetween(12, 7, 12, 17); g.generateTexture('coin', 24, 24); g.destroy();
    this.scene.start('GameScene');
  }
}
