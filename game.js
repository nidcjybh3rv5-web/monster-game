let hp = 100, maxHp = 100, exp = 0, level = 1, atk = 10, restUsed = false;
let curMonster = null;
let currentDifficulty = localStorage.getItem('difficulty') || 'normal';
let deathStreak = 0;  // 連續死亡次數

const zones = [
  { name:"🌳新手村", maxLv:30, monsters:["🟣史萊姆","🟢哥布林","🐺森林狼"] },
  { name:"🏜️沙漠", maxLv:90, monsters:["🦂巨蠍","🧻木乃伊","🐍沙蛇"] },
  { name:"⛰️蒼穹", maxLv:100, monsters:["🐉青龍","👼天使","😈惡魔"] }
];

function getZone() {
  if (level <= 30) return zones[0];
  if (level <= 90) return zones[1];
  return zones[2];
}
function getDifficultyMultiplier() {
  let base = { hp:1, atk:1, exp:1, levelOffset:0 };
  if (currentDifficulty === 'easy') return { hp:0.7, atk:0.7, exp:1.1, levelOffset:-2 };
  if (currentDifficulty === 'hard') return { hp:1.5, atk:1.3, exp:0.85, levelOffset:3 };
  if (currentDifficulty === 'extreme') return { hp:2.0, atk:1.6, exp:0.7, levelOffset:6 };
  return base;
}
function generateMonster() {
  const zone = getZone();
  const raw = zone.monsters[Math.floor(Math.random() * zone.monsters.length)];
  const emoji = raw[0];
  const name = raw.slice(1);
  const mult = getDifficultyMultiplier();
  let monsterLevel = Math.max(1, level + mult.levelOffset);
  // 動態輔助：若連續死亡超過3次，暫時降低怪物等級（不低於1）
  if (deathStreak >= 3 && currentDifficulty !== 'easy') {
    monsterLevel = Math.max(1, monsterLevel - Math.floor(deathStreak/2));
  }
  let baseHp = (30 + monsterLevel * 2.5) * mult.hp;
  let baseAtk = (5 + Math.floor(monsterLevel / 2.5)) * mult.atk;
  let variance = v => Math.floor(v * (0.6 + Math.random() * 0.8));
  let expGain = Math.floor((12 + monsterLevel * 0.8) * mult.exp);
  return {
    name, emoji, monsterLevel,
    hp: variance(baseHp), maxHp: variance(baseHp),
    atk: variance(baseAtk),
    exp: Math.max(1, expGain)
  };
}
function refreshMonster() {
  curMonster = generateMonster();
  restUsed = false;
  updateUI();
  logMsg(`✨ Lv.${curMonster.monsterLevel} ${curMonster.name} 出現 | HP${curMonster.hp} 攻${curMonster.atk}`);
}
function updateUI() {
  document.getElementById('hpText').innerText = `${hp}/${maxHp}`;
  document.getElementById('expText').innerText = `${exp}/50`;
  document.getElementById('levelText').innerText = level;
  document.getElementById('atkText').innerText = atk;
  document.getElementById('zoneText').innerHTML = getZone().name;
  document.getElementById('monsterName').innerHTML = curMonster.name;
  document.getElementById('monsterEmoji').innerText = curMonster.emoji;
  document.getElementById('monsterHpText').innerText = `${curMonster.hp}/${curMonster.maxHp}`;
  document.getElementById('monsterLevelText').innerText = curMonster.monsterLevel;
  document.getElementById('hpBar').style.width = (hp / maxHp * 100) + '%';
  document.getElementById('expBar').style.width = (exp / 50 * 100) + '%';
  document.getElementById('monsterBar').style.width = (curMonster.hp / curMonster.maxHp * 100) + '%';
  document.getElementById('restBtn').disabled = restUsed;
}
function logMsg(msg) { document.getElementById('logMsg').innerHTML = msg; }
function levelUp() {
  let up = false;
  while (exp >= 50) {
    exp -= 50; level++; maxHp += 20; atk += 5;
    hp = Math.floor(maxHp * 0.7);
    up = true;
    logMsg(`🎉 升級 Lv${level} 攻擊力${atk}`);
    if (window.playLevelUpSound) playLevelUpSound();
    if (window.recordMaxLevel) recordMaxLevel(level);
  }
  if (up) refreshMonster();
  updateUI();
  saveLocal(); // 自動存檔
}
function monsterCounter() {
  let dmg = Math.max(1, rand(curMonster.atk-3, curMonster.atk+2));
  hp -= dmg;
  if (window.playHurtSound) playHurtSound();
  logMsg(`😈 Lv.${curMonster.monsterLevel} ${curMonster.name} 反擊 ${dmg}`);
  if (hp <= 0) {
    hp = maxHp;
    restUsed = false;
    deathStreak++;
    logMsg(`💀 復活 (連續死亡: ${deathStreak})`);
    if (window.recordDeath) recordDeath();
  } else {
    deathStreak = 0;
  }
  updateUI();
  saveLocal();
}
function defeat() {
  exp += curMonster.exp;
  logMsg(`🎉 擊敗 Lv.${curMonster.monsterLevel} ${curMonster.name} 獲得 ${curMonster.exp} EXP`);
  if (window.playDefeatSound) playDefeatSound();
  if (window.recordKill) recordKill();
  if (window.recordDamage && window.lastDamage) recordDamage(window.lastDamage);
  levelUp();
  refreshMonster();
  updateUI();
  saveLocal();
}
function attack() {
  if (window.initAudio) initAudio();
  if (window.playAttackSound) playAttackSound();
  if (hp <= 0) { logMsg('無法攻擊'); return; }
  let dmg = Math.max(2, rand(atk-3, atk+5));
  window.lastDamage = dmg;
  curMonster.hp -= dmg;
  logMsg(`⚔️ 造成 ${dmg} 傷害`);
  if (curMonster.hp <= 0) defeat();
  else monsterCounter();
  updateUI();
  saveLocal();
}
function skill() {
  if (window.initAudio) initAudio();
  if (window.playSkillSound) playSkillSound();
  if (hp <= 0) { logMsg('無法施放'); return; }
  let dmg = rand(atk+5, atk*2+3);
  window.lastDamage = dmg;
  curMonster.hp -= dmg;
  logMsg(`🔥 技能造成 ${dmg} 傷害`);
  if (curMonster.hp <= 0) defeat();
  else monsterCounter();
  updateUI();
  saveLocal();
}
function rest() {
  if (window.initAudio) initAudio();
  if (window.playRestSound) playRestSound();
  if (restUsed) { logMsg('已休息過'); return; }
  if (hp <= 0) { logMsg('無法休息'); return; }
  hp = Math.min(maxHp, hp+30);
  restUsed = true;
  logMsg(`😴 恢復30 HP`);
  let sneak = Math.max(1, rand(curMonster.atk-2, curMonster.atk+1));
  hp -= sneak;
  logMsg(`⚠️ 偷襲 -${sneak}`);
  if (hp <= 0) { hp = maxHp; restUsed = false; logMsg(`💀 復活`); }
  updateUI();
  saveLocal();
}
function saveLocal() {
  const gameState = { hp, maxHp, exp, level, atk, restUsed, currentDifficulty, achievements: window.achievements };
  localStorage.setItem('gameSave', JSON.stringify(gameState));
  toast('💾 本地存檔');
  if (window.saveToCloud && window.currentUser) window.saveToCloud(gameState);
}
function loadGame() {
  const data = localStorage.getItem('gameSave');
  if (data) {
    const s = JSON.parse(data);
    hp = s.hp; maxHp = s.maxHp; exp = s.exp; level = s.level; atk = s.atk; restUsed = s.restUsed; currentDifficulty = s.currentDifficulty;
    if (s.achievements && window.initAchievements) window.initAchievements(s.achievements);
    document.getElementById('difficultySelect').value = currentDifficulty;
  }
  refreshMonster();
  updateUI();
}
window.loadGame = loadGame;
window.changeDifficulty = (diff) => {
  if (confirm('切換難度會重置當前怪物，確定嗎？')) {
    currentDifficulty = diff;
    localStorage.setItem('difficulty', diff);
    refreshMonster();
    toast(`難度已切換為 ${diff}`);
  }
};
window.initGame = () => {
  loadGame();
  // 綁定按鈕事件
  document.getElementById('attackBtn').onclick = attack;
  document.getElementById('skillBtn').onclick = skill;
  document.getElementById('restBtn').onclick = rest;
  document.getElementById('saveBtn').onclick = saveLocal;
};
