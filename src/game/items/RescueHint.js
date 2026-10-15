export default class RescueHint {
  constructor(scene, rescue) {
    this.scene = scene;
    this.rescue = rescue;
    scene.events.once('shutdown', () => this.panel?.destroy());
  }
  update(player, guarded) {
    const { scene, rescue } = this;
    const visible = !guarded && !player.dead && rescue.state === 'caged'
      && Math.abs(player.x - rescue.config.x) < 190 && Math.abs(player.body.bottom - rescue.config.y) < 120;
    if (!this.panel && visible) {
      this.panel = scene.add.container(0, 100).setScrollFactor(0).setDepth(90);
      const text = (x, y, value, size = 13) => scene.add.text(x, y, value, {
        fontFamily: 'Arial', fontSize: `${size}px`, color: '#f3e4b6', align: 'center',
      }).setOrigin(0.5, 0);
      this.progress = text(170, 126, '');
      const cage = scene.add.image(112, 66, 'dog-1', 'grounded').setFlipX(true);
      cage.setScale(54 / cage.height);
      this.panel.add([
        scene.add.rectangle(170, 77, 340, 154, 0x102c27, 0.97).setStrokeStyle(2, 0xd8b867),
        text(170, 10, 'FREE RANGA', 15), cage,
        text(170, 55, '>'),
        scene.add.image(228, 66, 'rescue-attack-button').setDisplaySize(48, 48),
        text(170, 103, `Strike the cage ${rescue.config.hits} times to free Ranga.`),
        this.progress,
      ]);
    }
    if (this.panel) {
      this.panel.setPosition(Math.max(8, (scene.scale.width - 340) / 2), 100).setVisible(visible);
      this.progress.setText(`${rescue.hits} / ${rescue.config.hits} hits`);
    }
  }
}
