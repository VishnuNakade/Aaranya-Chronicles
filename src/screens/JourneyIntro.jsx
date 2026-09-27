import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useProgress } from '../app/ProgressContext';
import artwork from '../assets/story/journey-intro.png';
import './JourneyIntro.css';

export default function JourneyIntro() {
  const { save, beginJourney } = useProgress();
  const navigate = useNavigate();
  if (save.journeyStarted) return <Navigate to="/worlds" replace />;
  return <main className="journey-intro" aria-label="The journey begins">
    <img src={artwork} alt="The opening chronicle: soldiers burn the village and capture its people. A wounded guardian gives the hero a forest emblem, and he vows to rescue them from Blackstone Fort." />
    <footer><button className="primary-button" onClick={() => { beginJourney(); navigate('/worlds', { replace: true }); }}>Next <ArrowRight size={20} /></button></footer>
  </main>;
}
