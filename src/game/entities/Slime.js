import Enemy from './Enemy';
export default class Slime extends Enemy {
  constructor(scene, config) { super(scene, config, { texture: 'slime', health: 2, speed: 45, deathAnimation: 'slime-death' }); }
}
