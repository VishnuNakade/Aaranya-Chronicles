import Phaser from 'phaser';
export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, config) {
    super(scene, config.x, config.y, 'enemy'); scene.add.existing(this); scene.physics.add.existing(this);
    this.patrol = config; this.direction = 1; this.body.setSize(28, 30).setOffset(6, 8);
  }
  patrolStep() {
    if (this.x >= this.patrol.max) this.direction = -1;
    if (this.x <= this.patrol.min) this.direction = 1;
    this.setVelocityX(this.direction * 65); this.setFlipX(this.direction < 0);
  }
}
