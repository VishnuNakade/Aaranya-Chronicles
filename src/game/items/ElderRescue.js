import RescueHint from './RescueHint';

export default class ElderRescue {
  constructor(scene, config) {
    this.scene = scene; this.config = config; this.hits = 0; this.state = 'caged';
    this.target = scene.add.zone(config.x, config.y - 44, 76, 88);
    scene.physics.add.existing(this.target, true);
    this.art = scene.add.sprite(config.x, config.y + 2, 'elder', 'elder-0').setOrigin(0.5, 1).setDepth(5);
    this.hint = new RescueHint(scene, this);
    this.alignArt();
    this.art.on('animationupdate', () => this.alignArt());
    scene.events.once('shutdown', () => { this.art.destroy(); this.target.destroy(); });
  }
  alignArt() {
    const height = ['caged', 'release'].includes(this.state) ? 88 : 72;
    this.art.setScale(height / this.art.height);
    this.art.setOrigin(this.art.frame.elderOriginX ?? 0.5, 1);
    this.art.y = this.config.y + 2;
  }
  update(player, delta) {
    const scene = this.scene;
    const guarded = scene.enemies.getChildren().some(enemy => enemy.patrol.requiredForExit);
    this.hint.update(player, guarded);
    if (player.dead) return;
    if (this.state === 'caged' && !guarded && player.hitEnemy(this.target)) {
      this.hits++;
      scene.effects.hit(this.art);
      if (this.hits < this.config.hits) { this.art.setTexture('elder', 'elder-1'); this.alignArt(); }
      else {
        this.state = 'release'; this.art.play('elder-release');
        this.art.once('animationcomplete', () => {
          this.state = 'approach'; this.art.play('elder-walk'); this.alignArt();
        });
      }
    } else if (this.state === 'approach') {
      const dx = player.x - this.art.x;
      this.art.setFlipX(dx > 0);
      if (Math.abs(dx) > 52) this.art.x += Math.sign(dx) * Math.min(Math.abs(dx) - 52, delta * 0.09);
      else if (player.body.blocked.down && Math.abs(player.body.bottom - this.config.y) < 12) {
        this.state = 'giving';
        scene.rescueCinematic = true;
        scene.touch = {}; scene.pending = {}; player.setVelocity(0);
        player.facing = Math.sign(this.art.x - player.x) || 1;
        player.setFlipX(player.facing < 0);
        this.art.play('elder-give'); this.alignArt();
        this.art.once('animationcomplete', () => {
          this.state = 'rescued';
          scene.rewardId = this.config.rewardId;
          scene.showEncounterStory(this.config.rewardStory, () => scene.finish(true));
        });
      }
    }
  }
}
