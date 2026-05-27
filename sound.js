let audioCtx = null;
let soundEnabled = true;       // 總開關
let masterGain = null;

export function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = audioCtx.createGain();
  masterGain.gain.value = localStorage.getItem('volume') || 0.7;
  masterGain.connect(audioCtx.destination);
  // 解鎖 iOS
  const buffer = audioCtx.createBuffer(1, 1, 22050);
  const src = audioCtx.createBufferSource();
  src.buffer = buffer;
  src.connect(masterGain);
  src.start();
}
function playTone(freq, dur, type = 'sine', vol = 0.2) {
  if (!soundEnabled || !audioCtx || !masterGain) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(masterGain);
  osc.frequency.value = freq;
  osc.type = type;
  gain.gain.value = vol;
  osc.start(now);
  gain.gain.exponentialRampToValueAtTime(0.00001, now + dur);
  osc.stop(now + dur);
}
export function playAttack() { playTone(523, 0.12, 'triangle', 0.15); }
export function playSkill() { playTone(880, 0.18, 'square', 0.2); }
export function playHurt() { playTone(220, 0.25, 'sawtooth', 0.2); }
export function playLevelUp() {
  if (!soundEnabled) return;
  playTone(523, 0.12);
  setTimeout(() => playTone(659, 0.12), 130);
  setTimeout(() => playTone(784, 0.25), 260);
}
export function playDefeat() {
  playTone(392, 0.15);
  setTimeout(() => playTone(523, 0.25), 160);
}
export function playRest() {
  playTone(330, 0.18);
  setTimeout(() => playTone(262, 0.22), 180);
}
// 設定音量
export function setVolume(val) {
  if (masterGain) masterGain.gain.value = val;
  localStorage.setItem('volume', val);
}
// 設定全局靜音
export function setMute(muted) {
  soundEnabled = !muted;
  localStorage.setItem('mute', muted ? '1' : '0');
}
// 初始化靜音狀態
const savedMute = localStorage.getItem('mute') === '1';
soundEnabled = !savedMute;
