import artwork from '../assets/controls/heal.png';
export default function HealingControl({ charges = 0, inactive, onHeal }) {
  return <button className={`healing-control ${charges > 0 ? 'charged' : ''}`} disabled={inactive || charges === 0}
    aria-label={`Heal (${charges} stored)`} title={`Heal (H) - ${charges} stored`} onClick={onHeal}>
    <img src={artwork} alt="" draggable={false} /><span className="healing-count">{charges}</span>
  </button>;
}
