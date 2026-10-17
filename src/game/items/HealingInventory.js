const KEY = 'aaranya:healing:v1';
export default class HealingInventory {
  constructor(storage = globalThis.localStorage) {
    this.storage = storage; this.charges = 0; this.harvested = new Set();
    this.starterGiftClaimed = false;
    try {
      const data = JSON.parse(storage.getItem(KEY));
      if (Number.isSafeInteger(data?.charges) && data.charges >= 0) this.charges = data.charges;
      this.starterGiftClaimed = data?.starterGiftClaimed === true;
    } catch { /* An unavailable save must not prevent gameplay. */ }
  }
  save() {
    try { this.storage.setItem(KEY, JSON.stringify({ charges: this.charges, starterGiftClaimed: this.starterGiftClaimed })); return true; }
    catch { return false; }
  }
  grantStarterGift(levelId) {
    if (levelId !== '1-1' || this.starterGiftClaimed) return false;
    this.starterGiftClaimed = true;
    this.charges += 2;
    this.save();
    return true;
  }
  collect(id) {
    if (this.harvested.has(id)) return false;
    this.harvested.add(id); this.charges++; this.save(); return true;
  }
  use(player) {
    if (!this.charges || player.dead || player.health >= player.maxHealth) return false;
    player.health = Math.min(player.maxHealth, player.health + 1);
    this.charges--; this.save(); player.emit('vitals'); return true;
  }
}
