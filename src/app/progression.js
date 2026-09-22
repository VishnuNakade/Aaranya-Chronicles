import { firstLevelId, levels, getCoinTotal, getEnemyTotal } from '../game/data/levels';
import { calculateStars } from '../game/results';
import { stories } from '../data/stories';

export const SAVE_KEY = 'aaranya:v1';
const integer = (value, max) => Number.isFinite(value) ? Math.max(0, Math.min(max, Math.floor(value))) : 0;
export function initialProgress() {
  return { version: 2, results: {}, relics: [], unlockedLevels: [firstLevelId], seenStories: [], completed: false, bestCoins: 0, settings: { sound: true, reducedMotion: false } };
}
export function normalizeProgress(data) {
  const save = initialProgress();
  if (!data || typeof data !== 'object') return save;
  save.seenStories = Array.isArray(data.seenStories) ? [...new Set(data.seenStories.filter(id => typeof id === 'string' && stories[id]))] : [];
  save.settings = { sound: data.settings?.sound !== false, reducedMotion: data.settings?.reducedMotion === true };
  for (const [id, record] of Object.entries(data.results ?? {})) {
    if (!levels[id] || !record || !Number.isFinite(record.stars) || record.stars < 1) continue;
    const time = record.bestTimeMs ?? record.timeMs;
    const coins = integer(record.coins, getCoinTotal(levels[id]));
    save.results[id] = { stars: integer(record.stars, 3), coins, bestTimeMs: Number.isFinite(time) && time >= 0 ? Math.floor(time) : null,
      enemiesDefeated: integer(record.enemiesDefeated, getEnemyTotal(levels[id])), bossDefeated: record.bossDefeated === true };
  }
  // Migrate the original single-level save, without inventing a completion time.
  if (data.completed === true && !save.results[firstLevelId]) save.results[firstLevelId] = { stars: 1, coins: integer(data.bestCoins, getCoinTotal(levels[firstLevelId])), bestTimeMs: null, enemiesDefeated: 0 };
  const unlocked = new Set([firstLevelId]);
  // Only completed, reachable levels can unlock successors; edited/stale saves cannot skip a chain.
  const visit = id => {
    if (!save.results[id] || (levels[id].boss && !save.results[id].bossDefeated)) return;
    const next = levels[id]?.nextLevelId;
    if (next && levels[next] && !unlocked.has(next)) { unlocked.add(next); visit(next); }
  };
  visit(firstLevelId);
  save.results = Object.fromEntries(Object.entries(save.results).filter(([id]) => unlocked.has(id)));
  save.unlockedLevels = [...unlocked];
  save.relics = [...new Set(Object.keys(save.results).filter(id => levels[id].boss && save.results[id].bossDefeated).map(id => levels[id].relicId).filter(Boolean))];
  save.completed = Boolean(save.results[firstLevelId]);
  save.bestCoins = save.results[firstLevelId]?.coins ?? 0;
  return save;
}
export function completeLevel(save, result) {
  const level = levels[result.levelId];
  if (!result.won || !level || (level.boss && result.bossDefeated !== true) || !save.unlockedLevels.includes(result.levelId) || !Number.isFinite(result.timeMs) || result.timeMs < 0) return save;
  const run = { ...result, coins: integer(result.coins, getCoinTotal(level)), totalCoins: getCoinTotal(level), enemiesDefeated: integer(result.enemiesDefeated, getEnemyTotal(level)), totalEnemies: getEnemyTotal(level), timeMs: Math.floor(result.timeMs) };
  run.stars = calculateStars(run);
  const previous = save.results[result.levelId];
  const record = { stars: Math.max(previous?.stars ?? 0, run.stars), coins: Math.max(previous?.coins ?? 0, run.coins),
    bestTimeMs: previous?.bestTimeMs == null ? run.timeMs : Math.min(previous.bestTimeMs, run.timeMs),
    enemiesDefeated: Math.max(previous?.enemiesDefeated ?? 0, run.enemiesDefeated), bossDefeated: Boolean(level.boss && result.bossDefeated), lastRun: run };
  return { ...save, version: 2, completed: true, bestCoins: result.levelId === firstLevelId ? record.coins : save.bestCoins,
    relics: [...new Set([...(save.relics ?? []), ...(level.boss && level.relicId ? [level.relicId] : [])])],
    results: { ...save.results, [result.levelId]: record },
    unlockedLevels: [...new Set([...save.unlockedLevels, ...(level.nextLevelId && levels[level.nextLevelId] ? [level.nextLevelId] : [])])] };
}
