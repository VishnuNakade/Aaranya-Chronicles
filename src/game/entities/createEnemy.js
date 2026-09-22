import Slime from './Slime';
import Goblin from './Goblin';
const types = { slime: Slime, goblin: Goblin };
export function createEnemy(scene, config) {
  const Type = types[config.type];
  if (!Type) throw new Error(`Unknown enemy type: ${config.type}`);
  return new Type(scene, config);
}
