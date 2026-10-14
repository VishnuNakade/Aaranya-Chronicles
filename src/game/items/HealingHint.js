import { healthVisual } from '../art/healthAnimationConfig';

const seenKey = 'aaranya:healing-hint:v1';

export default class HealingHint {
  constructor(scene) {
    this.scene = scene;
    this.shown = false;
    try { this.shown = localStorage.getItem(seenKey) === 'seen'; } catch { /* Still show once this run without storage. */ }
    this.first = scene.objects.crates.getChildren()[0];
    scene.events.once('shutdown', () => this.panel?.destroy());
  }
  update() {
    const s = this.scene;
    if (this.shown || !this.first?.active || s.player.dead || Math.abs(s.player.x - this.first.x) > 150 || Math.abs(s.player.y - this.first.y) > 100) return;
    this.shown = true;
    try { localStorage.setItem(seenKey, 'seen'); } catch { /* Storage is optional. */ }
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
