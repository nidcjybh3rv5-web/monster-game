let audioCtx = null, sfxEnabled = true, masterGain = null;

function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = audioCtx.createGain();
  let savedVolume = localStorage.getItem('volume');
  masterGain.gain.value = savedVolume ? parseFloat(savedVolume) : 0.7;
  masterGain.connect(audioCtx.destination);
  // 无声缓冲解锁 iOS
  const buffer = audioCtx.createBuffer(1, 1, 22050);
  const src = audioCtx.createBufferSource();
  src.buffer = buffer;
  src.connect(masterGain);
  src.start();
}

function playTone(freq, duration, type, vol) {
  if (!sfxEnabled || !audioCtx || !masterGain) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(masterGain);
  osc.frequency.value = freq;
  osc.type = type || 'sine';
  gain.gain.value = vol || 0.2;
  osc.start(now);
  gain.gain.exponentialRampToValueAtTime(0.00001, now + duration);
  osc.stop(now + duration);
}

window.playAttack = () => playTone(523, 0.12, 'triangle', 0.15);
window.playSkill = () => playTone(880, 0.18, 'square', 0.2);
window.playHurt = () => playTone(220, 0.25, 'sawtooth', 0.2);
window.playLevelUp = () => {
  if (!sfxEnabled) return;
  playTone(523, 0.12);
  setTimeout(() => playTone(659, 0.12), 130);
  setTimeout(() => playTone(784, 0.25), 260);
};
window.playDefeat = () => {
  playTone(392, 0.15);
  setTimeout(() => playTone(523, 0.25), 160);
};
window.playRest = () => {
  playTone(330, 0.18);
  setTimeout(() => playTone(262, 0.22), 180);
};
window.setMasterVolume = (val) => {
  if (masterGain) masterGain.gain.value = val;
  localStorage.setItem('volume', val);
};
window.setSfxEnabled = (enabled) => {
  sfxEnabled = enabled;
  localStorage.setItem('mute', enabled ? '0' : '1');
};
