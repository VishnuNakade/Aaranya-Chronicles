import { useEffect, useRef } from 'react';
import { createGame } from '../game/createGame';
export default function PhaserGame({ bridge, level, settings }) {
  const parent = useRef(null);
  useEffect(() => {
    const game = createGame(parent.current, bridge, level, settings);
    if (import.meta.env.DEV) window.__AARANYA_GAME__ = game;
    return () => { if (window.__AARANYA_GAME__ === game) delete window.__AARANYA_GAME__; game.destroy(true); };
  }, [bridge, level, settings]);
  return <div className="phaser-host" ref={parent} aria-label="Aaranya Chronicles game" />;
}
