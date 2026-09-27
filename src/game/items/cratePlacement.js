// Resolve the support surface independently of transparent sprite padding.
export function cratePlacement(level, config) {
  const surfaces = config.platform != null ? [level.platforms[config.platform]] : [...level.ground, ...level.platforms];
  const support = surfaces.filter(Boolean).filter(([x, , width]) => config.x - 24 >= x && config.x + 24 <= x + width)
    .sort((a, b) => Math.abs(a[1] - (config.y + 24)) - Math.abs(b[1] - (config.y + 24)))[0];
  if (!support) throw new Error(`Health crate at ${config.x} has no supporting terrain in ${level.id}`);
  return { ...config, y: support[1] - 24 };
}
