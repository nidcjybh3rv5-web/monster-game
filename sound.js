// ========== 聲音引擎（純合成，無需外部檔案）==========
let audioCtx = null;
let soundEnabled = false;

// 初始化音頻上下文（必須由用戶點擊觸發）
function initAudio() {
    if (audioCtx !== null) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    soundEnabled = true;
    // 播放一個極短無聲的音訊來啟動（某些瀏覽器需要）
    const buffer = audioCtx.createBuffer(1, 1, 22050);
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source.start();
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
    playTone(523.25, 0.12, "triangle", 0.15);
}

// 技能音效（銳利「唰」）
function playSkillSound() {
    playTone(880, 0.18, "square", 0.2);
}

// 受傷音效（低沉「呃」）
function playHurtSound() {
    playTone(220, 0.25, "sawtooth", 0.2);
}

// 升級音效（小旋律）
function playLevelUpSound() {
    if (!soundEnabled || !audioCtx) return;
    playTone(523.25, 0.12, "sine", 0.2);
    setTimeout(() => playTone(659.25, 0.12, "sine", 0.2), 130);
    setTimeout(() => playTone(784.0, 0.25, "sine", 0.2), 260);
}

// 擊敗怪物音效（歡快叮咚）
function playDefeatSound() {
    playTone(392, 0.15, "sine", 0.15);
    setTimeout(() => playTone(523.25, 0.25, "sine", 0.15), 160);
}

// 休息音效
function playRestSound() {
    playTone(330, 0.18, "sine", 0.1);
    setTimeout(() => playTone(262, 0.22, "sine", 0.1), 180);
}
