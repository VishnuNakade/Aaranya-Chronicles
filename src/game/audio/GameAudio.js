const files = import.meta.glob('../../assets/sound/*.mp3', { eager: true, query: '?url', import: 'default' });
export function preloadAudio(scene) {
  for (const [path, url] of Object.entries(files)) scene.load.audio(path.split('/').pop().replace('.mp3', ''), url);
}

export default class GameAudio {
  constructor(scene) {
    this.scene = scene; this.sounds = {}; this.combatUntil = 0;
    for (const key of ['meadow-ambience', 'combat-music', 'veer-sword', 'enemy-sword', 'warden-sword', 'jump', 'veer-footsteps']) {
      this.sounds[key] = scene.sound.add(key);
    }
    this.suspended = false;
    scene.events.once('shutdown', () => Object.values(this.sounds).forEach(sound => sound.destroy()));
  }
  effect(key, actor) {
    if (!this.scene.settings.sound || this.suspended || this.scene.finished || this.scene.sound.locked) return;
    if (actor && Math.abs(actor.x - this.scene.player.x) > 650) return;
    const sound = this.sounds[key];
    if (sound.isPlaying) sound.stop();
    sound.setVolume(key === 'jump' ? 0.35 : 0.7);
    sound.play();
    // Jump recordings are long; limit playback to the actual takeoff cue.
    if (key === 'jump') {
      this.jumpStop?.remove();
      this.jumpStop = this.scene.time.delayedCall(550, () => sound.stop());
    }
  }
  pause(value) {
    this.suspended = value;
    for (const sound of Object.values(this.sounds)) {
      if (value) sound.pause();
      else if (this.scene.settings.sound) sound.resume();
    }
  }
  update() {
    const s = this.scene;
    if (!s.settings.sound) { Object.values(this.sounds).forEach(sound => sound.stop()); return; }
    if (this.suspended || s.sound.locked || s.finished) return;
    const fighting = s.enemies.getChildren().some(e => !e.dead && e.aggro) || (s.boss && !s.boss.dead && Math.abs(s.boss.x - s.player.x) < 500);
    if (fighting) this.combatUntil = s.time.now + 1800;
    const combat = fighting || s.time.now < this.combatUntil;
    this.loop('meadow-ambience', !combat, 0.25);
    this.loop('combat-music', combat, 0.14);
    this.loop('veer-footsteps', !s.player.dead && s.player.state === 'run' && s.player.body.blocked.down && Math.abs(s.player.body.velocity.x) > 20, 0.24);
  }
  loop(key, enabled, volume) {
    const sound = this.sounds[key];
    sound.setVolume(volume);
    if (enabled && !sound.isPlaying) sound.play({ loop: true });
    else if (!enabled && (sound.isPlaying || sound.isPaused)) sound.stop();
  }
}
