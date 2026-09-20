import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Screen from '../components/Screen';
const pages = [
  { title: 'Every kingdom has a story.', text: 'Once, five ancient relics kept Aaranya in balance. Rivers sang through the valleys, forests sheltered its people, and a light shone in every home.' },
  { title: 'Even a small light can lead the way.', text: 'When the relics shattered, the paths between the five lands fell silent. Now Veer follows a glimmer beyond his village, carrying little more than a red scarf and the courage to begin.' },
];
export default function Story() {
  const [page, setPage] = useState(0);
  return <Screen title={pages[page].title} eyebrow={`THE CHRONICLES / 0${page + 1}`} className="story-screen"><p className="story-copy">{pages[page].text}</p><div className="story-navigation"><span>{page + 1} / {pages.length}</span>{page === 0 ? <button className="primary-button" onClick={() => setPage(1)}>Turn the page <ArrowRight size={18} /></button> : <Link className="primary-button" to="/worlds/meadow/levels">Begin chapter one <ArrowRight size={18} /></Link>}</div><Link className="story-link" to="/worlds/meadow/levels">Skip story</Link></Screen>;
}
