import Phaser from 'phaser';
import { healingSurface } from './healingSurface';
import { healthVisual } from '../art/healthAnimationConfig';

export function healingEffect(scene, x, groundY) {
  const surfaceY = healingSurface(scene.level, x, groundY);
  if (surfaceY == null) return null;
  const effect = scene.add.sprite(x, surfaceY + 4, 'health-items', 'healing-0').setOrigin(0.5, 148 / 160).setDisplaySize(112, 112).setDepth(15);
  effect.play('health-healing'); effect.once('animationcomplete', () => effect.destroy());
  return effect;
}

export default class HealthCrate extends Phaser.GameObjects.Zone {
  constructor(scene, config, id) {
    super(scene, config.x, config.y, 48, 48);
    scene.add.existing(this);
    this.itemId = id; this.state = 'box';
    // Embed the illustrated base slightly in the grass, rather than balancing on its tips.
    this.art = scene.add.sprite(this.x, this.y + 28, 'health-items', healthVisual.boxIdleFrame)
      .setOrigin(0.5, 148 / 160).setDisplaySize(64, 64).setDepth(3);
    this.once('destroy', () => this.art.destroy());
  }
  get hittable() { return this.state === 'box' || this.state === 'plant'; }
  hit() {
    if (this.state === 'box') {
      this.state = 'breaking'; this.body.enable = false;
      this.art.play('health-box');
      this.art.once('animationcomplete', () => {
        if (!this.active) return;
        this.state = 'plant'; this.art.setTexture('health-items', 'plant-0');
      });
    } else if (this.state === 'plant') {
      this.state = 'collected';
      if (this.scene.healing.collect(this.itemId)) {
        healingEffect(this.scene, this.x, this.y + 24);
        this.scene.publish();
      }
      this.destroy();
    }
  }
}
