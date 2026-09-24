export const veerVisual = {
  width: 160, height: 128, footX: 80, footY: 108,
  originX: 0.5, originY: 88 / 128,
  body: { width: 24, height: 42, offsetX: 68, offsetY: 66 },
};

// Durations fit the existing attack, hurt and death gameplay timers.
export const veerAnimationConfig = {
  idle: { count: 7, frameRate: 10, repeat: -1, anchorX: 0.60,
    // Four-second loop; closed eyes (frame 4) are held for only 100 ms.
    frameHolds: [900, 550, 500, 100, 500, 550, 900],
    // Source-pixel landmarks: hair top, lowest sole, midpoint between the boots.
    // Canvas bounds include varying amounts of scarf, sword and transparent padding.
    registeredHeight: 82,
    registration: [
      { headY: 42, footY: 1484, rootX: 590 },
      { headY: 90, footY: 1443, rootX: 627 },
      { headY: 73, footY: 1417, rootX: 624 },
      { headY: 15, footY: 1208, rootX: 675 },
      { headY: 46, footY: 1458, rootX: 599 },
      { headY: 20, footY: 1358, rootX: 700 },
      { headY: 15, footY: 1155, rootX: 683 },
    ] },
  run: { count: 8, frameRate: 14, repeat: -1, anchorX: 0.60 },
  jump: { count: 7, duration: 250, repeat: 0, anchorX: 0.57, airborneFrames: [1, 2, 3, 4, 5] },
  fall: { count: 7, duration: 350, repeat: 0, anchorX: 0.57 },
  attack: { count: 9, duration: 250, repeat: 0, anchorX: 0.48,
    anchors: [0.55, 0.53, 0.43, 0.48, 0.43, 0.43, 0.57, 0.57, 0.57], activeFrames: [3, 4, 5, 6] },
  hurt: { count: 10, duration: 220, repeat: 0, anchorX: 0.55 },
  death: { count: 7, duration: 450, repeat: 0, anchorX: 0.50 },
};

export function swordFrameActive(player) {
  return player.anims.currentAnim?.key === 'veer-attack'
    && veerAnimationConfig.attack.activeFrames.includes(player.anims.currentFrame?.index);
}

export const veerLanding = { frames: [6, 7], duration: 120 };
