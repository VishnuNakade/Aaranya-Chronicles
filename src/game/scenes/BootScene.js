import Phaser from 'phaser';
import { preloadEnvironment } from '../environment/assets';
import { createVeerAnimations, preloadVeer } from '../art/veerAnimations';
import { createGuardianTextures } from '../art/guardianTextures';
import { preloadEnemy, createEnemyAnimations } from '../art/enemyAnimations';
export default class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }
  preload() {
    this.load.maxParallelDownloads = 4;
    preloadVeer(this);
    preloadEnemy(this);
    const level = this.registry.get('level');
    if (level.environment) preloadEnvironment(this, level.environment);
    else this.load.image('forest', '/assets/forest.png');
  }
  create() {
    createVeerAnimations(this);
    createEnemyAnimations(this);
    createGuardianTextures(this);
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0xffd66d).fillCircle(12, 12, 11); g.lineStyle(2, 0xaf762d).strokeCircle(12, 12, 8); g.lineStyle(2, 0xfff0ab).lineBetween(12, 7, 12, 17); g.generateTexture('coin', 24, 24); g.clear();
    g.fillStyle(0xffffff).fillRect(0, 0, 5, 5); g.generateTexture('fx-spark', 5, 5); g.clear();
    g.lineStyle(5, 0xffedbb, 0.9).beginPath().arc(6, 40, 32, -1.15, 1.15).strokePath();
    g.lineStyle(2, 0xffffff, 0.8).beginPath().arc(6, 40, 24, -1, 1).strokePath();
    g.generateTexture('fx-slash', 44, 80); g.destroy();
    this.scene.start('GameScene');
  }
}
