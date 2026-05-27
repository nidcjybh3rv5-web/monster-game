let audioCtx = null, sfxEnabled = true, masterGain = null;
function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = localStorage.volume ? parseFloat(localStorage.volume) : 0.7;
  masterGain.connect(audioCtx.destination);
  let buf = audioCtx.createBuffer(1, 1, 22050);
  let src = audioCtx.createBufferSource();
  src.buffer = buf;
  src.connect(masterGain);
  src.start();
}
function playTone(f, d, t, v) {
  if (!sfxEnabled || !audioCtx || !masterGain) return;
  let o = audioCtx.createOscillator(), g = audioCtx.createGain();
  o.connect(g); g.connect(masterGain);
  o.frequency.value = f; o.type = t || 'sine'; g.gain.value = v || 0.2;
  o.start();
  g.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + d);
  o.stop(audioCtx.currentTime + d);
}
window.playAttack = () => playTone(523, 0.12, 'triangle', 0.15);
window.playSkill = () => playTone(880, 0.18, 'square', 0.2);
window.playHurt = () => playTone(220, 0.25, 'sawtooth', 0.2);
window.playLevelUp = () => { if (!sfxEnabled) return; playTone(523, 0.12); setTimeout(() => playTone(659, 0.12), 130); setTimeout(() => playTone(784, 0.25), 260); };
window.playDefeat = () => { playTone(392, 0.15); setTimeout(() => playTone(523, 0.25), 160); };
window.playRest = () => { playTone(330, 0.18); setTimeout(() => playTone(262, 0.22), 180); };
window.setMasterVolume = v => { if (masterGain) masterGain.gain.value = v; localStorage.volume = v; };
window.setSfxEnabled = e => { sfxEnabled = e; localStorage.setItem('mute', e ? '0' : '1'); };
