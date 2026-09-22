import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Star, Coins, Swords, Clock, ArrowRight, RotateCcw, Map } from 'lucide-react';
import { formatTime } from '../game/results';
import './LevelComplete.css';

export default function LevelComplete({ result, level, nextAvailable, onReplay, storageError }) {
  const heading = useRef(null);
  useEffect(() => { heading.current?.focus(); }, []);
  return <div className="game-overlay completion-overlay"><section className="completion" role="dialog" aria-modal="true" aria-labelledby="completion-title">
    <p className="eyebrow">{level.worldName} / {level.id}</p>
    <h2 id="completion-title" ref={heading} tabIndex={-1}>LEVEL COMPLETE</h2>
    <div className="completion-stars" role="img" aria-label={`${result.stars} of 3 stars`}>{[1, 2, 3].map(n => <Star key={n} aria-hidden="true" className={n <= result.stars ? 'earned' : ''} />)}</div>
    <p className="completion-name">{level.name}</p>
    {result.relicId && <p className="completion-name">{level.relicName} recovered</p>}
    <dl className="completion-stats">
      <div><dt><Coins size={18} />Coins collected</dt><dd>{result.coins} <small>/ {result.totalCoins}</small></dd></div>
      <div><dt><Swords size={18} />Enemies defeated</dt><dd>{result.enemiesDefeated} <small>/ {result.totalEnemies}</small></dd></div>
      <div><dt><Clock size={18} />Time</dt><dd>{formatTime(result.timeMs)}</dd></div>
    </dl>
    <p className="completion-save" role="status">{storageError ? 'Progress could not be saved on this browser.' : level.nextLevelId ? `Level ${level.nextLevelId} unlocked` : 'Journey complete'}</p>
    <div className="completion-actions">
      {level.endsCampaign ? <Link className="primary-button" to="/story/ending">The final chapter<ArrowRight size={18} /></Link> : nextAvailable ? <Link className="primary-button" to={`/play/${level.nextLevelId}`}>Next Level<ArrowRight size={18} /></Link> : <button className="primary-button" disabled title={level.nextLevelId ? 'The next level is coming soon' : 'No further levels'}>Next Level <small>{level.nextLevelId ? 'Coming soon' : 'Complete'}</small></button>}
      <button className="secondary-button" onClick={onReplay}><RotateCcw size={18} />Replay</button>
      <Link className="secondary-button" to="/worlds"><Map size={18} />World Map</Link>
    </div>
  </section></div>;
}
