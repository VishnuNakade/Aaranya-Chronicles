export const enemyCombat = {
  health: 3, speed: 245, patrolSpeed: 65, jump: -510, doubleJump: -475,
  detection: 430, loseTarget: 700, range: 68,
  // A deliberate slash, a faster slash, then a long opening to counterattack.
  sequence: [{ warning: 480, recovery: 380 }, { warning: 320, recovery: 1050 }],
  attackDuration: 560, damage: 1, postureDamage: 40, invincibility: 1300,
};
