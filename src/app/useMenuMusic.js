import { useEffect, useRef } from 'react';
import menuTrack from '../assets/sound/game-bg.mp3';

export default function useMenuMusic(pathname, soundEnabled) {
  const audioRef = useRef(null);
  const active = soundEnabled && (pathname === '/' || pathname === '/journey' || pathname === '/settings' || pathname === '/worlds' || /^\/worlds\/[^/]+\/levels$/.test(pathname));
  useEffect(() => {
    const audio = new Audio(menuTrack);
    audio.loop = true;
    audio.volume = 0.5;
    audio.preload = 'auto';
    audioRef.current = audio;
    return () => { audio.pause(); audio.removeAttribute('src'); audio.load(); audioRef.current = null; };
  }, []);
  useEffect(() => {
    const audio = audioRef.current;
    const play = () => {
      if (active && !document.hidden && audio.paused) audio.play().catch(() => { /* Retry after the next user gesture. */ });
    };
    const visibility = () => { if (document.hidden) audio.pause(); else play(); };
    if (!active) audio.pause();
    else play();
    window.addEventListener('pointerdown', play);
    window.addEventListener('keydown', play);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      window.removeEventListener('pointerdown', play);
      window.removeEventListener('keydown', play);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [active]);
}
