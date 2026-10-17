import artwork from '../assets/controls/heal.png';
import arrow from '../assets/controls/heal-arrow.svg';
export default function HealingControl({ charges = 0, inactive, onHeal, tutorial = false }) {
  return <button className={`healing-control ${charges > 0 ? 'charged' : ''} ${tutorial ? 'heal-tutorial-target' : ''}`} disabled={inactive || charges === 0}
    aria-label={`Heal (${charges} stored)`} title={`Heal (H) - ${charges} stored`}
    onContextMenu={event => event.preventDefault()}
    onPointerDown={event => {
      if (event.button !== 0) return;
      event.preventDefault();
      onHeal();
    }}
    onClick={event => { if (event.detail === 0) onHeal(); }}>
    <img src={artwork} alt="" draggable={false} /><span className="healing-count">{charges}</span>
    {tutorial && <span className="heal-tutorial-prompt" role="status">Tap to heal<img className="heal-tutorial-arrow" src={arrow} alt="" /></span>}
  </button>;
}
