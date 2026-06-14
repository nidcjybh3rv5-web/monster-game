function updateUI() {
  document.getElementById('hpText').innerText = `${window.hp}/${window.maxHp}`;
  document.getElementById('expText').innerText = `${window.exp}/50`;
  document.getElementById('levelText').innerText = window.lv;
  document.getElementById('atkText').innerText = window.atk;
  document.getElementById('zoneText').innerHTML = getZone().name;
  if (window.curMonster) {
    document.getElementById('monsterName').innerHTML = `${window.curMonster.emoji}${window.curMonster.name}`;
    document.getElementById('monsterEmoji').innerText = window.curMonster.emoji;
    document.getElementById('monsterHpText').innerText = `${window.curMonster.hp}/${window.curMonster.maxHp}`;
    document.getElementById('monsterLevelText').innerText = window.curMonster.mlv;
    document.getElementById('monsterBar').style.width = `${(window.curMonster.hp / window.curMonster.maxHp) * 100}%`;
  }
  document.getElementById('hpBar').style.width = `${(window.hp / window.maxHp) * 100}%`;
  document.getElementById('expBar').style.width = `${(window.exp / 50) * 100}%`;
  document.getElementById('restBtn').disabled = window.restUsed;
}
function log(msg) { document.getElementById('logMsg').innerHTML = msg; }
window.renderSettings = () => {
  let c = document.getElementById('settingsList'); if (!c) return;
  let vol = Math.round((localStorage.getItem('volume') ? parseFloat(localStorage.volume) : 0.7) * 100);
  let diff = window.difficulty, isMuted = localStorage.getItem('mute') === '1';
  c.innerHTML = `
    <div class="setting-item"><div>🔊音量</div><input type="range" id="volSlider" min="0" max="100" value="${vol}"></div>
    <div class="setting-item"><div>🔔音效</div><label class="switch"><input type="checkbox" id="sfxCheck" ${!isMuted ? 'checked' : ''}><span class="slider"></span></label></div>
    <div class="setting-item"><div>⚔️難度</div><select id="diffSelect" class="difficulty-select"><option value="easy" ${diff === 'easy' ? 'selected' : ''}>簡單</option><option value="normal" ${diff === 'normal' ? 'selected' : ''}>普通</option><option value="hard" ${diff === 'hard' ? 'selected' : ''}>困難</option><option value="extreme" ${diff === 'extreme' ? 'selected' : ''}>極限</option></select></div>
    <div class="setting-item"><div>🔐Google</div><div><button id="googleLoginBtn" style="background:#334155;padding:6px 12px;">登入</button> <button id="logoutBtn" style="background:#334155;padding:6px 12px;">登出</button></div></div>
    <div class="setting-item"><div>🏆成就</div><div>🐉${window.totalKills} 💥${window.maxDamage} 🏆${window.maxLevel}</div></div>`;
  document.getElementById('volSlider')?.addEventListener('input', e => { let v = e.target.value / 100; if (window.setMasterVolume) window.setMasterVolume(v); });
  document.getElementById('sfxCheck')?.addEventListener('change', e => { if (window.setSfxEnabled) window.setSfxEnabled(e.target.checked); localStorage.setItem('mute', e.target.checked ? '0' : '1'); });
  document.getElementById('diffSelect')?.addEventListener('change', e => { window.difficulty = e.target.value; localStorage.setItem('difficulty', window.difficulty); refreshMonster(); toast(`難度:${window.difficulty}`); });
  document.getElementById('googleLoginBtn')?.addEventListener('click', () => window.signInWithGoogle());
  document.getElementById('logoutBtn')?.addEventListener('click', () => window.signOut());
  if (currentUser) { let gb = document.getElementById('googleLoginBtn'); if (gb) { gb.innerText = `👤 ${currentUser.displayName}`; gb.disabled = true; } }
  else { let gb = document.getElementById('googleLoginBtn'); if (gb) { gb.innerText = '登入'; gb.disabled = false; } }
};
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
  if (id === 'settingsPage') window.renderSettings();
  if (id === 'shopPage') {
    let sd = document.getElementById('dailyRewardStatus');
    if (sd) sd.innerHTML = checkDaily() ? '⭐可領取' : '✅已領取';
    document.getElementById('claimDailyBtn').onclick = () => { claimDaily(); if (sd) sd.innerHTML = checkDaily() ? '⭐可領取' : '✅已領取'; };
  }
}
