// Level-authored hazards with a warning before each drop.
export default class FallingRocks {
  constructor(scene, configs, renderer) {
    this.scene = scene;
    this.rocks = configs.filter(c => c.type === 'fallingRock').map(config => {
      const size = config.size ?? 28;
      const body = scene.add.zone(config.x, config.y, size, size);
      scene.physics.add.existing(body); body.body.setAllowGravity(false); body.body.enable = false;
      const art = renderer.art({ asset: 'fallingRock', ...config, x: config.x - size / 2, y: config.y - size / 2, width: size, height: size }, -1, 0x92958b);
      art?.setVisible(false);
      const warning = scene.add.rectangle(config.x, config.impactY ?? 500, size + 20, 4, 0xeab975).setVisible(false);
      scene.physics.add.overlap(scene.player, body, () => { if (!scene.player.dead) scene.player.takeDamage(body.x); });
      scene.physics.add.collider(body, scene.platforms, () => { body.body.enable = false; });
      return { config, body, art, warning, size, state: 'idle', remaining: 0 };
    });
  }
  update(delta) {
    for (const rock of this.rocks) {
      const { config, body, art, warning, size } = rock;
      rock.remaining -= delta;
      if (rock.state === 'idle' && rock.remaining <= 0 && Math.abs(this.scene.player.x - config.x) < (config.triggerRadius ?? 160)) {
        rock.state = 'warning'; rock.remaining = config.warningMs ?? 900; warning.setVisible(true);
      } else if (rock.state === 'warning' && rock.remaining <= 0) {
        rock.state = 'fall'; warning.setVisible(false); body.body.enable = true;
        body.body.reset(config.x, config.y); body.body.setVelocityY(config.speed ?? 250);
      } else if (rock.state === 'fall' && (!body.body.enable || body.y > this.scene.killY)) {
        body.body.enable = false; body.body.stop(); body.setPosition(config.x, config.y);
        rock.state = 'idle'; rock.remaining = config.cooldownMs ?? 2500;
      }
      if (art) art.setPosition(body.x - size / 2, body.y - size / 2).setVisible(rock.state === 'fall');
    }
  }
}
