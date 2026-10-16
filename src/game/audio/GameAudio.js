const files = import.meta.glob('../../assets/sound/*.mp3', { eager: true, query: '?url', import: 'default' });
// Skip the recordings' quiet lead-ins; input and animation timing stay unchanged.
const attackLeadIn = { 'veer-sword': 0.15, 'enemy-sword': 0.25, 'warden-sword': 0.08 };
export function preloadAudio(scene) {
  for (const [path, url] of Object.entries(files)) scene.load.audio(path.split('/').pop().replace('.mp3', ''), url);
}

export default class GameAudio {
  constructor(scene) {
    this.scene = scene; this.sounds = {}; this.combatUntil = 0;
    // The supplied 18-second recording begins quietly. Extract its first jump
    // and normalize once, keeping the original recording untouched.
    const context = scene.sound.context;
    const source = scene.cache.audio.get('jump');
    if (context && source?.getChannelData && !scene.cache.audio.exists('jump-cue')) {
      const start = Math.floor(0.65 * source.sampleRate);
      const length = Math.floor(0.55 * source.sampleRate);
      const cue = context.createBuffer(source.numberOfChannels, length, source.sampleRate);
      let peak = 0;
      for (let channel = 0; channel < source.numberOfChannels; channel++) {
        const samples = source.getChannelData(channel).subarray(start, start + length);
        cue.getChannelData(channel).set(samples);
        for (const sample of samples) peak = Math.max(peak, Math.abs(sample));
      }
      const gain = peak > 0 ? Math.min(12, 0.85 / peak) : 1;
      const fade = Math.floor(source.sampleRate * 0.008);
      for (let channel = 0; channel < cue.numberOfChannels; channel++) {
        const samples = cue.getChannelData(channel);
        for (let i = 0; i < length; i++) samples[i] *= gain * Math.min(1, i / fade, (length - 1 - i) / fade);
      }
      scene.cache.audio.add('jump-cue', cue);
    }
    for (const key of ['meadow-ambience', 'combat-music', 'veer-sword', 'enemy-sword', 'warden-sword', 'jump', 'veer-footsteps']) {
      this.sounds[key] = scene.sound.add(key === 'jump' && scene.cache.audio.exists('jump-cue') ? 'jump-cue' : key);
    }
    this.suspended = false;
    scene.events.once('shutdown', () => Object.values(this.sounds).forEach(sound => sound.destroy()));
  }
  effect(key, actor) {
    if (!this.scene.settings.sound || this.suspended || this.scene.finished || this.scene.sound.locked) return;
    if (actor && Math.abs(actor.x - this.scene.player.x) > 650) return;
    const sound = this.sounds[key];
    if (sound.isPlaying) sound.stop();
    sound.setVolume(key === 'jump' ? 0.3 : 0.7);
    sound.play({ volume: key === 'jump' ? 0.3 : 0.7,
      seek: key === 'jump' && sound.key !== 'jump-cue' ? 0.65 : attackLeadIn[key] ?? 0 });
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
    this.loop('meadow-ambience', !combat, 0.5);
    this.loop('combat-music', combat, 0.6);
    this.loop('veer-footsteps', !s.player.dead && s.player.state === 'run' && s.player.body.blocked.down && Math.abs(s.player.body.velocity.x) > 20, 0.24);
  }
  loop(key, enabled, volume) {
    const sound = this.sounds[key];
    sound.setVolume(volume);
    if (enabled && !sound.isPlaying) sound.play({ loop: true });
    else if (!enabled && (sound.isPlaying || sound.isPaused)) sound.stop();
  }
}
