import { Coins, Pause, Leaf } from 'lucide-react';
import './GameHUD.css';

export default function GameHUD({ health, maxHealth = 3, posture = 100, coins, totalCoins, level, onPause, inactive }) {
  return <div className="fantasy-hud" role="region" aria-label="Game status">
    <div className="hud-vitals">
      <span className="hud-emblem" aria-hidden="true"><Leaf size={22} /></span>
      <div className="hud-bars"><span className="hud-caption">VEER</span>
        <label>Life<progress aria-label="Life" max={maxHealth} value={health} /></label>
        <label>Posture<progress className="posture-meter" aria-label="Posture" max={100} value={posture} /></label>
      </div>
    </div>
    <div className="hud-level" aria-label={`Level ${level.id}: ${level.name}`}>
      <span className="hud-caption">{level.worldName}</span>
      <strong><span className="hud-level-number">{level.id}</span><span className="hud-level-name">{level.name}</span></strong>
    </div>
    <div className="hud-actions">
      <span className="coin-count" role="status" aria-label={`${coins} of ${totalCoins} coins`}><Coins size={24} aria-hidden="true" /><span>{coins} <small>/ {totalCoins}</small></span></span>
      <button className="hud-pause" aria-label="Pause" title="Pause" onClick={onPause} disabled={inactive}><Pause size={22} aria-hidden="true" /></button>
    </div>
  </div>;
}
