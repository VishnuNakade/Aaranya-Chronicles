import Raider from './Raider';
const types = { enemy1: Raider };
export function createEnemy(scene, config) {
  const Type = types[config.type];
  if (!Type) throw new Error(`Unknown enemy type: ${config.type}`);
  return new Type(scene, config);
}
