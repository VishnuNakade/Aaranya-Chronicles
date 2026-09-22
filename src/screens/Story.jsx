import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Screen from '../components/Screen';
import { stories } from '../data/stories';
import { useProgress } from '../app/ProgressContext';
import './Story.css';

export default function Story({ storyId: suppliedId, onComplete }) {
  const { storyId: routeId } = useParams();
  const id = suppliedId ?? routeId ?? 'intro';
  return <StoryPages key={id} id={id} onComplete={onComplete} />;
}
function StoryPages({ id, onComplete }) {
  const story = stories[id];
  const [page, setPage] = useState(0);
  const navigate = useNavigate();
  const { markStorySeen } = useProgress();
  if (!story) return <Screen title="An unwritten chapter" eyebrow="THE CHRONICLES"><button className="primary-button" onClick={() => navigate('/worlds')}>World Map</button></Screen>;
  function finish() {
    if (onComplete) onComplete();
    else { markStorySeen(id); navigate(story.next, { replace: true }); }
  }
  return <Screen title={story.pages[page].title} eyebrow={`THE CHRONICLES / ${story.name}`} className="story-screen" back="/worlds">
    {!onComplete && <label className="story-chapter-picker">Chronicle<select aria-label="Story chapter" value={id} onChange={event => navigate('/story/' + event.target.value)}>{Object.entries(stories).map(([key, chapter]) => <option key={key} value={key}>{chapter.name}</option>)}</select></label>}
    <p className="story-copy" aria-live="polite">{story.pages[page].text}</p>
    <div className="story-navigation"><button className="icon-button" aria-label="Previous page" title="Previous page" disabled={page === 0} onClick={() => setPage(p => p - 1)}><ArrowLeft size={18} /></button><span>{page + 1} / {story.pages.length}</span>
      {page < story.pages.length - 1 ? <button className="primary-button" onClick={() => setPage(p => p + 1)}>Turn the page <ArrowRight size={18} /></button> : <button className="primary-button" onClick={finish}>{story.continueLabel ?? 'Continue'}<ArrowRight size={18} /></button>}
    </div><button className="story-link story-skip" onClick={finish}>Skip story</button>
  </Screen>;
}
