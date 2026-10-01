import Raider from './Raider';

export default class ForestWarden extends Raider {
  constructor(scene, config) {
    super(scene, config, {
      texture: 'warden', deathDuration: 1600, hurtDuration: 400, attackFrames: [4, 5, 6, 7, 8],
      stats: { health: 6, detection: 500, loseTarget: 1000, attackDuration: 960,
        sequence: [{ warning: 600, recovery: 650 }, { warning: 400, recovery: 1200 }] },
    });
    this.nameLabel = scene.add.text(this.x, this.y - 104, 'FOREST WARDEN', { fontSize: '11px', color: '#ffe292', stroke: '#172a23', strokeThickness: 3 }).setOrigin(0.5).setDepth(12);
    this.once('destroy', () => this.nameLabel.destroy());
  }
  update(player, delta) {
    super.update(player, delta);
    if (this.active) this.nameLabel.setPosition(this.x, this.y - 104).setVisible(!this.dead);
  }
}
