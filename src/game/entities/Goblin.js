import Enemy from './Enemy';
export default class Goblin extends Enemy {
  constructor(scene, config) {
    super(scene, config, { texture: 'enemy', health: 3, speed: 65, deathAnimation: 'goblin-death' });
    this.detectionRange = config.detectionRange ?? 230;
    this.attackRange = 52; this.nextAttack = 0; this.attackAt = 0;
  }
  behave(player) {
    const dx = player.x - this.x;
    const nearby = !player.dead && Math.abs(dx) < this.detectionRange && Math.abs(player.y - this.y) < 65;
    if (this.state === 'attack') {
      this.setTint(0xffab66);
      this.setVelocityX(0);
      if (this.elapsed >= this.attackAt) {
        if (nearby && Math.abs(dx) <= this.attackRange && dx * this.direction >= 0) player.takeDamage(this.x);
        this.state = 'recover'; this.nextAttack = this.elapsed + 650;
      }
      return;
    }
    if (this.elapsed < this.nextAttack) { this.setVelocityX(0); return; }
    if (!nearby) { this.patrolStep(); return; }
    this.direction = dx < 0 ? -1 : 1; this.setFlipX(this.direction < 0);
    if (Math.abs(dx) <= this.attackRange) {
      this.state = 'attack'; this.attackAt = this.elapsed + 280; this.setVelocityX(0); this.setTint(0xffab66);
    } else {
      this.state = 'chase';
      // Patrol bounds also define safe chase terrain, preventing pursuit into gaps.
      const safe = this.direction > 0 ? this.x < this.patrol.max : this.x > this.patrol.min;
      this.setVelocityX(safe ? this.direction * 105 : 0);
    }
  }
}
