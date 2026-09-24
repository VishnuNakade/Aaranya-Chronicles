import Phaser from 'phaser';
import EnvironmentRenderer from '../environment/EnvironmentRenderer';
import FallingRocks from '../environment/FallingRocks';
import GameEffects from '../effects/GameEffects';
import Player from '../entities/Player';
import StoneGuardian from '../entities/StoneGuardian';
import { createEnemy } from '../entities/createEnemy';
import { buildLevel } from '../level/buildLevel';
import { getCoinTotal, getEnemyTotal } from '../data/levels';
import { calculateStars } from '../results';
export default class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }
  create() {
    this.level = this.registry.get('level'); this.bridge = this.registry.get('bridge'); this.settings = this.registry.get('settings');
    this.coinsCollected = 0; this.finished = false; this.touch = {}; this.pending = {}; this.paused = false;
    this.enemiesDefeated = 0; this.elapsedMs = 0; this.boss = null; this.victory = false;
    this.respawnPoint = { ...this.level.spawn }; this.checkpointIndex = -1;
    this.killY = this.level.killY ?? this.level.height + 50;
    this.physics.world.setBounds(0, 0, this.level.width, this.killY + 120); this.cameras.main.setBounds(0, 0, this.level.width, this.level.height);
    this.environment = this.level.environment ? new EnvironmentRenderer(this, this.level) : null;
    if (!this.environment && this.textures.exists(this.level.background)) this.add.image(480, 270, this.level.background).setDisplaySize(960, 640).setScrollFactor(0).setAlpha(0.72);
    if (!this.environment) this.add.rectangle(480, 270, 960, 540, 0xb0dcc9, 0.14).setScrollFactor(0);
    this.objects = buildLevel(this, this.level);
    this.platforms = this.objects.solids;
    this.effects = new GameEffects(this);
    this.player = new Player(this, this.level.spawn.x, this.level.spawn.y, this.settings); this.physics.add.collider(this.player, this.platforms);
    this.fallingRocks = this.environment ? new FallingRocks(this, this.level.environment.hazards ?? [], this.environment) : null;
    this.player.on('damage', () => { this.publish(); this.tone(150); this.effects.shake(100, 0.004); });
    this.player.on('attack', () => this.tone(330));
    this.player.on('death-complete', () => this.finish(false));
    this.physics.add.collider(this.player, this.objects.crates);
    this.physics.add.overlap(this.player, this.objects.spikes, () => this.player.takeDamage());
    this.physics.add.overlap(this.player, this.objects.checkpoints, (_player, checkpoint) => {
      if (this.player.dead || checkpoint.getData('index') <= this.checkpointIndex) return;
      this.checkpointIndex = checkpoint.getData('index');
      this.respawnPoint = { ...checkpoint.getData('config').spawn };
      checkpoint.getData('flag').setFillStyle(0xf0cb73);
      this.effects.checkpoint(checkpoint); this.tone(920);
      this.bridge.emit('checkpoint', checkpoint.getData('config').id);
    });
    this.physics.add.overlap(this.player, this.objects.gate, () => { if (!this.player.dead) this.finish(true); });
    this.coins = this.physics.add.staticGroup();
    this.level.coins.forEach(([x, y]) => { const coin = this.coins.create(x, y, 'coin'); this.effects.coin(coin); });
    this.physics.add.overlap(this.player, this.coins, (_player, coin) => { if (this.player.dead) return; this.effects.burst(coin.x, coin.y); coin.destroy(); this.coinsCollected++; this.tone(760); this.publish(); });
    this.enemies = this.physics.add.group();
    this.level.enemies.forEach(config => {
      const enemy = createEnemy(this, config);
      enemy.on('damage', () => this.effects.hit(enemy));
      enemy.on('death', () => { this.enemiesDefeated++; });
      enemy.on('coin-drop', ({ x, y, count }) => {
        for (let i = 0; i < count; i++) this.effects.coin(this.coins.create(x + (i - (count - 1) / 2) * 26, y, 'coin').setData('bonus', true));
      });
      this.enemies.add(enemy);
    });
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.collider(this.enemies, this.objects.crates);
    this.physics.add.overlap(this.player, this.enemies, (_player, enemy) => {
      if (this.player.hitEnemy(enemy)) enemy.takeDamage(1, this.player.x);
      else enemy.contact(this.player);
    });
    if (this.level.boss) {
      this.boss = new StoneGuardian(this, this.level.boss);
      this.boss.once('defeated', () => this.beginVictory());
    }
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09, this.level.camera?.offsetX ?? 0, this.level.camera?.offsetY ?? 0);
    this.keys = this.input.keyboard.addKeys('LEFT,RIGHT,UP,DOWN,SPACE,A,D,W,S');
    const queueKey = event => {
      if (event.repeat || this.paused || this.finished) return;
      if (['ArrowUp', 'KeyW'].includes(event.code)) this.pending.jump = true;
      if (event.code === 'Space') this.pending.attack = true;
    };
    this.input.keyboard.on('keydown', queueKey);
    const offInput = this.bridge.on('input', ({ action, down }) => {
      if (this.paused || this.finished) return;
      if (down && !this.touch[action] && ['jump', 'attack'].includes(action)) this.pending[action] = true;
      this.touch[action] = down;
    });
    const offPause = this.bridge.on('pause', paused => this.setPaused(paused));
    const offRestart = this.bridge.on('restart', () => this.scene.restart());
    const offSettings = this.bridge.on('settings', settings => {
      this.settings = settings; this.player.reducedMotion = settings.reducedMotion;
      this.coins.getChildren().forEach(coin => this.effects.coin(coin));
      if (settings.reducedMotion) this.effects.clear();
    });
    this.blur = () => this.setPaused(true);
    this.game.events.on(Phaser.Core.Events.BLUR, this.blur);
    this.game.events.on(Phaser.Core.Events.HIDDEN, this.blur);
    this.events.once('shutdown', () => { offInput(); offPause(); offRestart(); offSettings(); this.input.keyboard.off('keydown', queueKey); this.game.events.off(Phaser.Core.Events.BLUR, this.blur); this.game.events.off(Phaser.Core.Events.HIDDEN, this.blur); });
    this.publish(); this.bridge.emit('ready');
  }
  setPaused(value) {
    if (this.finished || this.paused === value) return;
    this.paused = value; this.touch = {}; this.pending = {}; this.input.keyboard.resetKeys();
    // Pause the entire scene: clock, camera, animations, tweens and physics stop together.
    if (value) { this.physics.pause(); this.cameras.main.stopFollow(); this.sys.pause(); }
    else { if (!this.victory) this.physics.resume(); this.cameras.main.startFollow(this.player, true, 0.09, 0.09, this.level.camera?.offsetX ?? 0, this.level.camera?.offsetY ?? 0); this.sys.resume(); }
    this.bridge.emit('paused', value);
  }
  publish() { this.bridge.emit('hud', { health: this.player.health, coins: this.coinsCollected }); }
  tone(frequency) {
    if (!this.settings.sound || !this.sound.context) return;
    const context = this.sound.context;
    if (context.state !== 'running') return;
    const oscillator = context.createOscillator(); const gain = context.createGain();
    oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(frequency, context.currentTime); gain.gain.setValueAtTime(0.06, context.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.13);
    oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + 0.14);
  }
  beginVictory() {
    this.victory = true; this.enemiesDefeated++; this.physics.pause();
    this.touch = {}; this.pending = {}; this.player.setVelocity(0); this.player.anims.stop();
    this.bridge.emit('victory', { name: this.level.relicName });
    this.tweens.add({ targets: this.boss, alpha: 0.2, scaleY: this.settings.reducedMotion ? 1 : 0.6, duration: 800 });
    const relic = this.add.image(this.boss.x, this.boss.y - 60, 'meadow-relic').setDepth(20);
    this.tweens.add({ targets: relic, x: this.player.x, y: this.player.y - 55, delay: 900, duration: this.settings.reducedMotion ? 0 : 1100, ease: 'Sine.easeInOut' });
    this.time.delayedCall(2600, () => this.finish(true));
  }
  finish(won) {
    if (this.finished || (won && this.boss && (!this.boss.dead || !this.victory))) return;
    this.finished = true; this.physics.pause(); this.tweens.pauseAll(); this.player.anims.pause();
    this.enemies.getChildren().forEach(enemy => enemy.anims.pause());
    const result = { levelId: this.level.id, won, coins: this.coinsCollected, totalCoins: getCoinTotal(this.level), enemiesDefeated: this.enemiesDefeated, totalEnemies: getEnemyTotal(this.level), bossDefeated: Boolean(this.boss?.dead), relicId: this.boss?.dead ? this.level.relicId : null, timeMs: Math.round(this.elapsedMs) };
    result.stars = calculateStars(result);
    this.bridge.emit('result', result);
    this.touch = {}; this.pending = {}; this.input.keyboard.resetKeys(); this.cameras.main.stopFollow(); this.sys.pause();
  }
  update(_time, delta) {
    if (!this.keys || this.finished) return;
    if (this.paused || this.victory) return;
    const follow = 1 - Math.pow(1 - 0.09, Math.min(delta, 50) / (1000 / 60));
    this.cameras.main.setLerp(follow, follow);
    this.elapsedMs += delta;
    this.player.update({ left: this.keys.LEFT.isDown || this.keys.A.isDown || this.touch.left, right: this.keys.RIGHT.isDown || this.keys.D.isDown || this.touch.right, ...this.pending }, delta);
    this.pending = {};
    if (this.player.dead) { this.enemies.setVelocityX(0); return; }
    this.fallingRocks?.update(delta);
    if (this.boss) {
      this.boss.update(this.player, delta);
      if (this.boss.vulnerable && this.player.hitEnemy(this.boss)) this.boss.takeDamage(1, this.player.x);
    }
    this.enemies.getChildren().slice().forEach(enemy => { enemy.update(this.player, delta); if (enemy.active && !enemy.dead && this.player.hitEnemy(enemy)) enemy.takeDamage(1, this.player.x); });
    this.objects.crates.getChildren().slice().forEach(crate => { if (this.player.hitEnemy(crate)) { crate.destroy(); this.tone(220); } });
    if (this.player.y > this.killY) { this.player.takeDamage(); this.player.respawn(this.respawnPoint.x, this.respawnPoint.y); this.cameras.main.centerOn(this.respawnPoint.x, this.respawnPoint.y); }
  }
}
