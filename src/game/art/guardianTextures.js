export function createGuardianTextures(scene) {
  if (scene.textures.exists('stone-guardian')) return;
  const g = scene.make.graphics({ x: 0, y: 0 });
  g.fillStyle(0x56635c).fillRoundedRect(25, 34, 90, 86, 12);
  g.fillStyle(0x899284).fillRoundedRect(36, 8, 68, 48, 8);
  g.fillStyle(0x3b4842).fillRoundedRect(3, 50, 30, 68, 7).fillRoundedRect(107, 50, 30, 68, 7);
  g.fillStyle(0x738070).fillRoundedRect(25, 113, 36, 40, 6).fillRoundedRect(79, 113, 36, 40, 6);
  g.lineStyle(3, 0x303f37).lineBetween(60, 10, 70, 29).lineBetween(70, 29, 55, 45).lineBetween(40, 65, 58, 87).lineBetween(58, 87, 43, 112);
  g.fillStyle(0xb6f192).fillRect(45, 29, 17, 6).fillRect(79, 29, 17, 6);
  g.fillStyle(0xe5d184).fillTriangle(70, 58, 52, 81, 70, 101).fillTriangle(70, 58, 88, 81, 70, 101);
  g.fillStyle(0x658b53).fillEllipse(24, 54, 29, 13).fillEllipse(112, 49, 29, 15);
  g.generateTexture('stone-guardian', 140, 160); g.clear();
  g.fillStyle(0x8a9384).fillCircle(15, 15, 14); g.lineStyle(3, 0x535f53).lineBetween(8, 4, 19, 17).lineBetween(19, 17, 10, 26);
  g.generateTexture('guardian-rock', 30, 30); g.clear();
  g.fillStyle(0xf4d991).fillTriangle(20, 0, 2, 23, 20, 42).fillTriangle(20, 0, 38, 23, 20, 42);
  g.fillStyle(0xb6edc2).fillTriangle(20, 7, 11, 23, 20, 33).fillTriangle(20, 7, 29, 23, 20, 33);
  g.generateTexture('meadow-relic', 40, 44); g.destroy();
}
