export default class GameEffects {
  constructor(scene) {
    this.scene = scene;
    // A fixed pool bounds both render cost and simultaneous effect tweens.
    this.particles = Array.from({ length: 24 }, () => scene.add.image(0, 0, 'fx-spark').setDepth(30).setVisible(false));
    this.slash = scene.add.image(0, 0, 'fx-slash').setDepth(25).setVisible(false);
  }
  burst(x, y, color = 0xffd66d, count = 8) {
    if (this.scene.settings.reducedMotion) return;
    this.particles.filter(p => !p.visible).slice(0, count).forEach((p, i) => {
      const angle = i / count * Math.PI * 2;
      p.setPosition(x, y).setTint(color).setAlpha(1).setScale(1).setVisible(true);
      this.scene.tweens.add({ targets: p, x: x + Math.cos(angle) * 34, y: y + Math.sin(angle) * 28 - 12,
        alpha: 0, scale: 0.3, duration: 320, ease: 'Quad.easeOut', onComplete: () => p.setVisible(false) });
    });
  }
  shake(duration = 90, intensity = 0.002) {
    if (!this.scene.settings.reducedMotion) this.scene.cameras.main.shake(duration, intensity, false);
  }
  hit(target) { this.burst(target.x, target.y, 0xffe7be, 6); this.shake(); }
  sword(player) {
    if (this.scene.settings.reducedMotion) return;
    this.scene.tweens.killTweensOf(this.slash);
    this.slash.setPosition(player.x + player.facing * 40, player.y - 2).setFlipX(player.facing < 0).setAlpha(0.9).setScale(0.75).setVisible(true);
    this.scene.tweens.add({ targets: this.slash, alpha: 0, scale: 1.15, duration: 170, onComplete: () => this.slash.setVisible(false) });
  }
  coin(coin) {
    const y = coin.getData('baseY') ?? coin.y;
    if (!coin.getData('effectCleanup')) {
      coin.setData('effectCleanup', true);
      coin.once('destroy', () => this.scene.tweens.killTweensOf(coin));
    }
    coin.setData('baseY', y);
    this.scene.tweens.killTweensOf(coin); coin.setY(y).setAlpha(1); coin.refreshBody();
    if (this.scene.settings.reducedMotion) return;
    this.scene.tweens.add({ targets: coin, y: y - 6, duration: 850, delay: Math.abs(coin.x % 400), yoyo: true, repeat: -1,
      ease: 'Sine.easeInOut', onUpdate: () => { if (coin.active) coin.refreshBody(); } });
  }
  checkpoint(checkpoint) {
    const flag = checkpoint.getData('flag');
    this.burst(flag.x, flag.y, 0xbce8a1, 12);
    if (!this.scene.settings.reducedMotion) this.scene.tweens.add({ targets: flag, scaleX: 1.25, scaleY: 1.25, duration: 180, yoyo: true, repeat: 1 });
  }
  clear() {
    [...this.particles, this.slash].forEach(p => { this.scene.tweens.killTweensOf(p); p.setVisible(false); });
    this.scene.objects.checkpoints.getChildren().forEach(c => { const flag = c.getData('flag'); this.scene.tweens.killTweensOf(flag); flag.setScale(1); });
    this.scene.cameras.main.shakeEffect.reset();
  }
}
