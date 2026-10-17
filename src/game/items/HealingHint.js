import { healthVisual } from '../art/healthAnimationConfig';

const seenKey = 'aaranya:healing-hint:v1';

export default class HealingHint {
  constructor(scene) {
    this.scene = scene;
    const ids = scene.level.healingHintCrates ?? [];
    this.targets = scene.objects.crates.getChildren().filter(crate => ids.includes(crate.itemId));
    this.first = this.targets[0];
    this.seen = new Set();
    for (const id of ids) {
      try {
        if (localStorage.getItem(this.storageKey(id)) === 'seen') this.seen.add(id);
      } catch { /* Still show once this run without storage. */ }
    }
    scene.events.once('shutdown', () => this.panel?.destroy());
  }
  storageKey(id) {
    return id === '1-1:0' ? seenKey : `${seenKey}:${id}`;
  }
  update() {
    const s = this.scene;
    if (this.panel?.active || s.player.dead) return;
    const target = this.targets.find(crate => crate.active && crate.state === 'box'
      && !this.seen.has(crate.itemId) && Math.abs(s.player.x - crate.x) <= 150
      && Math.abs(s.player.y - crate.y) <= 100);
    if (!target) return;
    this.seen.add(target.itemId);
    try { localStorage.setItem(this.storageKey(target.itemId), 'seen'); } catch { /* Storage is optional. */ }
    const width = 340;
    const x = Math.max(8, (s.scale.width - width) / 2);
    const panel = s.add.container(x, 100).setScrollFactor(0).setDepth(90);
    this.panel = panel;
    const bg = s.add.rectangle(width / 2, 75, width, 150, 0x102c27, 0.97).setStrokeStyle(2, 0xd8b867);
    const text = (x, y, value, size = 12) => s.add.text(x, y, value, { fontFamily: 'Arial', fontSize: `${size}px`, color: '#f3e4b6', align: 'center' }).setOrigin(0.5, 0);
    panel.add([bg, text(170, 10, 'FOREST HEALING', 15),
      s.add.image(62, 65, 'health-items', healthVisual.boxIdleFrame).setDisplaySize(48, 48),
      text(62, 96, '1. Strike the box'), text(119, 58, '>'),
      s.add.image(173, 65, 'health-items', 'plant-0').setDisplaySize(48, 48),
      text(173, 96, '2. Strike the plant'), text(227, 58, '>'),
      s.add.image(282, 65, 'heal-hint-button').setDisplaySize(48, 48), text(282, 96, '3. Tap heal'),
      text(170, 125, 'Full life? Your healing charge stays stored.', 11)]);
    s.time.delayedCall(10000, () => panel.destroy());
  }
}
