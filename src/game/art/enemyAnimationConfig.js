export const enemyAnimationConfig = {
  idle: { count: 6, frameRate: 5, repeat: -1, anchorX: 0.52, alignFeet: true, registeredHeight: 80 },
  run: { count: 9, frameRate: 14, repeat: -1, anchorX: 0.50 },
  jump: { count: 8, duration: 420, repeat: 0, anchorX: 0.50 },
  fall: { count: 7, duration: 350, repeat: 0, anchorX: 0.50 },
  attack: { count: 8, duration: 560, repeat: 0, anchorX: 0.42 },
  hurt: { count: 4, duration: 220, repeat: 0, anchorX: 0.50 },
  death: { count: 8, duration: 700, repeat: 0, anchorX: 0.50 },
};
export const enemyVisual = { width: 160, height: 128, footX: 80, footY: 108 };
export const enemyAttackFrames = [4, 5, 6];
