import { Link } from 'react-router-dom';
import { Trees, Mountain, Castle, Landmark, Lock, ArrowLeft, Star, Compass, BookOpen } from 'lucide-react';
import { worlds } from '../game/data/levels';
import { useProgress } from '../app/ProgressContext';
import './WorldMap.css';

const locations = {
  meadow: { x: 14, y: 60, Icon: Trees },
  woods: { x: 33, y: 30, Icon: Trees },
  ruins: { x: 52, y: 63, Icon: Landmark },
  peaks: { x: 71, y: 29, Icon: Mountain },
  citadel: { x: 87, y: 56, Icon: Castle },
};

export default function WorldMap() {
  const { save } = useProgress();
  const earned = worlds.reduce((sum, world) => sum + world.levelIds.reduce((stars, id) => stars + (save.results[id]?.stars ?? 0), 0), 0);
  const total = worlds.reduce((sum, world) => sum + world.levelIds.length * 3, 0);
  return <main className="atlas-screen">
    <header className="atlas-header">
      <Link className="icon-button" to="/" aria-label="Back to main menu" title="Back to main menu"><ArrowLeft size={21} /></Link>
      <div className="atlas-title"><span>AARANYA CHRONICLES</span><h1>World Map</h1></div>
      <span className="atlas-stars" aria-label={`${earned} of ${total} stars`}><Star size={20} fill="currentColor" />{earned}<small>/ {total}</small></span>
    </header>
    <div className="atlas-scroll" tabIndex={0} role="region" aria-label="Connected world locations">
      <div className="atlas-map">
        <div className="atlas-vignette" />
        <svg className="atlas-paths" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path className="atlas-path-shadow" d="M14 60 C18 47 24 49 33 30 S44 46 52 63 S65 43 71 29 S82 36 87 56" />
          <path d="M14 60 C18 47 24 49 33 30 S44 46 52 63 S65 43 71 29 S82 36 87 56" />
        </svg>
        <div className="atlas-caption" aria-hidden="true">THE FIVE REALMS</div>
        {worlds.map((world, i) => {
          const { x, y, Icon } = locations[world.id];
          const unlocked = world.levelIds.some(id => save.unlockedLevels.includes(id));
          const stars = world.levelIds.reduce((sum, id) => sum + (save.results[id]?.stars ?? 0), 0);
          const content = <><span className="atlas-marker"><Icon className="atlas-location-icon" size={30} strokeWidth={1.5} /><span className="atlas-badge">{unlocked ? i + 1 : <Lock size={15} />}</span></span>
            <span className="atlas-label"><span className="atlas-world-name">{world.name}</span>
              <span className="atlas-world-status">{unlocked ? <><Star size={12} fill="currentColor" />{stars} / {world.levelIds.length * 3}</> : <><Lock size={11} />Locked</>}</span>
            </span></>;
          const style = { left: `${x}%`, top: `${y}%` };
          return unlocked ? <Link className="atlas-location is-unlocked" key={world.id} style={style} to={`/worlds/${world.id}/levels`} aria-label={`${world.name}, ${stars} of ${world.levelIds.length * 3} stars, open levels`}>{content}</Link>
            : <button type="button" disabled className="atlas-location is-locked" key={world.id} style={style} aria-label={`${world.name}, locked`}>{content}</button>;
        })}
        <div className="atlas-compass" aria-hidden="true"><span>N</span><Compass size={42} strokeWidth={1} /></div>
      </div>
    </div>
    <footer className="atlas-footer"><span>A forgotten land. A new beginning.</span><Link to="/story"><BookOpen size={16} />The chronicles</Link></footer>
  </main>;
}
