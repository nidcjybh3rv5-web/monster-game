// 遊戲狀態
let hp = 100, maxHp = 100, exp = 0, lv = 1, atk = 10, restUsed = false, curMonster = null;
let difficulty = localStorage.getItem('difficulty') || 'normal';
let deathStreak = 0, lastDmg = 0;
window.difficulty = difficulty;  // 暴露給其他模組

const zones = [
  { name: "🌳新手村", maxLv: 30, mons: ["🟣史萊姆", "🟢哥布林", "🐺森林狼"] },
  { name: "🏜️沙漠", maxLv: 90, mons: ["🦂巨蠍", "🧻木乃伊", "🐍沙蛇"] },
  { name: "⛰️蒼穹", maxLv: 100, mons: ["🐉青龍", "👼天使", "😈惡魔"] }
];

function getZone() { return lv <= 30 ? zones[0] : lv <= 90 ? zones[1] : zones[2]; }
function getMult() {
  switch (difficulty) {
    case 'easy': return { hp: 0.7, atk: 0.7, exp: 1.1, off: -2 };
    case 'hard': return { hp: 1.5, atk: 1.3, exp: 0.85, off: 3 };
    case 'extreme': return { hp: 2.0, atk: 1.6, exp: 0.7, off: 6 };
    default: return { hp: 1, atk: 1, exp: 1, off: 0 };
  }
}

function genMonster() {
  let z = getZone(), raw = z.mons[Math.floor(Math.random() * z.mons.length)], emoji = raw[0], name = raw.slice(1), m = getMult();
  let off = m.off;
  if (deathStreak >= 3 && difficulty !== 'easy') off = Math.max(-5, off - Math.floor(deathStreak / 2));
  let mlv = Math.max(1, lv + off);
  let baseHp = (30 + mlv * 2.5) * m.hp, baseAtk = (5 + Math.floor(mlv / 2.5)) * m.atk;
  let varf = v => Math.floor(v * (0.6 + Math.random() * 0.8));
  return { name, emoji, mlv, hp: varf(baseHp), maxHp: varf(baseHp), atk: varf(baseAtk), exp: Math.max(1, Math.floor((12 + mlv * 0.8) * m.exp)) };
}

function refresh() { curMonster = genMonster(); restUsed = false; updateUI(); log(`✨ Lv.${curMonster.mlv} ${curMonster.name} | HP${curMonster.hp} 攻${curMonster.atk}`); }
function updateUI() {
  document.getElementById('hpText').innerText = `${hp}/${maxHp}`;
  document.getElementById('expText').innerText = `${exp}/50`;
  document.getElementById('levelText').innerText = lv;
  document.getElementById('atkText').innerText = atk;
  document.getElementById('zoneText').innerHTML = getZone().name;
  document.getElementById('monsterName').innerHTML = curMonster.name;
  document.getElementById('monsterEmoji').innerText = curMonster.emoji;
  document.getElementById('monsterHpText').innerText = `${curMonster.hp}/${curMonster.maxHp}`;
  document.getElementById('monsterLevelText').innerText = curMonster.mlv;
  document.getElementById('hpBar').style.width = `${hp / maxHp * 100}%`;
  document.getElementById('expBar').style.width = `${exp / 50 * 100}%`;
  document.getElementById('monsterBar').style.width = `${curMonster.hp / curMonster.maxHp * 100}%`;
  document.getElementById('restBtn').disabled = restUsed;
}
function log(m) { document.getElementById('logMsg').innerHTML = m; }

function saveLocal() {
  const state = { hp, maxHp, exp, lv, atk, restUsed, difficulty, achievements: window.getAchievements ? window.getAchievements() : { kills: 0, maxDmg: 0, maxLv: 1 }, deathStreak, lastDmg };
  localStorage.setItem('gameSave', JSON.stringify(state));
  window.toast('💾 本地存檔');
  window.saveToCloud?.(state);
}

function loadLocal() {
  const d = localStorage.getItem('gameSave');
  if (d) {
    try {
      const s = JSON.parse(d);
      hp = s.hp; maxHp = s.maxHp; exp = s.exp; lv = s.lv; atk = s.atk; restUsed = s.restUsed;
      difficulty = s.difficulty; window.difficulty = difficulty;
      if (s.achievements) {
        achievements = s.achievements;
        window.updateAchievementsUI?.();
      }
      deathStreak = s.deathStreak || 0; lastDmg = s.lastDmg || 0;
      document.getElementById('difficultySelect').value = difficulty;
    } catch(e) { console.error(e); }
  }
  refresh(); updateUI();
}

