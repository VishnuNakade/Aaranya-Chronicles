import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Play, RotateCcw, Settings, LogOut, Map, ArrowLeft, Shield, HeartCrack } from 'lucide-react';
import SettingsControls from './SettingsControls';
import './RunMenu.css';

export default function RunMenu({ gameOver, settingsOpen, onSettings, onResume, onRestart }) {
  const panel = useRef(null);
  useEffect(() => { panel.current?.querySelector('button, a, input')?.focus(); }, [gameOver, settingsOpen]);
  function trapFocus(event) {
    if (event.key !== 'Tab') return;
    const nodes = [...panel.current.querySelectorAll('button:not(:disabled), a, input')];
    const first = nodes[0], last = nodes.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  return <div className="game-overlay run-menu-overlay"><section ref={panel} className="dialog run-menu" role="dialog" aria-modal="true" aria-labelledby="run-menu-title" onKeyDown={trapFocus}>
    {gameOver ? <HeartCrack className="run-menu-symbol" size={34} /> : <Shield className="run-menu-symbol" size={34} />}
    <p className="eyebrow">AARANYA CHRONICLES</p>
    <h2 id="run-menu-title">{gameOver ? 'Game Over' : settingsOpen ? 'Settings' : 'Paused'}</h2>
    {gameOver ? <div className="run-menu-actions"><button className="primary-button" onClick={onRestart}><RotateCcw size={18} />Retry</button><Link className="secondary-button" to="/worlds"><Map size={18} />Back to World Map</Link></div>
      : settingsOpen ? <><SettingsControls /><button className="secondary-button" onClick={() => onSettings(false)}><ArrowLeft size={18} />Back to Pause</button></>
      : <div className="run-menu-actions"><button className="primary-button" onClick={onResume}><Play size={18} />Resume</button><button className="secondary-button" onClick={onRestart}><RotateCcw size={18} />Restart</button><button className="secondary-button" onClick={() => onSettings(true)}><Settings size={18} />Settings</button><Link className="secondary-button" to="/"><LogOut size={18} />Exit to Menu</Link></div>}
  </section></div>;
}
