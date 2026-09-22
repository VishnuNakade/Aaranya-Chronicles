export function calculateStars({ won, coins, totalCoins, enemiesDefeated, totalEnemies }) {
  if (!won) return 0;
  return 1 + Number(totalCoins === 0 || coins >= Math.ceil(totalCoins * 0.8)) + Number(enemiesDefeated >= totalEnemies);
}
export function formatTime(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
