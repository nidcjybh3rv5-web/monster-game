function toast(msg, isErr = false) {
  let d = document.createElement('div');
  d.className = 'toast';
  d.innerText = msg;
  d.style.color = isErr ? '#ff8888' : '#facc15';
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 2000);
}
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ========== 每日獎勵 ==========
function checkDailyReward() {
  const last = localStorage.getItem('lastRewardDate');
  const today = new Date().toDateString();
  return last !== today;
}

// 計算距離下次可領取的剩餘時間（毫秒）
function getNextRewardTime() {
  const lastDate = localStorage.getItem('lastRewardDate');
  if (!lastDate) return 0;
  const nextDate = new Date(lastDate);
  nextDate.setDate(nextDate.getDate() + 1);
  const now = new Date();
  return Math.max(0, nextDate - now);
}

// 格式化剩餘時間為 HH:MM:SS
function formatTimeLeft(ms) {
  if (ms <= 0) return '可領取！';
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (3600000)) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${hours}小時 ${minutes}分 ${seconds}秒`;
}

function claimDailyReward() {
  if (!checkDailyReward()) {
    toast('今天已經領過獎勵了！');
    return false;
  }
  if (typeof generateEquipment !== 'function') {
    toast('裝備系統未載入，無法發放裝備獎勵');
    return false;
  }
  const r = rand(1, 3);
  let msg = '';
  if (r === 1) {
    window.exp += 20;
    msg = '🎁 獲得 20 經驗值！';
  } else if (r === 2) {
    let eq = generateEquipment();
    window.equipment.push(eq);
    msg = `🎁 獲得裝備：${eq.name} +${eq.bonus}`;
    if (!window.equipment.some(e => e.type === eq.type && e.equipped)) {
      eq.equipped = true;
      if (window.applyEquipBonus) window.applyEquipBonus();
      msg += ` 已自動裝備`;
    }
  } else {
    window.hp = Math.min(window.maxHp, (window.hp || 0) + 50);
    msg = '🎁 獲得 50 HP 恢復藥水！';
  }
  localStorage.setItem('lastRewardDate', new Date().toDateString());
  toast(msg);
  if (window.updateUI) window.updateUI();
  if (window.saveLocal) window.saveLocal();
  return true;
}
