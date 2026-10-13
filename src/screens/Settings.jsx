import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SettingsControls from '../components/SettingsControls';
import './Settings.css';
export default function Settings() {
  return <main className="settings-screen">
    <header className="settings-header">
      <Link className="icon-button" to="/" aria-label="Go back" title="Go back"><ArrowLeft size={21} /></Link>
      <h1>Settings</h1>
    </header>
    <section className="settings-content" aria-label="Game settings"><SettingsControls /></section>
  </main>;
}
