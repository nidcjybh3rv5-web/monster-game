window.renderSettings = () => {
  const container = document.getElementById('settingsList');
  if (!container) return;
  
  const savedVol = localStorage.getItem('volume');
  const vol = Math.round((savedVol ? parseFloat(savedVol) : 0.7) * 100);
  const currentDiff = window.difficulty || localStorage.getItem('difficulty') || 'normal';
  const isMuted = localStorage.getItem('mute') === '1';
  
  container.innerHTML = `
    <div class="setting-item">
      <div><div class="setting-label">🔊 音量</div><div class="setting-desc">調整音效</div></div>
      <input type="range" id="volSlider" min="0" max="100" value="${vol}">
    </div>
    <div class="setting-item">
      <div><div class="setting-label">🔔 音效開關</div><div class="setting-desc">開啟/關閉</div></div>
      <label class="switch"><input type="checkbox" id="sfxCheck" ${!isMuted ? 'checked' : ''}><span class="slider"></span></label>
    </div>
    <div class="setting-item">
      <div><div class="setting-label">⚔️ 難度</div><div class="setting-desc">影響強度</div></div>
      <select id="diffSelect" class="difficulty-select">
        <option value="easy" ${currentDiff === 'easy' ? 'selected' : ''}>簡單</option>
        <option value="normal" ${currentDiff === 'normal' ? 'selected' : ''}>普通</option>
        <option value="hard" ${currentDiff === 'hard' ? 'selected' : ''}>困難</option>
        <option value="extreme" ${currentDiff === 'extreme' ? 'selected' : ''}>極限</option>
      </select>
    </div>
    <div class="setting-item">
      <div><div class="setting-label">🔐 Google</div><div class="setting-desc">雲端存檔</div></div>
      <div>
        <button class="back-btn" id="googleLoginBtn" style="background:#334155;padding:6px 12px;">登入 Google</button>
        <button class="back-btn" id="logoutBtn" style="background:#334155;padding:6px 12px;margin-left:8px;">登出</button>
      </div>
    </div>
    <div class="setting-item">
      <div><div class="setting-label">🏆 成就</div><div class="setting-desc">戰績</div></div>
      <div id="achievementsList" style="font-size:0.8rem;">🐉 擊殺:0 | 💥 最高傷:0 | 🏆 最高等:1</div>
    </div>
  `;
  
  document.getElementById('volSlider')?.addEventListener('input', e => window.setMasterVolume?.(e.target.value / 100));
  document.getElementById('sfxCheck')?.addEventListener('change', e => window.setSfxEnabled?.(e.target.checked));
  document.getElementById('diffSelect')?.addEventListener('change', e => window.changeDifficulty?.(e.target.value));
  document.getElementById('googleLoginBtn')?.addEventListener('click', () => window.signInWithGoogle?.());
  document.getElementById('logoutBtn')?.addEventListener('click', () => window.signOut?.());
  
  window.updateAchievementsUI?.();
};
