import { Link } from 'react-router-dom';
import { Play, Lock, Star, Coins } from 'lucide-react';
import Screen from '../components/Screen';
import { useProgress } from '../app/ProgressContext';
export default function LevelSelect() {
  const { save } = useProgress();
  return <Screen title="Meadow Lands" eyebrow="WORLD 01" back="/worlds"><p className="subtitle">Follow the river. Find your first light.</p><div className="levels"><Link className="level available" to="/play/1-1"><div className="level-art"><span>1-1</span><Play size={32} /></div><div className="level-info"><h2>The First Steps</h2><p><span><Star size={16} fill={save.completed ? 'currentColor' : 'none'} />{save.completed ? 'Completed' : 'Ready to explore'}</span><span><Coins size={15} />{save.bestCoins}/8</span></p></div></Link>{['The Riverbend', 'Moss & Memories', 'The Old Sanctuary'].map((name, i) => <div className="level locked" key={name}><div className="level-art"><span>1-{i + 2}</span><Lock size={28} /></div><div className="level-info"><h2>{name}</h2><p>Coming later</p></div></div>)}</div></Screen>;
}
