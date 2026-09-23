import { environments, textureKey } from './assets';

export default class EnvironmentRenderer {
  constructor(scene, level) {
    this.scene = scene; this.config = level.environment; this.theme = environments[this.config.world];
    this.layers = []; this.objects = [];
    scene.cameras.main.setBackgroundColor(0x203d40);
    for (const layer of this.config.layers ?? this.theme.layers) {
      const viewWidth = scene.scale.width;
      const width = layer.width ?? viewWidth + Math.max(0, level.width - viewWidth) * layer.factor;
      const texture = scene.textures.exists(textureKey(this.theme.id, layer.asset)) ? scene.textures.get(textureKey(this.theme.id, layer.asset)) : null;
      const source = texture?.getSourceImage();
      // Preserve artwork proportions on long levels instead of stretching trees across the world.
      const segmentWidth = layer.width ?? (source ? layer.height * source.width / source.height : width);
      for (let offset = 0, index = 0; offset < width; offset += segmentWidth, index++) {
        const object = this.art({ ...layer, x: (layer.x ?? 0) + offset, width: segmentWidth, flipX: index % 2 === 1 }, layer.depth, layer.asset === 'sky' ? 0x456b79 : null);
        if (object) {
          object.setScrollFactor(layer.factor, layer.factorY ?? 0);
          if (index === 0) this.layers.push(object);
        }
      }
    }
    for (const item of this.config.terrain ?? []) this.terrain(item);
    for (const item of [...(this.config.decorations ?? []), ...(this.config.props ?? [])]) this.art(item, item.depth ?? -2, 0x65736b);
    for (const item of this.config.hazards ?? []) if (item.type === 'spikes') this.art(item, -1, 0xdce3d2);
  }
  art(item, depth = -1, placeholder = null) {
    const key = textureKey(this.theme.id, item.asset);
    let object;
    if (this.config.mode === 'assets' && this.scene.textures.exists(key)) {
      let frame;
      const crop = item.crop ?? this.theme.crops?.[item.asset];
      if (crop) {
        const [x, y, width, height] = crop;
        frame = `crop:${crop.join(':')}`;
        const texture = this.scene.textures.get(key);
        if (!texture.has(frame)) texture.add(frame, 0, x, y, width, height);
      }
      object = this.scene.add.image(item.x, item.y, key, frame).setOrigin(0).setDisplaySize(item.width, item.height);
      object.setFlipX(Boolean(item.flipX));
    } else if (placeholder != null) {
      object = this.scene.add.rectangle(item.x, item.y, item.width, item.height, placeholder).setOrigin(0);
    }
    if (object) { object.setDepth(depth).setAlpha(item.alpha ?? 1); this.objects.push(object); }
    return object;
  }
  terrain(item) {
    const material = this.theme.materials[item.material] ?? this.theme.materials.stone;
    this.art({ ...item, asset: material.fill, ...item.parts?.fill }, -4, 0x354941);
    if (material.top) this.art({ ...item, asset: material.top, height: material.topHeight, ...item.parts?.top }, -3, 0x78a750);
    for (const side of ['left', 'right']) if (material[side] && this.config.mode === 'assets') {
      const width = Math.min(item.width / 2, material.edgeWidth);
      this.art({ ...item, x: side === 'left' ? item.x : item.x + item.width - width, width, asset: material[side], ...item.parts?.[side] }, -2);
    }
  }
}
