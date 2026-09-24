import Phaser from 'phaser';
import { veerVisual, swordFrameActive, veerLanding } from '../art/veerAnimationConfig';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, { reducedMotion = false } = {}) {
    super(scene, x, y, 'veer', 'veer-idle-0');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(veerVisual.originX, veerVisual.originY);
    const { width, height, offsetX, offsetY } = veerVisual.body;
    this.body.setSize(width, height).setOffset(offsetX, offsetY);
    this.setCollideWorldBounds(true);
    this.maxHealth = 3;
    this.health = this.maxHealth;
    this.facing = 1;
    this.state = 'idle';
    this.dead = false;
    this.elapsed = 0;
    this.jumpsUsed = 0;
    this.wasGrounded = undefined;
    this.hasLanded = false;
    this.landingUntil = 0;
    this.lastGrounded = -Infinity;
    this.invincibleUntil = 0;
    this.hurtUntil = 0;
    this.attackUntil = 0;
    this.nextAttack = 0;
    this.hitTargets = new Set();
    this.reducedMotion = reducedMotion;
    this.play('veer-idle');
  }

  update(input, delta) {
    // Gameplay time stops during pause, preserving attack and invincibility windows.
    this.elapsed += delta;
    if (this.dead) {
      if (this.deathUntil === undefined && (this.body.blocked.down || this.y > this.scene.killY)) this.startDeathAnimation();
      if (!this.deathReported && this.deathUntil !== undefined && this.elapsed >= this.deathUntil) {
        this.deathReported = true;
        this.emit('death-complete');
      }
      return;
    }
    const grounded = this.body.blocked.down && this.body.velocity.y >= 0;
    if (grounded && this.wasGrounded === false && this.hasLanded) this.landingUntil = this.elapsed + veerLanding.duration;
    if (grounded) this.hasLanded = true;
    this.wasGrounded = grounded;
    if (grounded) { this.jumpsUsed = 0; this.lastGrounded = this.elapsed; }
    const direction = Number(Boolean(input.right)) - Number(Boolean(input.left));
    if (this.elapsed >= this.hurtUntil) {
      this.setVelocityX(direction * 245);
      if (direction && this.elapsed >= this.attackUntil) { this.facing = direction; this.setFlipX(direction < 0); }
      if (input.jump) {
        if (!grounded && this.jumpsUsed === 0 && this.elapsed - this.lastGrounded > 110) this.jumpsUsed = 1;
        if (this.jumpsUsed < 2) {
          this.jumpsUsed++;
          this.lastGrounded = -Infinity;
          this.setVelocityY(this.jumpsUsed === 2 ? -475 : -510);
          this.emit('jump', this.jumpsUsed);
        }
      }
      if (input.attack) this.attack();
    }
    this.setAlpha(this.elapsed < this.invincibleUntil && !this.reducedMotion && Math.floor(this.elapsed / 90) % 2 ? 0.45 : 1);
    this.setState(this.elapsed < this.hurtUntil ? 'hurt' : this.elapsed < this.attackUntil ? 'attack' : !grounded || this.body.velocity.y < 0 ? (this.body.velocity.y > 0 ? 'fall' : this.jumpsUsed === 2 ? 'double-jump' : 'jump') : direction ? 'run' : this.elapsed < this.landingUntil ? 'land' : 'idle');
  }

  setState(state) {
    if (this.state === state) return;
    this.state = state;
    this.play(`veer-${state}`);
  }

  attack() {
    if (this.dead || this.elapsed < this.nextAttack || this.elapsed < this.hurtUntil) return false;
    this.attackUntil = this.elapsed + 250;
    this.nextAttack = this.elapsed + 400;
    this.hitTargets.clear();
    this.setState('attack');
    this.emit('attack');
    return true;
  }

  hitEnemy(enemy) {
    if (this.dead || this.elapsed >= this.attackUntil || !swordFrameActive(this) || !enemy.active || this.hitTargets.has(enemy)) return false;
    const hitbox = new Phaser.Geom.Rectangle(this.facing > 0 ? this.x + 8 : this.x - 76, this.y - 28, 68, 56);
    if (!Phaser.Geom.Intersects.RectangleToRectangle(hitbox, enemy.getBounds())) return false;
    this.hitTargets.add(enemy);
    return true;
  }

  takeDamage(sourceX = this.x - this.facing * 20) {
    if (this.dead || this.elapsed < this.invincibleUntil) return false;
    this.health = Math.max(0, this.health - 1);
    this.invincibleUntil = this.elapsed + 1300;
    this.hurtUntil = this.elapsed + 220;
    this.attackUntil = 0;
    this.setVelocity(this.x < sourceX ? -170 : 170, -180);
    this.emit('damage', this.health);
    if (this.health === 0) {
      this.dead = true;
      this.setVelocity(0);
      this.setAlpha(1);
      if (this.body.blocked.down || this.y > this.scene.killY) this.startDeathAnimation();
      else this.setState('fall');
      this.emit('death');
    } else this.setState('hurt');
    return true;
  }

  startDeathAnimation() {
    this.deathUntil = this.elapsed + 450;
    this.setVelocity(0);
    this.setState('death');
  }

  respawn(x, y) {
    if (this.dead) return;
    this.body.reset(x, y);
    this.body.updateFromGameObject();
    this.wasGrounded = undefined; this.hasLanded = false; this.landingUntil = 0;
    this.jumpsUsed = 0;
    this.lastGrounded = -Infinity;
  }
}
