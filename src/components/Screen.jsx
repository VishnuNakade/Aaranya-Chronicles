import { Link } from 'react-router-dom';
import { ArrowLeft, Leaf } from 'lucide-react';
export default function Screen({ title, eyebrow, children, back = '/', className = '' }) {
  return <main className={`screen ${className}`}><header className="screen-header"><Link className="icon-button" to={back} aria-label="Go back" title="Go back"><ArrowLeft /></Link><Link className="small-brand" to="/"><Leaf size={18} /> AARANYA <span>CHRONICLES</span></Link><span className="edition">THE LOST RELICS</span></header><section className="screen-content"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{children}</section><footer className="page-footer"><span>A forgotten land. A new beginning.</span><span>CHAPTER I</span></footer></main>;
}
