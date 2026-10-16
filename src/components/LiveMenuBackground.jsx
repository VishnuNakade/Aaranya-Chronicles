import { useEffect, useRef } from 'react';
import { createMenuBackground } from './menuBackgroundRenderer';

export default function LiveMenuBackground({ enabled }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!enabled) return;
    const canvas = ref.current;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let renderer, observer, frame = 0, disposed = false, elapsed = 0, last = 0;
    const stop = () => { cancelAnimationFrame(frame); frame = 0; last = 0; };
    const draw = now => {
      if (disposed || document.hidden || motion.matches) { stop(); return; }
      if (!last || now - last >= 1000 / 30) {
        elapsed += last ? Math.min(now - last, 100) / 1000 : 0;
        last = now; renderer.draw(elapsed);
      }
      frame = requestAnimationFrame(draw);
    };
    const visibility = () => {
      stop();
      canvas.style.visibility = motion.matches ? 'hidden' : '';
      if (renderer && !document.hidden && !motion.matches) frame = requestAnimationFrame(draw);
    };
    const lost = event => { event.preventDefault(); stop(); canvas.style.visibility = 'hidden'; };
    const image = new Image();
    image.onload = () => {
      if (disposed) return;
      const style = getComputedStyle(canvas.parentElement);
      const x = parseFloat(style.backgroundPositionX) / 100;
      const y = parseFloat(style.backgroundPositionY) / 100;
      renderer = createMenuBackground(canvas, image, Number.isFinite(y) ? y : 0.54, Number.isFinite(x) ? x : 0.5);
      if (!renderer) return;
      const resize = () => {
        const { width, height } = canvas.getBoundingClientRect();
        const current = getComputedStyle(canvas.parentElement);
        renderer.resize(width, height, parseFloat(current.backgroundPositionX) / 100, parseFloat(current.backgroundPositionY) / 100);
        renderer.draw(elapsed);
      };
      observer = new ResizeObserver(resize); observer.observe(canvas);
      resize(); canvas.dataset.ready = 'true'; visibility();
    };
    image.src = `${import.meta.env.BASE_URL}assets/forest.png`;
    document.addEventListener('visibilitychange', visibility);
    motion.addEventListener('change', visibility);
    canvas.addEventListener('webglcontextlost', lost);
    return () => {
      disposed = true; stop(); observer?.disconnect(); renderer?.destroy();
      document.removeEventListener('visibilitychange', visibility);
      motion.removeEventListener('change', visibility);
      canvas.removeEventListener('webglcontextlost', lost);
    };
  }, [enabled]);
  return enabled ? <canvas ref={ref} className="menu-live-background" aria-hidden="true" /> : null;
}
