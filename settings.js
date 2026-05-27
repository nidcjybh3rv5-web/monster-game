function refreshSettingsUI() {
  const container = document.getElementById('settingsList');
  if (!container) return;
  container.innerHTML = `
    <div class="setting-item"><div class="setting-item-left"><div class="setting-label">🔊 音量</div><div class="setting-desc">調整音效大小</div></div><input type="range" id="volumeSlider" min="0" max="100" value="${Math.round((localStorage.getItem('volume')||0.7)*100)}"></div>
    <div class="setting-item"><div class="setting-item-left"><div class="setting-label">🔔 音效開關</div><div class="setting-desc">開啟/關閉音效</div></div><label class="switch"><input type="checkbox" id="sfxToggle" ${localStorage.getItem('mute')!=='1' ? 'checked' : ''}><span class="slider"></span></label></div>
    <div class="setting-item"><div class="setting-item-left"><div class="setting-label">⚔️ 難度</div><div class="setting-desc">影響怪物強度</div></div><select id="difficultySelect" class="difficulty-select"><option value="easy">🎈 簡單</option><option value="normal" selected>⚖️ 普通</option><option value="hard">🔥 困難</option><option value="extreme">☠️ 極限</option></select></div>
    <div class="setting-item"><div class="setting-item-left"><div class="setting-label">🔐 Google 帳號</div><div class="setting-desc">雲端存檔</div></div><div class="google-buttons"><button class="google-btn" id="googleLoginBtn">登入 Google</button><button class="google-btn" id="logoutBtn">登出</button></div></div>
    <div class="setting-item"><div class="setting-item-left"><div class="setting-label">🏆 成就</div><div class="setting-desc">你的戰績</div></div><div id="achievementsList" style="font-size:0.8rem;"></div></div>
  `;
  // 重新綁定事件
  document.getElementById('volumeSlider')?.addEventListener('input', e => { if(window.setMasterVolume) window.setMasterVolume(e.target.value/100); });
  document.getElementById('sfxToggle')?.addEventListener('change', e => { if(window.setSfxEnabled) window.setSfxEnabled(e.target.checked); localStorage.setItem('mute', e.target.checked ? '0' : '1'); });
  document.getElementById('difficultySelect')?.addEventListener('change', e => { if(window.changeDifficulty) window.changeDifficulty(e.target.value); });
  document.getElementById('googleLoginBtn')?.addEventListener('click', () => window.signInWithGoogle?.());
  document.getElementById('logoutBtn')?.addEventListener('click', () => window.signOut?.());
  if(window.updateAchievementsUI) window.updateAchievementsUI();
}
window.refreshSettingsUI = refreshSettingsUI;
