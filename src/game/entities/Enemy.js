import Phaser from 'phaser';
export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, config, stats) {
    super(scene, config.x, config.y, stats.texture); scene.add.existing(this); scene.physics.add.existing(this);
    this.patrol = config; this.stats = stats; this.direction = 1;
    this.health = this.maxHealth = stats.health;
    this.elapsed = 0; this.hurtUntil = 0; this.invincibleUntil = 0; this.dead = false;
    this.state = 'patrol'; this.coinDrop = config.coinDrop ?? 1;
    this.body.setSize(28, 30).setOffset(6, 8);
    this.setCollideWorldBounds(true);
    this.healthBar = scene.add.graphics();
    this.once('destroy', () => this.healthBar.destroy());
  }
  update(player, delta) {
    this.elapsed += delta;
    if (this.dead) {
      if (this.elapsed >= this.deathUntil) { this.emit('coin-drop', { x: this.x, y: this.y - 12, count: this.coinDrop }); this.destroy(); }
      else if (!this.anims.isPlaying) { this.setAlpha(Math.max(0, (this.deathUntil - this.elapsed) / 400)); this.setScale(1, Math.max(0.15, (this.deathUntil - this.elapsed) / 400)); }
      return;
    }
    this.clearTint();
    if (this.elapsed < this.invincibleUntil) this.setTint(0xffccbb);
    if (this.elapsed >= this.hurtUntil) this.behave(player);
    this.healthBar.clear().fillStyle(0x172a23).fillRect(this.x - 19, this.y - 30, 38, 5).fillStyle(0xdad47b).fillRect(this.x - 18, this.y - 29, 36 * this.health / this.maxHealth, 3);
  }
  behave() { this.patrolStep(); }
  patrolStep() {
    this.state = 'patrol';
    if (this.x >= this.patrol.max) this.direction = -1;
    if (this.x <= this.patrol.min) this.direction = 1;
    if (this.body.blocked.left) this.direction = 1;
    if (this.body.blocked.right) this.direction = -1;
    this.setVelocityX(this.direction * this.stats.speed); this.setFlipX(this.direction < 0);
  }
  takeDamage(amount = 1, sourceX = this.x - 1) {
    if (this.dead || this.elapsed < this.invincibleUntil || amount <= 0) return false;
    this.health = Math.max(0, this.health - amount);
    this.invincibleUntil = this.elapsed + 320; this.hurtUntil = this.elapsed + 220;
    this.state = 'hurt'; this.setVelocity(this.x < sourceX ? -140 : 140, -130);
    this.emit('damage', this.health);
    if (!this.health) {
      this.dead = true; this.state = 'death'; this.deathUntil = this.elapsed + 400;
      this.body.enable = false; this.setVelocity(0); this.healthBar.clear();
      if (this.stats.deathAnimation && this.scene.anims.exists(this.stats.deathAnimation)) this.play(this.stats.deathAnimation);
      this.emit('death');
    }
    return true;
  }
  contact(player) {
    if (!this.dead && this.elapsed >= this.hurtUntil) player.takeDamage(this.x);
  }
}
