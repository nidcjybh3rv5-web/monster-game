let achievements = {
  totalKills: 0,
  highestDamage: 0,
  rebirthCount: 0,
  maxLevelReached: 1
};

function updateAchievementsUI() {
  const container = document.getElementById('achievementsList');
  if (!container) return;
  container.innerHTML = `
    <div>🐉 總擊殺: ${achievements.totalKills}</div>
    <div>💥 最高傷害: ${achievements.highestDamage}</div>
    <div>🔄 轉生次數: ${achievements.rebirthCount}</div>
    <div>🏆 最高等級: ${achievements.maxLevelReached}</div>
  `;
}

function recordKill() {
  achievements.totalKills++;
  updateAchievementsUI();
  if (window.saveToCloud) window.saveToCloud(achievements);
}
function recordDamage(dmg) {
  if (dmg > achievements.highestDamage) {
    achievements.highestDamage = dmg;
    updateAchievementsUI();
    if (window.saveToCloud) window.saveToCloud(achievements);
  }
}
function recordRebirth() {
  achievements.rebirthCount++;
  updateAchievementsUI();
  if (window.saveToCloud) window.saveToCloud(achievements);
}
function recordMaxLevel(lv) {
  if (lv > achievements.maxLevelReached) {
    achievements.maxLevelReached = lv;
    updateAchievementsUI();
    if (window.saveToCloud) window.saveToCloud(achievements);
  }
}
// 初始化成就 UI（將在設定頁面顯示）
window.initAchievements = (data) => {
  if (data) achievements = data;
  updateAchievementsUI();
};
window.recordKill = recordKill;
window.recordDamage = recordDamage;
window.recordRebirth = recordRebirth;
window.recordMaxLevel = recordMaxLevel;
