import { createContext, useContext, useState } from 'react';
const Context = createContext(null);
const defaults = { bestCoins: 0, completed: false, settings: { sound: true, reducedMotion: false } };
function readSave() {
  try {
    const data = JSON.parse(localStorage.getItem('aaranya:v1'));
    return { bestCoins: Number.isFinite(data?.bestCoins) ? Math.max(0, Math.min(8, data.bestCoins)) : 0, completed: data?.completed === true, settings: { sound: data?.settings?.sound !== false, reducedMotion: data?.settings?.reducedMotion === true } };
  } catch { return defaults; }
}
export function ProgressProvider({ children }) {
  const [save, setSave] = useState(readSave);
  function update(fn) {
    setSave(previous => {
      const next = fn(previous);
      try { localStorage.setItem('aaranya:v1', JSON.stringify(next)); } catch { /* Private browsing can disable persistence. */ }
      return next;
    });
  }
  return <Context.Provider value={{ save, setSettings: settings => update(s => ({ ...s, settings })), complete: coins => update(s => ({ ...s, completed: true, bestCoins: Math.max(s.bestCoins, coins) })) }}>{children}</Context.Provider>;
}
export const useProgress = () => useContext(Context);
