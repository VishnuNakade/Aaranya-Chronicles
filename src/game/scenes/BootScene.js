import Phaser from 'phaser';
export default class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }
  preload() { this.load.image('forest', '/assets/forest.png'); }
  create() {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x243c3b).fillRoundedRect(14, 24, 23, 23, 5); g.fillStyle(0x36251e).fillRect(13, 44, 10, 12).fillRect(29, 44, 11, 12);
    g.fillStyle(0xe6b27d).fillCircle(25, 17, 13); g.fillStyle(0x211e25).fillEllipse(24, 9, 30, 18).fillTriangle(10, 8, 7, 23, 23, 8);
    g.fillStyle(0x171d1a).fillRect(30, 16, 3, 4); g.fillStyle(0xc34742).fillRect(11, 26, 26, 6).fillTriangle(14, 27, 0, 20, 2, 36);
    g.fillStyle(0xe8c572).fillRect(20, 38, 17, 4); g.generateTexture('veer', 48, 58); g.clear();
    g.fillStyle(0x416455).fillRoundedRect(8, 22, 25, 18, 4); g.fillStyle(0x9da952).fillCircle(20, 16, 15).fillTriangle(2, 6, 2, 21, 16, 14).fillTriangle(38, 6, 38, 21, 25, 14);
    g.fillStyle(0x17291d).fillRect(12, 13, 5, 4).fillRect(24, 13, 5, 4); g.generateTexture('enemy', 40, 42); g.clear();
    g.fillStyle(0xffd66d).fillCircle(12, 12, 11); g.lineStyle(2, 0xaf762d).strokeCircle(12, 12, 8); g.lineStyle(2, 0xfff0ab).lineBetween(12, 7, 12, 17); g.generateTexture('coin', 24, 24); g.destroy();
    this.scene.start('GameScene');
  }
}
