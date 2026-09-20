import { Link } from 'react-router-dom';
import { Trees, Mountain, Castle, Lock, ArrowRight, Star } from 'lucide-react';
import Screen from '../components/Screen';
import { worlds } from '../data/worlds';
import { useProgress } from '../app/ProgressContext';
export default function WorldMap() {
  const { save } = useProgress();
  const icons = [Trees, Trees, Mountain, Castle, Castle];
  return <Screen title="A world waiting to be rediscovered" eyebrow="YOUR JOURNEY"><div className="worlds">{worlds.map((world, i) => {
    const Icon = icons[i];
    const body = <><span className="world-number">0{i + 1}</span><Icon className="world-icon" size={55} strokeWidth={1} /><div><h2>{world.name}</h2><p>{world.subtitle}</p></div><div className="world-status">{world.available ? <><Star size={16} />{save.completed ? '1' : '0'} / 1<ArrowRight size={19} /></> : <><Lock size={15} /> Coming later</>}</div></>;
    return world.available ? <Link key={world.id} className="world available" to="/worlds/meadow/levels">{body}</Link> : <div key={world.id} className="world locked">{body}</div>;
  })}</div><Link className="text-link" to="/story">Read the chronicles <ArrowRight size={16} /></Link></Screen>;
}
