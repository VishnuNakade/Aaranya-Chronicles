import Screen from '../components/Screen';
import { useProgress } from '../app/ProgressContext';
export default function Settings() {
  const { save, setSettings } = useProgress();
  return <Screen title="Make yourself at home" eyebrow="SETTINGS"><div className="settings-list">{[{ key: 'sound', name: 'Sound effects', detail: 'Coins, footsteps of adventure, and little victories.' }, { key: 'reducedMotion', name: 'Reduced motion', detail: 'A quieter journey, with fewer visual effects.' }].map(option => <label className="setting" key={option.key}><span><strong>{option.name}</strong><small>{option.detail}</small></span><input type="checkbox" checked={save.settings[option.key]} onChange={e => setSettings({ ...save.settings, [option.key]: e.target.checked })} /></label>)}</div></Screen>;
}
