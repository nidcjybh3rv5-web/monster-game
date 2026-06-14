let audioCtx = null, sfxEnabled = true, masterGain = null;
function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = localStorage.getItem('volume') ? parseFloat(localStorage.volume) : 0.7;
  masterGain.connect(audioCtx.destination);
  const buf = audioCtx.createBuffer(1, 1, 22050);
  const src = audioCtx.createBufferSource();
  src.buffer = buf;
  src.connect(masterGain);
  src.start();
  if (audioCtx.state === 'suspended') audioCtx.resume();
}
function playTone(f, d, t, v) {
  if (!sfxEnabled) return;
  initAudio();
  if (!audioCtx || !masterGain) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  let o = audioCtx.createOscillator();
  let g = audioCtx.createGain();
  o.connect(g);
  g.connect(masterGain);
  o.frequency.value = f;
  o.type = t || 'sine';
  g.gain.value = v || 0.2;
  o.start();
  g.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + d);
  o.stop(audioCtx.currentTime + d);
}
function playAttackSound() { playTone(523, 0.12, 'triangle', 0.15); }
function playSkillSound() { playTone(880, 0.18, 'square', 0.2); }
function playHurtSound() { playTone(220, 0.25, 'sawtooth', 0.2); }
function playLevelUpSound() { if (!sfxEnabled) return; playTone(523, 0.12); setTimeout(() => playTone(659, 0.12), 130); setTimeout(() => playTone(784, 0.25), 260); }
function playDefeatSound() { playTone(392, 0.15); setTimeout(() => playTone(523, 0.25), 160); }
function playBossSound() { playTone(110, 0.5, 'sawtooth', 0.3); setTimeout(() => playTone(82, 0.8, 'sawtooth', 0.3), 400); }
window.setMasterVolume = v => { if (masterGain) masterGain.gain.value = v; localStorage.setItem('volume', v); };
window.setSfxEnabled = e => { sfxEnabled = e; localStorage.setItem('mute', e ? '0' : '1'); };
