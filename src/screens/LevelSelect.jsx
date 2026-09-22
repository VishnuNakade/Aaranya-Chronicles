import { levels, worlds, getCoinTotal } from '../game/data/levels';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Play, Lock, Star, Coins, Clock } from 'lucide-react';
import Screen from '../components/Screen';
import { useProgress } from '../app/ProgressContext';
import { formatTime } from '../game/results';
import StoryGate from '../components/StoryGate';
export default function LevelSelect() {
  const { save } = useProgress();
  const { worldId } = useParams();
  const world = worlds.find(w => w.id === worldId);
  if (!world?.levelIds.length) return <Navigate to="/worlds" replace />;
  return <StoryGate storyId={world.storyId}><Screen title={world.name} eyebrow="CHOOSE YOUR PATH" back="/worlds">
    <p className="subtitle">Follow the river. Find your next light.</p>
    <div className="levels">{world.levelIds.map(id => {
      const level = levels[id]; const record = save.results[id]; const unlocked = save.unlockedLevels.includes(id);
      const contents = <><div className="level-art"><span>{id}</span>{unlocked ? <Play size={32} /> : <Lock size={28} />}</div>
        <div className="level-info"><h2>{level.name}</h2>
          <p><span><Star size={16} fill={record ? 'currentColor' : 'none'} />{record ? `${record.stars} / 3 stars` : unlocked ? 'Ready to explore' : 'Locked'}</span>
          <span><Coins size={15} />{record?.coins ?? 0}/{getCoinTotal(level)}</span></p>
          {record?.bestTimeMs != null && <p className="level-best-time"><span><Clock size={14} />Best time {formatTime(record.bestTimeMs)}</span></p>}
        </div></>;
      return unlocked ? <Link key={id} className="level available" to={`/play/${id}`} aria-label={`Level ${id}: ${level.name}`}>{contents}</Link>
        : <div key={id} className="level locked" aria-label={`Level ${id}: locked`}>{contents}</div>;
    })}</div></Screen></StoryGate>;
}
