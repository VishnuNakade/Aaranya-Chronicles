import artwork from '../assets/controls/heal.png';
export default function HealingControl({ charges = 0, inactive, onHeal }) {
  return <button className={`healing-control ${charges > 0 ? 'charged' : ''}`} disabled={inactive || charges === 0}
    aria-label={`Heal (${charges} stored)`} title={`Heal (H) - ${charges} stored`}
    onContextMenu={event => event.preventDefault()}
    onPointerDown={event => {
      if (event.button !== 0) return;
      event.preventDefault();
      onHeal();
    }}
    onClick={event => { if (event.detail === 0) onHeal(); }}>
    <img src={artwork} alt="" draggable={false} /><span className="healing-count">{charges}</span>
  </button>;
}
