window.renderSettings = () => {
  const container = document.getElementById('settingsList');
  if (!container) return;
  
  const savedVol = localStorage.getItem('volume');
  const vol = Math.round((savedVol ? parseFloat(savedVol) : 0.7) * 100);
  const currentDiff = window.difficulty || localStorage.getItem('difficulty') || 'normal';
  const isMuted = localStorage.getItem('mute') === '1';
  const currentSkill = window.secondSkill || '重擊';
  
  const weapon = window.equipment?.find(e => e.type === 'weapon');
  const armor = window.equipment?.find(e => e.type === 'armor');
  
  const eqHtml = `
    <div class="setting-item">
      <div style="width:100%">
        <div class="setting-label">⚔️ 裝備</div>
        <div style="display:flex; justify-content:space-between; margin-top:8px;"><span>武器：</span>${weapon ? `<span style="color:${weapon.color}">${weapon.name} +${weapon.bonus}</span><button class="eq-btn" data-id="${weapon.id}">${weapon.equipped ? '卸下' : '裝備'}</button>` : '<span>無</span>'}</div>
        <div style="display:flex; justify-content:space-between; margin-top:8px;"><span>防具：</span>${armor ? `<span style="color:${armor.color}">${armor.name} +${armor.bonus}</span><button class="eq-btn" data-id="${armor.id}">${armor.equipped ? '卸下' : '裝備'}</button>` : '<span>無</span>'}</div>
      </div>
    </div>
  `;
  
  container.innerHTML = `
    <div class="setting-item"><div><div class="setting-label">🔊 音量</div><div class="setting-desc">調整音效</div></div><input type="range" id="volSlider" min="0" max="100" value="${vol}"></div>
    <div class="setting-item"><div><div class="setting-label">🔔 音效開關</div><div class="setting-desc">開啟/關閉</div></div><label class="switch"><input type="checkbox" id="sfxCheck" ${!isMuted ? 'checked' : ''}><span class="slider"></span></label></div>
    <div class="setting-item"><div><div class="setting-label">⚔️ 難度</div><div class="setting-desc">影響強度</div></div><select id="diffSelect" class="difficulty-select"><option value="easy" ${currentDiff === 'easy' ? 'selected' : ''}>簡單</option><option value="normal" ${currentDiff === 'normal' ? 'selected' : ''}>普通</option><option value="hard" ${currentDiff === 'hard' ? 'selected' : ''}>困難</option><option value="extreme" ${currentDiff === 'extreme' ? 'selected' : ''}>極限</option></select></div>
    <div class="setting-item"><div><div class="setting-label">✨ 第二技能</div><div class="setting-desc">戰鬥中的第二個技能效果</div></div><select id="skillSelect" class="difficulty-select"><option value="重擊" ${currentSkill === '重擊' ? 'selected' : ''}>⚡ 重擊</option><option value="治療" ${currentSkill === '治療' ? 'selected' : ''}>💚 治療</option><option value="防禦" ${currentSkill === '防禦' ? 'selected' : ''}>🛡️ 防禦</option></select></div>
    ${eqHtml}
    <div class="setting-item"><div><div class="setting-label">🔐 Google</div><div class="setting-desc">雲端存檔</div></div><div><button class="back-btn" id="googleLoginBtn" style="background:#334155;padding:6px 12px;">登入 Google</button><button class="back-btn" id="logoutBtn" style="background:#334155;padding:6px 12px;margin-left:8px;">登出</button></div></div>
    <div class="setting-item"><div><div class="setting-label">🏆 成就</div><div class="setting-desc">戰績</div></div><div id="achievementsList" style="font-size:0.8rem;">🐉 擊殺:0 | 💥 最高傷:0 | 🏆 最高等:1</div></div>
  `;
  
  document.getElementById('volSlider')?.addEventListener('input', e => window.setMasterVolume?.(e.target.value / 100));
  document.getElementById('sfxCheck')?.addEventListener('change', e => window.setSfxEnabled?.(e.target.checked));
  document.getElementById('diffSelect')?.addEventListener('change', e => window.changeDifficulty?.(e.target.value));
  const skillSelect = document.getElementById('skillSelect');
  if (skillSelect) {
    skillSelect.addEventListener('change', e => {
      window.secondSkill = e.target.value;
      localStorage.setItem('secondSkill', window.secondSkill);
      toast(`第二技能已切換為 ${window.secondSkill}`);
    });
  }
  document.getElementById('googleLoginBtn')?.addEventListener('click', () => window.signInWithGoogle?.());
  document.getElementById('logoutBtn')?.addEventListener('click', () => window.signOut?.());
  
  document.querySelectorAll('.eq-btn').forEach(btn => {
    btn.addEventListener('click', () => window.toggleEquip?.(btn.dataset.id));
  });
  
  if (window.updateAchievementsUI) window.updateAchievementsUI();
};

