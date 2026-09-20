import Phaser from 'phaser';
export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'veer'); scene.add.existing(this); scene.physics.add.existing(this);
    this.body.setSize(24, 42).setOffset(12, 10); this.setCollideWorldBounds(true); this.facing = 1;
    this.lastGrounded = -1000; this.jumpUntil = -1000;
  }
  move(input, time) {
    const direction = Number(Boolean(input.right)) - Number(Boolean(input.left));
    this.setVelocityX(direction * 245);
    if (direction) { this.facing = direction; this.setFlipX(direction < 0); }
    if (this.body.blocked.down) this.lastGrounded = time;
    if (input.jump) this.jumpUntil = time + 120;
    if (time < this.jumpUntil && time - this.lastGrounded < 110) { this.setVelocityY(-510); this.jumpUntil = -1000; this.lastGrounded = -1000; }
    this.setAngle(direction && this.body.blocked.down ? Math.sin(time / 75) * 3 : 0);
  }
}
