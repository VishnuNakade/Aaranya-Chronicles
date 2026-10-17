export default class JumpHint {
  constructor(scene) {
    this.scene = scene;
    const ground = scene.level.ground;
    this.edges = ground.slice(0, -1)
      .filter(([x, , width], index) => x + width < ground[index + 1][0])
      .slice(0, 3).map(([x, , width]) => x + width);
    const x = Math.max(8, (scene.scale.width - 340) / 2);
    this.panel = scene.add.container(x, 100).setScrollFactor(0).setDepth(90).setVisible(false);
    const text = (x, y, value, size) => scene.add.text(x, y, value, {
      fontFamily: 'Arial', fontSize: `${size}px`, color: '#f3e4b6', align: 'center',
    }).setOrigin(0.5, 0);
    this.panel.add([
      scene.add.rectangle(170, 64, 340, 128, 0x102c27, 0.97).setStrokeStyle(2, 0xd8b867),
      text(170, 10, 'DOUBLE JUMP', 15),
      scene.add.image(170, 57, 'jump-hint-button').setDisplaySize(44, 44),
      text(170, 86, 'Tap jump, then tap again in the air', 13),
      text(170, 104, 'to jump farther.', 13),
    ]);
    scene.events.once('shutdown', () => this.panel.destroy());
  }
  update() {
    const { player } = this.scene;
    this.panel.setVisible(!player.dead && this.edges.some(edge => player.x >= edge - 70 && player.x <= edge + 160));
    const healing = this.scene.healingHint?.panel;
    if (healing?.active) healing.setVisible(!this.panel.visible);
  }
}
