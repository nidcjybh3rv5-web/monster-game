// ========== 聲音系統（不需外部音樂檔）==========
let audioCtx = null;
let soundEnabled = false;

// 初始化聲音（必須在用戶點擊後呼叫）
function initAudio() {
    if (audioCtx !== null) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    soundEnabled = true;
}

// 播放單音
function playTone(frequency, duration, type = "sine", volume = 0.2) {
    if (!soundEnabled || !audioCtx) return;
    const now = audioCtx.currentTime;
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gainNode.gain.value = volume;
    oscillator.start(now);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, now + duration);
    oscillator.stop(now + duration);
}

// 攻擊音效（短促「噹」）
function playAttackSound() {
    playTone(523.25, 0.15, "triangle", 0.15);
}

// 技能音效（銳利「唰」）
function playSkillSound() {
    playTone(880, 0.2, "square", 0.2);
}

// 受傷音效（低沉「呃」）
function playHurtSound() {
    playTone(220, 0.25, "sawtooth", 0.2);
}

// 升級音效（一段小旋律）
function playLevelUpSound() {
    if (!soundEnabled || !audioCtx) return;
    playTone(523.25, 0.15, "sine", 0.2);
    setTimeout(() => playTone(659.25, 0.15, "sine", 0.2), 150);
    setTimeout(() => playTone(784.0, 0.3, "sine", 0.2), 300);
}

// 怪物死亡音效（輕鬆的「叮咚」）
function playDefeatSound() {
    playTone(392, 0.2, "sine", 0.15);
    setTimeout(() => playTone(523.25, 0.3, "sine", 0.15), 200);
}

// 休息音效（喝水聲）
function playRestSound() {
    playTone(330, 0.2, "sine", 0.1);
    setTimeout(() => playTone(262, 0.25, "sine", 0.1), 200);
}
