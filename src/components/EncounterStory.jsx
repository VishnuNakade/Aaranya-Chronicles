import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { encounterStories } from '../data/encounterStories';
import './EncounterStory.css';

export default function EncounterStory({ id, onContinue }) {
  const next = useRef(null);
  useEffect(() => { next.current?.focus(); }, []);
  const story = encounterStories[id];
  if (!story) return null;
  return <section className="encounter-story" role="dialog" aria-modal="true" aria-labelledby="encounter-title">
    <img className="encounter-art" src={story.image} alt={story.alt} />
    <div className="encounter-caption"><div><h2 id="encounter-title">{story.title}</h2><p>{story.text}</p></div>
      <button ref={next} className="primary-button" onClick={onContinue}>Next <ArrowRight size={22} /></button>
    </div>
  </section>;
}
