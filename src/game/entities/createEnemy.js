import Raider from './Raider';
import ForestWarden from './ForestWarden';
const types = { enemy1: Raider, forestWarden: ForestWarden };
export function createEnemy(scene, config) {
  const Type = types[config.type];
  if (!Type) throw new Error(`Unknown enemy type: ${config.type}`);
  return new Type(scene, config);
}
