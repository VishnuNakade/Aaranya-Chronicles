import { Coins, Heart, Pause, Leaf } from 'lucide-react';
import './GameHUD.css';

export default function GameHUD({ health, coins, totalCoins, level, onPause, inactive }) {
  return <div className="fantasy-hud" role="region" aria-label="Game status">
    <div className="hud-vitals">
      <span className="hud-emblem" aria-hidden="true"><Leaf size={22} /></span>
      <div><span className="hud-caption">VEER</span><span className="hearts" role="status" aria-label={`${health} hearts`}>
        {[1, 2, 3].map(n => <Heart key={n} size={25} aria-hidden="true" className={n <= health ? 'heart-full' : 'heart-empty'} />)}
      </span></div>
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
