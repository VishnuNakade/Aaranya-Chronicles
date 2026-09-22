import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUp, Swords, Flag } from 'lucide-react';
import PhaserGame from '../components/PhaserGame';
import BossHUD from '../components/BossHUD';
import GameHUD from '../components/GameHUD';
import LevelComplete from '../components/LevelComplete';
import RunMenu from '../components/RunMenu';
import { createBridge } from '../game/bridge';
import { levels, worlds, getCoinTotal } from '../game/data/levels';
import StoryGate from '../components/StoryGate';
import { useProgress } from '../app/ProgressContext';
function Control({ action, label, bridge, children }) {
  const release = () => bridge.emit('input', { action, down: false });
  return <button className="touch-button" aria-label={label} title={label} onContextMenu={e => e.preventDefault()} onPointerDown={e => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); bridge.emit('input', { action, down: true }); }} onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}>{children}</button>;
}
export default function Play() {
  const { levelId } = useParams();
  const { save } = useProgress();
  if (levels[levelId] && !save.unlockedLevels.includes(levelId)) return <Navigate to={`/worlds/${levels[levelId].worldId}/levels`} replace />;
  const level = levels[levelId];
  const world = worlds.find(world => world.id === level?.worldId);
  return <StoryGate storyId={world?.storyId}><StoryGate storyId={level?.bossStoryId ?? (level?.isBoss ? world?.bossStoryId : undefined)}><PlayLevel key={levelId} /></StoryGate></StoryGate>;
}
function PlayLevel() {
  const { levelId } = useParams(); const level = levels[levelId]; const { save, complete, storageError } = useProgress();
  const bridge = useMemo(createBridge, []); const [hud, setHud] = useState({ health: 3, coins: 0 }); const [paused, setPaused] = useState(false); const [result, setResult] = useState(null);
  const [boss, setBoss] = useState(null); const [victory, setVictory] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  useEffect(() => { const off = [bridge.on('boss', setBoss), bridge.on('victory', setVictory), bridge.on('hud', setHud), bridge.on('paused', setPaused), bridge.on('result', data => { setResult(data); if (data.won) complete(data); })]; return () => off.forEach(fn => fn()); }, [bridge, complete]);
  useEffect(() => {
    const escape = event => {
      if (event.code !== 'Escape' || event.repeat || result) return;
      event.preventDefault();
      if (settingsOpen) setSettingsOpen(false);
      else bridge.emit('pause', !paused);
    };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [bridge, paused, result, settingsOpen]);
  function restart() { setBoss(null); setVictory(null); setSettingsOpen(false); setResult(null); setPaused(false); bridge.emit('restart'); }
  if (!level) return <main className="loading">This path is still undiscovered.<Link to="/worlds">Return to the map</Link></main>;
  return <main className="play-screen"><header className="play-header"><Link to={`/worlds/${level.worldId}/levels`} className="icon-button" title="Leave level" aria-label="Leave level"><ArrowLeft /></Link><div><span className="eyebrow">{level.worldName} / {level.id}</span><h1>{level.name}</h1></div><span className="play-chapter">AARANYA CHRONICLES</span></header><div className="game-stage"><PhaserGame bridge={bridge} level={level} settings={save.settings} /><GameHUD health={hud.health} coins={hud.coins} totalCoins={getCoinTotal(level)} level={level} inactive={paused || Boolean(result)} onPause={() => bridge.emit('pause', true)} />{!result && <BossHUD boss={boss} victory={victory} />}<div className="touch-controls"><div><Control bridge={bridge} action="left" label="Move left"><ArrowLeft /></Control><Control bridge={bridge} action="right" label="Move right"><ArrowRight /></Control></div><div><Control bridge={bridge} action="attack" label="Attack"><Swords /></Control><Control bridge={bridge} action="jump" label="Jump"><ArrowUp /></Control></div></div>{result?.won && <LevelComplete result={result} level={level} nextAvailable={Boolean(levels[level.nextLevelId])} onReplay={restart} storageError={storageError} />}{(paused || (result && !result.won)) && <RunMenu gameOver={Boolean(result && !result.won)} settingsOpen={settingsOpen} onSettings={setSettingsOpen} onResume={() => bridge.emit('pause', false)} onRestart={restart} />}</div><footer className="game-footer"><span>{level.id} <span className="muted">/</span> {level.name}</span><span><Flag size={14} /> The sanctuary awaits</span></footer></main>;
}
