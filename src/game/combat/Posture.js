export default class Posture {
  constructor() { this.max = 100; this.value = 100; this.recoverAt = 0; this.brokenUntil = 0; }
  damage(amount, now) {
    if (now < this.brokenUntil) return false;
    this.value = Math.max(0, this.value - amount);
    this.recoverAt = now + 2000;
    if (this.value === 0) { this.brokenUntil = now + 900; return true; }
    return false;
  }
  update(now, delta) {
    if (this.value === 0 && now >= this.brokenUntil) this.value = 45;
    if (now >= this.recoverAt) this.value = Math.min(this.max, this.value + delta * 0.018);
  }
}
