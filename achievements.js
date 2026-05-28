let achievements = { kills: 0, maxDmg: 0, maxLv: 1 };

window.updateAchievementsUI = () => {
  const el = document.getElementById('achievementsList');
  if (el) {
    el.innerHTML = `🐉 擊殺:${achievements.kills} | 💥 最高傷:${achievements.maxDmg} | 🏆 最高等:${achievements.maxLv}`;
  }
};

window.recordKill = (dmg) => {
  achievements.kills++;
  if (dmg > achievements.maxDmg) achievements.maxDmg = dmg;
  window.updateAchievementsUI();
};

window.recordMaxLevel = (lv) => {
  if (lv > achievements.maxLv) achievements.maxLv = lv;
  window.updateAchievementsUI();
};

// 导出以供其他模块读取
window.getAchievements = () => ({ ...achievements });
