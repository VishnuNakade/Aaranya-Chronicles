import { Gem } from 'lucide-react';
import './BossHUD.css';

export default function BossHUD({ boss, victory }) {
  if (!boss) return null;
  return <>
    <section className={`boss-hud ${boss.vulnerable ? 'exposed' : ''}`} aria-label="Stone Guardian">
      <div className="boss-heading"><strong>STONE GUARDIAN</strong><span>Phase {boss.phase} / 3</span></div>
      <div className="boss-health" role="progressbar" aria-label="Boss health" aria-valuemin={0} aria-valuemax={boss.maxHealth} aria-valuenow={boss.health}><div style={{ width: `${boss.health / boss.maxHealth * 100}%` }} /></div>
      <span className="boss-cue" role="status">{boss.cue}</span>
    </section>
    {victory && <div className="relic-victory" role="status"><Gem size={36} /><h2>Relic restored</h2><p>{victory.name}</p><p>Whispering Woods awaits</p></div>}
  </>;
}
