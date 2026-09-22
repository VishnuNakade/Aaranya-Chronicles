import { useEffect, useRef } from 'react';
import { createGame } from '../game/createGame';
export default function PhaserGame({ bridge, level, settings }) {
  const parent = useRef(null);
  const instance = useRef(null);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  useEffect(() => {
    const game = createGame(parent.current, bridge, level, settingsRef.current);
    instance.current = game;
    if (import.meta.env.DEV) window.__AARANYA_GAME__ = game;
    return () => { instance.current = null; if (window.__AARANYA_GAME__ === game) delete window.__AARANYA_GAME__; game.destroy(true); };
  }, [bridge, level]);
  useEffect(() => {
    instance.current?.registry.set('settings', settings);
    bridge.emit('settings', settings);
  }, [bridge, settings]);
  return <div className="phaser-host" ref={parent} aria-label="Aaranya Chronicles game" />;
}
