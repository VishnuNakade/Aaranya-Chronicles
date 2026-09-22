import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { SAVE_KEY, initialProgress, normalizeProgress, completeLevel } from './progression';
const Context = createContext(null);
function readSave() {
  try { return normalizeProgress(JSON.parse(localStorage.getItem(SAVE_KEY))); }
  catch { return initialProgress(); }
}
export function ProgressProvider({ children }) {
  const [save, setSave] = useState(readSave);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); setStorageError(false); }
    catch { setStorageError(true); }
  }, [save]);
  const setSettings = useCallback(settings => setSave(s => ({ ...s, settings })), []);
  const complete = useCallback(result => setSave(s => completeLevel(s, result)), []);
  const markStorySeen = useCallback(id => setSave(s => ({ ...s, seenStories: [...new Set([...s.seenStories, id])] })), []);
  return <Context.Provider value={{ save, storageError, setSettings, complete, markStorySeen }}>{children}</Context.Provider>;
}
export const useProgress = () => useContext(Context);
