import Phaser from 'phaser';
import Posture from '../combat/Posture';
import { enemyCombat as stats } from '../combat/enemyCombat';
import { enemyAttackFrames } from '../art/enemyAnimationConfig';
import { swordFrameActive } from '../art/veerAnimationConfig';
import EnemyNavigator from './EnemyNavigator';

export default class Raider extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, config, profile = {}) {
    super(scene, config.x, config.y, profile.texture ?? 'enemy1', `${profile.texture ?? 'enemy1'}-idle-0`);
    this.profile = profile; this.stats = { ...stats, ...profile.stats }; this.animationPrefix = profile.texture ?? 'enemy1';
    scene.add.existing(this); scene.physics.add.existing(this);
    this.setOrigin(0.5, 88 / 128);
    this.body.setSize(24, 42).setOffset(68, 66);
    this.setCollideWorldBounds(true);
    this.patrol = config; this.health = this.maxHealth = this.stats.health;
    this.posture = new Posture(); this.navigator = new EnemyNavigator(scene);
    this.elapsed = 0; this.direction = 1; this.state = 'patrol'; this.dead = false;
    this.invincibleUntil = 0; this.hurtUntil = 0; this.phaseUntil = 0; this.combo = 0;
    this.coinDrop = config.coinDrop ?? 1; this.aggro = false;
    this.patrolWait = 1600;
    this.healthBar = scene.add.graphics().setDepth(12);
    this.cue = scene.add.text(this.x, this.y - 80, '', { fontSize: '18px', color: '#ffe292', stroke: '#201619', strokeThickness: 3 }).setOrigin(0.5).setDepth(12);
    this.once('destroy', () => { this.healthBar.destroy(); this.cue.destroy(); });
    this.animate('idle');
  }
  animate(name) { this.play(`${this.animationPrefix}-${name}`, true); }
  update(player, delta) {
    const stats = this.stats;
    this.elapsed += delta;
    if (this.dead) {
      if (!this.deathUntil && ((this.body.blocked.down && this.body.velocity.y >= 0) || this.y > this.scene.killY)) { this.setVelocity(0); this.animate('death'); this.deathUntil = this.elapsed + (this.profile.deathDuration ?? 700); }
      if (this.deathUntil && this.elapsed >= this.deathUntil) { this.emit('coin-drop', { x: this.x, y: Math.min(this.y, 480) - 12, count: this.coinDrop }); this.destroy(); }
      return;
    }
    if (this.y > this.scene.killY) { this.health = 0; this.die(); return; }
    this.posture.update(this.elapsed, delta);
    this.clearTint(); this.cue.setText('');
    const dx = player.x - this.x, dy = player.y - this.y;
    const distance = Math.hypot(dx, dy);
    this.aggro = !player.dead && distance < (this.aggro ? stats.loseTarget : stats.detection);
    if (this.elapsed < this.hurtUntil || this.elapsed < this.posture.brokenUntil) {
      this.state = 'hurt'; this.animate('hurt'); this.setTint(0xffb4a0);
    } else if (this.state === 'windup') {
      this.setVelocityX(0); this.setTint(0xffcf70); this.cue.setText('!'); this.animate('idle');
      if (this.elapsed >= this.phaseUntil) { this.state = 'attack'; this.phaseUntil = this.elapsed + stats.attackDuration; this.swingHit = false; this.play(`${this.animationPrefix}-attack`); this.emit('attack'); }
    } else if (this.state === 'attack') {
      this.setVelocityX(0);
      if (!this.swingHit && (this.profile.attackFrames ?? enemyAttackFrames).includes(this.anims.currentFrame?.index) && this.anims.currentAnim?.key === `${this.animationPrefix}-attack`) {
        const hitbox = new Phaser.Geom.Rectangle(this.direction > 0 ? this.x + 8 : this.x - 76, this.y - 28, 68, 56);
        if (!player.dead && Phaser.Geom.Intersects.RectangleToRectangle(hitbox, player.body)) {
          this.swingHit = true;
          if (swordFrameActive(player) && player.facing === -this.direction) {
            player.damagePosture(stats.postureDamage); this.posture.damage(stats.postureDamage, this.elapsed);
            this.scene.effects.hit(this);
          } else player.takeDamage(this.x);
        }
      }
      if (this.elapsed >= this.phaseUntil) { this.state = 'recover'; this.phaseUntil = this.elapsed + stats.sequence[this.combo].recovery; this.combo = (this.combo + 1) % stats.sequence.length; }
    } else if (this.state === 'recover' && this.elapsed < this.phaseUntil) {
      this.setVelocityX(0); this.animate('idle'); this.cue.setText('...');
    } else if (this.aggro) {
      if (Math.abs(dx) <= stats.range && Math.abs(dy) < 45 && this.body.blocked.down) {
        this.direction = Math.sign(dx) || this.direction; this.setFlipX(this.direction < 0);
        this.state = 'windup'; this.phaseUntil = this.elapsed + stats.sequence[this.combo].warning;
      } else { this.state = 'chase'; this.navigator.update(this, player); this.animate(this.body.blocked.down ? 'run' : this.body.velocity.y < 0 ? 'jump' : 'fall'); }
    } else {
      this.state = 'patrol';
      if (this.elapsed < this.patrolWait) { this.setVelocityX(0); this.animate(this.body.blocked.down ? 'idle' : 'fall'); }
      else {
        if ((this.direction > 0 && this.x >= this.patrol.max) || this.body.blocked.right) { this.direction = -1; this.patrolWait = this.elapsed + 1600; }
        if ((this.direction < 0 && this.x <= this.patrol.min) || this.body.blocked.left) { this.direction = 1; this.patrolWait = this.elapsed + 1600; }
        this.setVelocityX(this.direction * stats.patrolSpeed); this.setFlipX(this.direction < 0); this.animate(this.body.blocked.down ? 'run' : 'fall');
      }
    }
    this.drawBars();
  }
  drawBars() {
    this.cue.setPosition(this.x, this.y - 88);
    this.healthBar.clear().fillStyle(0x172a23).fillRect(this.x - 24, this.y - 72, 48, 12)
      .fillStyle(0xdf6272).fillRect(this.x - 23, this.y - 71, 46 * this.health / this.maxHealth, 4)
      .fillStyle(0xefc367).fillRect(this.x - 23, this.y - 65, 46 * this.posture.value / this.posture.max, 3);
  }
  takeDamage(amount = 1, sourceX = this.x - 1) {
    const stats = this.stats;
    if (this.dead || this.elapsed < this.invincibleUntil) return false;
    const guarded = ['windup', 'attack'].includes(this.state) && (sourceX - this.x) * this.direction > 0 && this.elapsed >= this.posture.brokenUntil;
    const broken = this.posture.damage(guarded ? 40 : 35, this.elapsed);
    this.invincibleUntil = this.elapsed + (guarded ? 300 : stats.invincibility);
    if (!guarded) this.health = Math.max(0, this.health - amount);
    if (!guarded || broken) {
      this.hurtUntil = this.elapsed + (broken ? 900 : (this.profile.hurtDuration ?? 220)); this.state = 'hurt'; this.animate('hurt');
      this.setVelocity(this.x < sourceX ? -170 : 170, this.body.blocked.down ? 0 : this.body.velocity.y);
    }
    this.emit('damage', this.health);
    if (!this.health) this.die();
    return true;
  }
  die() {
    this.dead = true; this.state = 'death';
    // Cancel the fatal hit's upward knockback, but keep gravity and terrain collisions.
    this.setVelocity(0, Math.max(0, this.body.velocity.y));
    this.healthBar.clear(); this.cue.setText(''); this.animate('fall'); this.emit('death');
  }
  // Contact alone is harmless; only the visible sword swing can deal damage.
  contact() {}
}
