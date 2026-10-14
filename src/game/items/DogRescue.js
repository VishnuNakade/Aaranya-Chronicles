import { dogVisual } from '../art/dogAnimations';

export default class DogRescue {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;
    this.hits = 0;
    this.state = 'caged';
    this.target = scene.add.zone(config.x, config.y - 29, 62, 58);
    scene.physics.add.existing(this.target, true);
    this.art = scene.add.sprite(config.x, config.y + 2, 'dog-1', 'grounded').setOrigin(0.5, 1).setFlipX(true).setDepth(5);
    this.alignArt();
    this.art.on('animationupdate', () => this.alignArt());
    scene.events.once('shutdown', () => { this.art.destroy(); this.target.destroy(); });
  }
  alignArt() {
    const height = ['caged', 'release'].includes(this.state) ? dogVisual.cageHeight
      : this.state === 'rescued' ? dogVisual.sittingHeight : dogVisual.dogHeight;
    this.art.setScale(height / this.art.height);
    this.art.y = this.config.y + 2;
  }
  update(player, delta) {
    if (player.dead) return;
    if (this.state === 'caged') {
      const guarded = this.scene.enemies.getChildren().some(enemy => enemy.patrol.requiredForExit);
      if (!guarded && player.hitEnemy(this.target)) {
        this.hits++;
        this.scene.effects.hit(this.art);
        if (this.hits < this.config.hits) { this.art.setTexture('dog-2', 'grounded'); this.alignArt(); }
        else {
          this.state = 'release';
          this.art.play('dog-release');
          this.art.once('animationcomplete', () => {
            this.state = 'approach';
            this.art.play('dog-run'); this.alignArt();
          });
        }
      }
    } else if (this.state === 'approach') {
      const dx = player.x - this.art.x;
      this.art.setFlipX(dx < 0);
      if (Math.abs(dx) > 48) this.art.x += Math.sign(dx) * Math.min(Math.abs(dx) - 48, delta * 0.18);
      else if (player.body.blocked.down && Math.abs(player.body.bottom - this.config.y) < 12) {
        this.state = 'rescued';
        this.art.play('dog-sit'); this.alignArt();
        this.scene.time.delayedCall(2400, () => this.scene.finish(true));
      }
    }
  }
}
