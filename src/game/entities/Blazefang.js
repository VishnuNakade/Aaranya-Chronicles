import ForestWarden from './ForestWarden';

export default class Blazefang extends ForestWarden {
  constructor(scene, config) {
    super(scene, config, {
      name: 'BLAZEFANG', texture: 'blazefang', deathDuration: 1400, hurtDuration: 400,
      attackFrames: [4, 5, 6],
      stats: { health: 8, detection: 550, loseTarget: 1300, attackDuration: 800,
        sequence: [{ warning: 650, recovery: 650 }, { warning: 450, recovery: 1300 }] },
    });
  }

  animate(name) {
    if (name === 'jump') {
      super.animate('jump-rise');
    } else if (name === 'fall' && !this.dead) {
      super.animate('jump-fall');
    } else if (['idle', 'run'].includes(name) && this.elapsed < this.landingUntil) {
      super.animate('jump-land');
    } else super.animate(name);
  }

  update(player, delta) {
    if (!this.dead && !this.scene.encounterStorySeen) {
      this.setVelocityX(0);
      this.aggro = false;
      this.animate('idle');
      this.drawBars();
      this.nameLabel.setPosition(this.x, this.y - 104);
      return;
    }
    if (!this.encounterStarted && !this.dead) {
      this.encounterStarted = true;
      this.aggro = true;
      this.patrolWait = 0;
    }
    const grounded = this.body.blocked.down && this.body.velocity.y >= 0;
    if (grounded && this.wasAirborne) this.landingUntil = this.elapsed + delta + 160;
    this.wasAirborne = !grounded;
    super.update(player, delta);
  }
}
