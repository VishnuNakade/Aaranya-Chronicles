import { useProgress } from '../app/ProgressContext';
export default function SettingsControls() {
  const { save, setSettings } = useProgress();
  return <div className="settings-list">{[{ key: 'sound', name: 'Sound effects' }, { key: 'reducedMotion', name: 'Reduced motion' }].map(option => <label className="setting" key={option.key}><strong>{option.name}</strong><input type="checkbox" checked={save.settings[option.key]} onChange={event => setSettings({ ...save.settings, [option.key]: event.target.checked })} /></label>)}</div>;
}