// ========== 商店頁面與主畫面狀態 ==========
let shopInitialized = false;
let countdownInterval = null;

// 更新商店頁面的獎勵狀態
function updateShopRewardUI() {
  const statusDiv = document.getElementById('dailyRewardStatus');
  if (!statusDiv) return;
  const canClaim = window.checkDailyReward ? window.checkDailyReward() : true;
  if (canClaim) {
    statusDiv.innerHTML = '⭐ 今日獎勵可領取！點擊下方按鈕領取 🎁';
  } else {
    const remainMs = window.getNextRewardTime ? window.getNextRewardTime() : 0;
    if (remainMs > 0) {
      const timeStr = window.formatTimeLeft ? window.formatTimeLeft(remainMs) : '';
      statusDiv.innerHTML = `✅ 今日已領取，剩餘 ${timeStr} 後可再次領取`;
    } else {
      statusDiv.innerHTML = '✅ 今日已領取，明天再來吧！';
    }
  }
}

// 更新主畫面每日獎勵狀態列
function updateMainRewardUI() {
  const statusDiv = document.getElementById('dailyRewardStatusMain');
  if (!statusDiv) return;
  const canClaim = window.checkDailyReward ? window.checkDailyReward() : true;
  if (canClaim) {
    statusDiv.innerHTML = '⭐ 今日獎勵可領取！點擊「商店」領取 🎁';
    statusDiv.style.color = '#facc15';
  } else {
    const remainMs = window.getNextRewardTime ? window.getNextRewardTime() : 0;
    if (remainMs > 0) {
      const timeStr = window.formatTimeLeft ? window.formatTimeLeft(remainMs) : '';
      statusDiv.innerHTML = `✅ 今日已領取，剩餘 ${timeStr} 後可再次領取`;
      statusDiv.style.color = '#94a3b8';
    } else {
      statusDiv.innerHTML = '✅ 今日已領取，明天再來吧！';
      statusDiv.style.color = '#94a3b8';
    }
  }
}

function initShopPage() {
  if (shopInitialized) return;
  const claimBtn = document.getElementById('claimDailyBtn');
  if (claimBtn) {
    claimBtn.onclick = () => {
      if (window.claimDailyReward) {
        const success = window.claimDailyReward();
        if (success) {
          updateShopRewardUI();
          updateMainRewardUI();
          if (countdownInterval) clearInterval(countdownInterval);
          startCountdown();
        }
      }
    };
  }
  shopInitialized = true;
  startCountdown();
}

function startCountdown() {
  if (countdownInterval) clearInterval(countdownInterval);
  updateShopRewardUI();
  updateMainRewardUI();
  countdownInterval = setInterval(() => {
    updateShopRewardUI();
    updateMainRewardUI();
  }, 1000); // 每秒更新倒數
}

function stopCountdown() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
}

// 擴充頁面切換
if (typeof window.showPage !== 'undefined') {
  const original = window.showPage;
  window.showPage = function(id) {
    original(id);
    if (id === 'shopPage') {
      initShopPage();
      updateShopRewardUI();
      startCountdown();
    } else {
      stopCountdown();
    }
    if (id === 'mainPage') {
      updateMainRewardUI();
    }
  };
} else {
  window.showPage = function(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(id);
    if (target) target.classList.add('active');
    if (id === 'shopPage') {
      initShopPage();
      updateShopRewardUI();
      startCountdown();
    } else {
      stopCountdown();
    }
    if (id === 'mainPage') {
      updateMainRewardUI();
    }
  };
}