window.loadFromCloud = (data) => {
  hp = data.hp; maxHp = data.maxHp; exp = data.exp; lv = data.lv; atk = data.atk; restUsed = data.restUsed;
  difficulty = data.difficulty; window.difficulty = difficulty;
  achievements = data.achievements || { kills: 0, maxDmg: 0, maxLv: 1 };
  deathStreak = data.deathStreak || 0; lastDmg = data.lastDmg || 0;
  refresh(); updateUI();
  if (window.updateAchievementsUI) window.updateAchievementsUI();
};

window.changeDifficulty = (val) => {
  if (confirm('切換難度會重置當前怪物，確定嗎？')) {
    difficulty = val;
    window.difficulty = val;
    localStorage.setItem('difficulty', val);
    refresh();
    window.toast(`難度:${val}`);
  } else {
    const select = document.getElementById('diffSelect');
    if (select) select.value = difficulty;
  }
};

// 戰鬥邏輯
function levelUp() {
  let up = false;
  while (exp >= 50) {
    exp -= 50; lv++; maxHp += 20; atk += 5; hp = Math.floor(maxHp * 0.7); up = true;
    log(`🎉 升級 Lv${lv} 攻${atk}`);
    window.playLevelUp?.();
    if (window.recordMaxLevel) window.recordMaxLevel(lv);
  }
  if (up) refresh();
  updateUI();
  saveLocal();
}

function monsterCounter() {
  let dmg = Math.max(1, rand(curMonster.atk - 3, curMonster.atk + 2));
  hp -= dmg; window.playHurt?.(); log(`😈 Lv.${curMonster.mlv} ${curMonster.name} 反擊 ${dmg}`);
  if (hp <= 0) { hp = maxHp; restUsed = false; deathStreak++; log(`💀 復活 (連死${deathStreak})`); } else deathStreak = 0;
  updateUI(); saveLocal();
}

function defeat() {
  exp += curMonster.exp; log(`🎉 擊敗 Lv.${curMonster.mlv} ${curMonster.name} +${curMonster.exp}EXP`);
  window.playDefeat?.(); window.recordKill?.(lastDmg);
  levelUp(); refresh(); updateUI(); saveLocal();
}

function attack() {
  window.initAudio?.(); window.playAttack?.();
  if (hp <= 0) { log('無法攻擊'); return; }
  let dmg = Math.max(2, rand(atk - 3, atk + 5)); lastDmg = dmg; curMonster.hp -= dmg; log(`⚔️ ${dmg}傷害`);
  if (curMonster.hp <= 0) defeat(); else monsterCounter();
  updateUI(); saveLocal();
}

function skill() {
  window.initAudio?.(); window.playSkill?.();
  if (hp <= 0) { log('無法施放'); return; }
  let dmg = rand(atk + 5, atk * 2 + 3); lastDmg = dmg; curMonster.hp -= dmg; log(`🔥 ${dmg}傷害`);
  if (curMonster.hp <= 0) defeat(); else monsterCounter();
  updateUI(); saveLocal();
}

function rest() {
  window.initAudio?.(); window.playRest?.();
  if (restUsed) { log('已休息過'); return; }
  if (hp <= 0) { log('無法休息'); return; }
  hp = Math.min(maxHp, hp + 30); restUsed = true; log(`😴 恢復30HP`);
  let sneak = Math.max(1, rand(curMonster.atk - 2, curMonster.atk + 1)); hp -= sneak; log(`⚠️ 偷襲 -${sneak}`);
  if (hp <= 0) { hp = maxHp; restUsed = false; log('💀 復活'); }
  updateUI(); saveLocal();
}

// 頁面切換與 Spotify 整合
window.showPage = function(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  
  // Spotify 控制
  if (id === 'mainPage') {
    const playlistId = window.DEFAULT_SPOTIFY_PLAYLIST || '37i9dQZF1DXcBWIGoYBM5M';
    if (window.createSpotifyPlayer) window.createSpotifyPlayer(playlistId);
  } else {
    if (window.removeSpotifyPlayer) window.removeSpotifyPlayer();
  }
  
  if (id === 'settingsPage' && window.renderSettings) window.renderSettings();
};

// 按鈕綁定
document.getElementById('toGameBtn').onclick = () => window.showPage('gamePage');
document.getElementById('toSettingsBtn').onclick = () => window.showPage('settingsPage');
document.getElementById('helpBtn').onclick = () => window.showPage('helpPage');
document.getElementById('backFromSettings').onclick = () => window.showPage('mainPage');
document.getElementById('backFromHelp').onclick = () => window.showPage('mainPage');
document.getElementById('backFromGame').onclick = () => window.showPage('mainPage');
document.getElementById('attackBtn').onclick = attack;
document.getElementById('skillBtn').onclick = skill;
document.getElementById('restBtn').onclick = rest;
document.getElementById('saveBtn').onclick = saveLocal;

// 初始化
window.loadLocal = loadLocal;
loadLocal();
