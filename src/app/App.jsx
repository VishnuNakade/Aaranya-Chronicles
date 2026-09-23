import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useProgress } from './ProgressContext';
import '../motion.css';
import MainMenu from '../screens/MainMenu';
import WorldMap from '../screens/WorldMap';
import LevelSelect from '../screens/LevelSelect';
import Settings from '../screens/Settings';
import Story from '../screens/Story';
const Play = lazy(() => import('../screens/Play'));
export default function App() {
  const location = useLocation();
  const { save } = useProgress();
  useEffect(() => { document.documentElement.dataset.reducedMotion = String(save.settings.reducedMotion); }, [save.settings.reducedMotion]);
  return <Suspense fallback={<div className="loading">Entering Aaranya...</div>}><div className="screen-entry" key={location.pathname}><Routes><Route path="/" element={<MainMenu />} /><Route path="/worlds" element={<WorldMap />} /><Route path="/worlds/:worldId/levels" element={<LevelSelect />} /><Route path="/settings" element={<Settings />} /><Route path="/story" element={<Story />} /><Route path="/story/:storyId" element={<Story />} /><Route path="/play/:levelId" element={<Play />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes></div></Suspense>;
}
