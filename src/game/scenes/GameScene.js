import Phaser from 'phaser';
import Player from '../entities/Player';
import Enemy from '../entities/Enemy';
export default class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }
  create() {
    this.level = this.registry.get('level'); this.bridge = this.registry.get('bridge'); this.settings = this.registry.get('settings');
    this.coinsCollected = 0; this.health = 3; this.finished = false; this.invincibleUntil = 0; this.nextAttack = 0; this.touch = {}; this.paused = false;
    this.physics.world.setBounds(0, 0, this.level.width, 760); this.cameras.main.setBounds(0, 0, this.level.width, 600);
    if (this.textures.exists('forest')) this.add.image(480, 270, 'forest').setDisplaySize(960, 640).setScrollFactor(0).setAlpha(0.72);
    this.add.rectangle(480, 270, 960, 540, 0xb0dcc9, 0.14).setScrollFactor(0);
    this.platforms = this.physics.add.staticGroup();
    for (const [x, y, width, height] of this.level.platforms) {
      const platform = this.add.rectangle(x + width / 2, y + height / 2, width, height, 0x354941);
      this.platforms.add(platform); this.add.rectangle(x + width / 2, y + 4, width, 8, 0x78a750);
      for (let dx = 8; dx < width; dx += 42) this.add.rectangle(x + dx, y + 20 + (dx % 3) * 7, 27, 12, 0x566154, 0.7);
    }
    this.player = new Player(this, this.level.spawn.x, this.level.spawn.y); this.physics.add.collider(this.player, this.platforms);
    this.coins = this.physics.add.staticGroup();
    this.level.coins.forEach(([x, y]) => { const coin = this.coins.create(x, y, 'coin'); if (!this.settings.reducedMotion) this.tweens.add({ targets: coin, alpha: 0.6, duration: 700, yoyo: true, repeat: -1 }); });
    this.physics.add.overlap(this.player, this.coins, (_player, coin) => { coin.destroy(); this.coinsCollected++; this.tone(760); this.publish(); });
    this.enemies = this.physics.add.group();
    this.level.enemies.forEach(config => this.enemies.add(new Enemy(this, config)));
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.overlap(this.player, this.enemies, () => this.hurt());
    const exit = this.level.exit;
    this.add.rectangle(exit.x, exit.y - 13, 52, 90, 0x283e38).setStrokeStyle(5, 0xd8b867);
    this.add.rectangle(exit.x, exit.y - 13, 30, 66, 0xb6e8a1, 0.8);
    this.add.text(exit.x, exit.y - 83, 'SANCTUARY', { fontSize: '12px', color: '#fff1ba', backgroundColor: '#203b32', padding: { x: 7, y: 5 } }).setOrigin(0.5);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09, -140, 35);
    this.keys = this.input.keyboard.addKeys('LEFT,RIGHT,UP,SPACE,A,D,W,J,ESC');
    const offInput = this.bridge.on('input', ({ action, down }) => { this.touch[action] = down; });
    const offPause = this.bridge.on('pause', paused => this.setPaused(paused));
    const offRestart = this.bridge.on('restart', () => this.scene.restart());
    this.blur = () => this.setPaused(true);
    this.game.events.on(Phaser.Core.Events.BLUR, this.blur);
    this.events.once('shutdown', () => { offInput(); offPause(); offRestart(); this.game.events.off(Phaser.Core.Events.BLUR, this.blur); });
    this.publish(); this.bridge.emit('ready');
  }
  setPaused(value) {
    if (this.finished) return;
    this.paused = value; this.touch = {}; this.input.keyboard.resetKeys();
    if (value) { this.physics.pause(); this.tweens.pauseAll(); } else { this.physics.resume(); this.tweens.resumeAll(); }
    this.bridge.emit('paused', value);
  }
  publish() { this.bridge.emit('hud', { health: this.health, coins: this.coinsCollected }); }
  tone(frequency) {
    if (!this.settings.sound || !this.sound.context) return;
    const context = this.sound.context;
    if (context.state !== 'running') return;
    const oscillator = context.createOscillator(); const gain = context.createGain();
    oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(frequency, context.currentTime); gain.gain.setValueAtTime(0.06, context.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.13);
    oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + 0.14);
  }
  hurt() {
    if (this.time.now < this.invincibleUntil || this.finished) return;
    this.health--; this.invincibleUntil = this.time.now + 1300; this.publish(); this.tone(150);
    if (!this.settings.reducedMotion) this.cameras.main.shake(100, 0.004);
    if (this.health <= 0) this.finish(false);
  }
  finish(won) { if (this.finished) return; this.finished = true; this.physics.pause(); this.bridge.emit('result', { won, coins: this.coinsCollected }); }
  attack() {
    if (this.time.now < this.nextAttack) return;
    this.nextAttack = this.time.now + 350; this.tone(330);
    const slash = this.add.arc(this.player.x + this.player.facing * 32, this.player.y, 40, -65, 65, false, 0xffe7a3, 0.6).setRotation(this.player.facing < 0 ? Math.PI : 0);
    this.time.delayedCall(120, () => slash.destroy());
    this.enemies.getChildren().forEach(enemy => { if (Math.abs(enemy.x - this.player.x) < 85 && Math.abs(enemy.y - this.player.y) < 60 && (enemy.x - this.player.x) * this.player.facing > -12) enemy.destroy(); });
  }
  update(time) {
    if (!this.keys || this.finished) return;
    if (Phaser.Input.Keyboard.JustDown(this.keys.ESC)) this.setPaused(!this.paused);
    if (this.paused) return;
    const jumpKey = Phaser.Input.Keyboard.JustDown(this.keys.SPACE) || Phaser.Input.Keyboard.JustDown(this.keys.UP) || Phaser.Input.Keyboard.JustDown(this.keys.W);
    this.player.move({ left: this.keys.LEFT.isDown || this.keys.A.isDown || this.touch.left, right: this.keys.RIGHT.isDown || this.keys.D.isDown || this.touch.right, jump: jumpKey || this.touch.jump }, time);
    this.touch.jump = false;
    if (Phaser.Input.Keyboard.JustDown(this.keys.J) || this.touch.attack) this.attack();
    this.touch.attack = false;
    this.enemies.getChildren().forEach(enemy => enemy.patrolStep());
    this.player.setAlpha(time < this.invincibleUntil && Math.floor(time / 90) % 2 ? 0.45 : 1);
    if (this.player.y > 650) { this.hurt(); if (!this.finished) { this.player.setPosition(this.level.spawn.x, this.level.spawn.y); this.player.setVelocity(0); } }
    if (Math.abs(this.player.x - this.level.exit.x) < 35 && Math.abs(this.player.y - this.level.exit.y) < 65) this.finish(true);
  }
}
