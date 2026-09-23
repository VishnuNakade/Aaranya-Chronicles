import Phaser from 'phaser';

export default class StoneGuardian extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, config) {
    super(scene, config.x, config.y, 'stone-guardian');
    scene.add.existing(this); scene.physics.add.existing(this);
    this.body.setSize(100, 140).setOffset(20, 10);
    this.setCollideWorldBounds(true);
    this.health = this.maxHealth = 18; this.phase = 1; this.dead = false;
    this.state = 'recover'; this.remaining = 1800; this.elapsed = 0; this.invincibleUntil = 0; this.turn = 0;
    this.projectiles = scene.physics.add.group({ allowGravity: false });
    this.warning = scene.add.graphics();
    this.attackDirection = -1; this.attackName = 'walk';
    scene.physics.add.collider(this, scene.platforms);
    scene.physics.add.overlap(scene.player, this.projectiles, (player, rock) => { if (!this.dead && !player.dead) { player.takeDamage(rock.x); rock.destroy(); } });
    this.once('destroy', () => { this.warning.destroy(); this.projectiles.clear(true, true); });
    this.publish();
  }
  get vulnerable() { return !this.dead && ['recover', 'transition'].includes(this.state); }
  publish() {
    const cues = { walk: 'Advancing strike', smash: 'Ground smash', rock: 'Rock throw' };
    this.scene.bridge.emit('boss', { health: this.health, maxHealth: this.maxHealth, phase: this.phase, vulnerable: this.vulnerable, dead: this.dead,
      cue: this.dead ? 'Guardian freed' : this.vulnerable ? 'Core exposed' : cues[this.attackName] });
  }
  beginAttack(player) {
    const patterns = [['walk', 'smash', 'rock'], ['smash', 'rock', 'walk', 'rock'], ['rock', 'smash', 'walk', 'smash']];
    const pattern = patterns[this.phase - 1];
    this.attackName = pattern[this.turn++ % pattern.length];
    this.attackDirection = player.x < this.x ? -1 : 1;
    this.target = { x: player.x, y: player.y };
    this.setFlipX(this.attackDirection < 0);
    this.state = 'windup'; this.remaining = 1100 - this.phase * 100;
    this.setTint(0xf6bd78); this.setVelocityX(0); this.publish();
  }
  update(player, delta) {
    if (this.dead || player.dead) { this.setVelocityX(0); return; }
    this.elapsed += delta; this.remaining -= delta;
    this.warning.clear();
    this.projectiles.getChildren().slice().forEach(rock => { if (rock.x < -30 || rock.x > this.scene.level.width + 30 || rock.y < -40 || rock.y > 600) rock.destroy(); });
    if (this.vulnerable) {
      this.setTint(this.elapsed < this.invincibleUntil ? 0xffffff : 0x9ce3b8);
      this.setVelocityX(0);
      if (this.remaining <= 0) this.beginAttack(player);
      return;
    }
    if (this.state === 'windup') {
      this.drawWarning();
      if (this.remaining > 0) return;
      this.state = 'attack'; this.setTint(0xe6a37b);
      if (this.attackName === 'walk') { this.remaining = 850; this.setVelocityX(this.attackDirection * (110 + this.phase * 25)); }
      else if (this.attackName === 'smash') {
        this.remaining = 250;
        if (Math.abs(player.x - this.x) < 170 && player.body.bottom > 455) player.takeDamage(this.x);
        if (!this.scene.settings.reducedMotion) this.scene.cameras.main.shake(140, 0.004);
      } else {
        this.remaining = 1400;
        const texture = this.scene.textures.exists('world1:fallingRock') ? 'world1:fallingRock' : 'guardian-rock';
        const rock = this.projectiles.create(this.x + this.attackDirection * 72, this.y - 30, texture).setDisplaySize(30, 30);
        const direction = new Phaser.Math.Vector2(this.target.x - rock.x, this.target.y - rock.y).normalize();
        rock.setVelocity(direction.x * (230 + this.phase * 25), direction.y * (230 + this.phase * 25));
      }
    }
    if (this.state === 'attack') {
      if (this.attackName === 'smash') this.warning.lineStyle(7, 0xffd585, 0.8).lineBetween(this.x - 170, 503, this.x + 170, 503);
      if (this.attackName === 'walk') {
        if (Phaser.Geom.Intersects.RectangleToRectangle(this.body, player.body)) player.takeDamage(this.x);
        if (this.x < 100 || this.x > this.scene.level.width - 100) this.remaining = 0;
      }
      if (this.remaining <= 0) {
        this.state = 'recover'; this.remaining = 2000 - this.phase * 150; this.setVelocityX(0);
        this.projectiles.clear(true, true); this.warning.clear(); this.publish();
      }
    }
  }
  drawWarning() {
    const g = this.warning;
    if (this.attackName === 'smash') g.fillStyle(0xe18a5a, 0.3).fillRect(this.x - 170, 482, 340, 28).lineStyle(2, 0xffd796).strokeRect(this.x - 170, 482, 340, 28);
    else if (this.attackName === 'walk') {
      const end = Phaser.Math.Clamp(this.x + this.attackDirection * 230, 70, this.scene.level.width - 70);
      g.lineStyle(4, 0xffd796, 0.8).lineBetween(this.x, 497, end, 497);
      g.fillStyle(0xffd796).fillTriangle(end, 489, end, 505, end + this.attackDirection * 12, 497);
    } else g.lineStyle(2, 0xffd796, 0.8).lineBetween(this.x + this.attackDirection * 72, this.y - 30, this.target.x, this.target.y).strokeCircle(this.target.x, this.target.y, 18);
  }
  takeDamage(amount, sourceX) {
    if (!this.vulnerable || this.elapsed < this.invincibleUntil) return false;
    this.health = Math.max(0, this.health - amount); this.invincibleUntil = this.elapsed + 330;
    this.scene.tone(200); this.scene.effects?.hit(this);
    if (!this.health) {
      this.dead = true; this.state = 'defeated'; this.body.enable = false; this.setVelocity(0);
      this.warning.clear(); this.projectiles.clear(true, true); this.clearTint(); this.publish(); this.emit('defeated'); return true;
    }
    const phase = this.health <= 6 ? 3 : this.health <= 12 ? 2 : 1;
    if (phase !== this.phase) { this.phase = phase; this.state = 'transition'; this.remaining = 1800; this.turn = 0; this.projectiles.clear(true, true); }
    this.publish(); return true;
  }
}
