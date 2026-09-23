import { world1 } from './world1';

export const environments = { world1 };
const files = import.meta.glob('../../assets/world1/{backgrounds,tiles,decorations,hazards,props}/*.png', { eager: true, query: '?url', import: 'default' });
export const textureKey = (world, asset) => `${world}:${asset}`;

export function preloadEnvironment(scene, config) {
  const theme = environments[config?.world];
  if (!theme || config.mode !== 'assets') return;
  // Only enqueue assets referenced by this level, not the entire world library.
  const used = new Set((config.layers ?? theme.layers).map(layer => layer.asset));
  for (const asset of config.preload ?? []) used.add(asset);
  for (const item of [...(config.decorations ?? []), ...(config.props ?? []), ...(config.hazards ?? [])]) if (item.asset) used.add(item.asset);
  for (const terrain of config.terrain ?? []) {
    const material = theme.materials[terrain.material];
    if (material) for (const part of ['fill', 'top', 'left', 'right']) if (material[part]) used.add(material[part]);
  }
  for (const asset of used) {
    const url = files[`../../assets/world1/${theme.assets[asset]}`];
    const key = textureKey(theme.id, asset);
    // Missing files deliberately resolve to geometry placeholders, never a broken texture.
    if (url && !scene.textures.exists(key)) scene.load.image(key, url);
  }
}
