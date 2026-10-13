import { useEffect, useRef } from 'react';
import { createGame } from '../game/createGame';
export default function PhaserGame({ bridge, level, settings, onReady }) {
  const parent = useRef(null);
  const instance = useRef(null);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  useEffect(() => {
    // Reveal the level only after its first complete canvas render.
    const offReady = bridge.on('ready', () => instance.current?.events.once('postrender', () => onReady(true)));
    const game = createGame(parent.current, bridge, level, settingsRef.current);
    instance.current = game;
    if (import.meta.env.DEV) window.__AARANYA_GAME__ = game;
    return () => { offReady(); instance.current = null; if (window.__AARANYA_GAME__ === game) delete window.__AARANYA_GAME__; game.destroy(true); };
  }, [bridge, level, onReady]);
  useEffect(() => {
    instance.current?.registry.set('settings', settings);
    bridge.emit('settings', settings);
  }, [bridge, settings]);
  return <div className="phaser-host" ref={parent} aria-label="Aaranya Chronicles game" />;
}
