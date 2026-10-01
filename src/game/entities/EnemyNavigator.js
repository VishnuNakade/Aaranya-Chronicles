import { enemyCombat as stats } from '../combat/enemyCombat';

export default class EnemyNavigator {
  constructor(scene) {
    this.surfaces = [...scene.level.ground, ...scene.level.platforms].map(([x, y, width]) => ({ x, y, width }));
    this.jumps = 0; this.nextJump = 0; this.target = null;
    this.gravity = scene.physics.world.gravity.y;
  }
  surface(body) {
    return this.surfaces.find(s => body.center.x >= s.x - 12 && body.center.x <= s.x + s.width + 12 && Math.abs(body.bottom - s.y) < 28);
  }
  route(from, to) {
    const queue = [[from]], visited = new Set([from]);
    while (queue.length) {
      const path = queue.shift(), a = path[path.length - 1];
      if (a === to) return path[1];
      for (const b of this.surfaces) {
        const gap = Math.max(0, b.x - (a.x + a.width), a.x - (b.x + b.width));
        if (!visited.has(b) && gap <= 260 && a.y - b.y <= 230 && b.y - a.y <= 350) {
          visited.add(b); queue.push([...path, b]);
        }
      }
    }
    return null;
  }
  update(enemy, player) {
    const body = enemy.body, grounded = body.blocked.down;
    if (grounded) { this.jumps = 0; this.drop = null; }
    const from = this.surface(body), to = this.surface(player.body);
    if (grounded) this.target = from && to && from !== to ? this.route(from, to) : null;
    const target = this.target;
    if (grounded && from && target && target.y > from.y + 28) {
      const edges = [from.x - body.halfWidth - 14, from.x + from.width + body.halfWidth + 14]
        .filter(x => x >= target.x + body.halfWidth && x <= target.x + target.width - body.halfWidth)
        .sort((a, b) => Math.abs(a - player.x) - Math.abs(b - player.x));
      if (edges.length) this.drop = { x: edges[0], top: from.y, target };
    }
    if (this.drop) {
      // Clear the old platform completely before steering back toward Veer.
      const aim = body.top <= this.drop.top + 24 ? this.drop.x
        : Math.max(this.drop.target.x + 18, Math.min(this.drop.target.x + this.drop.target.width - 18, player.x));
      const direction = Math.sign(aim - enemy.x);
      if (direction) { enemy.direction = direction; enemy.setFlipX(direction < 0); }
      enemy.setVelocityX(Math.abs(aim - enemy.x) < 4 ? 0 : direction * stats.speed);
      return;
    }
    let aim = player.x - (Math.sign(player.x - enemy.x) || enemy.direction) * 48;
    if (target) {
      aim = Math.max(target.x + 18, Math.min(target.x + target.width - 18, enemy.x));
      if (!grounded && this.jumps > 0) aim = this.landingX;
    }
    const rising = target && target.y < body.bottom - 35;
    // Step outside an overhead platform before jumping, avoiding its solid underside.
    if (grounded && rising && enemy.x > target.x - 25 && enemy.x < target.x + target.width + 25) {
      aim = Math.abs(enemy.x - target.x) < Math.abs(enemy.x - target.x - target.width) ? target.x - 45 : target.x + target.width + 45;
    } else if (grounded && enemy.elapsed >= this.nextJump && (target || body.blocked.left || body.blocked.right)) {
      const close = target ? Math.abs(aim - enemy.x) < 290 : true;
      if (close) { this.launchY = body.bottom; this.landingX = aim; enemy.setVelocityY(stats.jump); enemy.emit('jump'); this.jumps = 1; this.nextJump = enemy.elapsed + 350; }
    }
    const jumpingUp = target && target.y < this.launchY - 20;
    if (!grounded && this.jumps === 1 && enemy.elapsed >= this.nextJump && body.velocity.y > -120 && target) {
      // Predict the descending crossing of the platform top using Arcade gravity.
      const v = body.velocity.y;
      const discriminant = v * v + 2 * this.gravity * (target.y - body.bottom);
      const timeLeft = discriminant < 0 ? 0 : (-v + Math.sqrt(discriminant)) / this.gravity;
      const distanceLeft = Math.max(0, Math.abs(aim - enemy.x) - 8);
      if (discriminant < 0 || distanceLeft > stats.speed * timeLeft) {
        enemy.setVelocityY(stats.doubleJump); enemy.emit('jump'); this.jumps = 2;
      }
    }
    const direction = Math.sign(aim - enemy.x);
    enemy.direction = direction || enemy.direction;
    enemy.setFlipX(enemy.direction < 0);
    enemy.setVelocityX(Math.abs(aim - enemy.x) < 12 ? 0 : direction * stats.speed);
    if (target && jumpingUp && this.jumps > 0 && body.bottom > target.y - 4 && (body.right <= target.x || body.left >= target.x + target.width)) enemy.setVelocityX(0);
    if (grounded && from && !target) {
      const ahead = enemy.x + direction * 28;
      if (ahead < from.x || ahead > from.x + from.width) enemy.setVelocityX(0);
    }
  }
}
