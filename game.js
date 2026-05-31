// ========== 工具 ==========
function toast(msg, isErr = false) {
  let d = document.createElement('div');
  d.className = 'toast';
  d.innerText = msg;
  d.style.color = isErr ? '#ff8888' : '#facc15';
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 2000);
}
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// ========== 装备系统 ==========
const QUALITY = [
  { name: '普通', color: '#9ca3af', min: 1, max: 3, rate: 0.5 },
  { name: '优秀', color: '#4ade80', min: 4, max: 6, rate: 0.3 },
  { name: '稀有', color: '#3b82f6', min: 7, max: 10, rate: 0.15 },
  { name: '史诗', color: '#a855f7', min: 11, max: 15, rate: 0.05 }
];
function randomQuality() {
  let r = Math.random(), acc = 0;
  for (let q of QUALITY) if ((acc += q.rate) > r) return q;
  return QUALITY[0];
}
function generateEquipment() {
  let type = rand(0, 1) ? 'weapon' : 'armor';
  let q = randomQuality();
  let bonus = rand(q.min, q.max);
  return {
    id: Date.now() + '-' + Math.random(),
    type, quality: q.name, color: q.color, bonus,
    name: `${q.name} ${type === 'weapon' ? '武器' : '防具'}`,
    equipped: false
  };
}
function calcEquipBonus() {
  let atk = 0, hp = 0;
  (window.equipment || []).forEach(e => {
    if (e.equipped) e.type === 'weapon' ? atk += e.bonus : hp += e.bonus;
  });
  return { atk, hp };
}
function applyEquipBonus() {
  let b = calcEquipBonus();
  window.atk = window.baseAtk + b.atk;
  window.maxHp = window.baseHp + b.hp;
  if (window.hp > window.maxHp) window.hp = window.maxHp;
  updateUI();
}

// ========== 游戏变量（全部挂载到 window，避免作用域问题）==========
window.hp = 100;
window.maxHp = 100;
window.exp = 0;
window.lv = 1;
window.atk = 10;
window.restUsed = false;
window.curMonster = null;
window.difficulty = localStorage.getItem('difficulty') || 'normal';
window.deathStreak = 0;
window.lastDmg = 0;
window.equipment = [];
window.baseAtk = 10;
window.baseHp = 100;

const zones = [
  { name: "🌳新手村", maxLv: 30, mons: ["🟣史萊姆", "🟢哥布林", "🐺森林狼"] },
  { name: "🏜️沙漠", maxLv: 90, mons: ["🦂巨蠍", "🧻木乃伊", "🐍沙蛇"] },
  { name: "⛰️蒼穹", maxLv: 100, mons: ["🐉青龍", "👼天使", "😈惡魔"] }
];

function getZone() { return window.lv <= 30 ? zones[0] : window.lv <= 90 ? zones[1] : zones[2]; }
function getMult() {
  switch (window.difficulty) {
    case 'easy': return { hp: 0.7, atk: 0.7, exp: 1.1, off: -2 };
    case 'hard': return { hp: 1.5, atk: 1.3, exp: 0.85, off: 3 };
    case 'extreme': return { hp: 2.0, atk: 1.6, exp: 0.7, off: 6 };
    default: return { hp: 1, atk: 1, exp: 1, off: 0 };
  }
}
function genMonster() {
  let z = getZone(), raw = z.mons[Math.floor(Math.random() * z.mons.length)], emoji = raw[0], name = raw.slice(1), m = getMult();
  let off = m.off;
  if (window.deathStreak >= 3 && window.difficulty !== 'easy') off = Math.max(-5, off - Math.floor(window.deathStreak / 2));
  let mlv = Math.max(1, window.lv + off);
  let baseHp = (30 + mlv * 2.5) * m.hp, baseAtk = (5 + Math.floor(mlv / 2.5)) * m.atk;
  let varf = v => Math.floor(v * (0.6 + Math.random() * 0.8));
  return { name, emoji, mlv, hp: varf(baseHp), maxHp: varf(baseHp), atk: varf(baseAtk), exp: Math.max(1, Math.floor((12 + mlv * 0.8) * m.exp)) };
}
function refresh() {
  window.curMonster = genMonster();
  window.restUsed = false;
  updateUI();
  log(`✨ Lv.${window.curMonster.mlv} ${window.curMonster.name} | HP${window.curMonster.hp} 攻${window.curMonster.atk}`);
}
function updateUI() {
  document.getElementById('hpText').innerText = `${window.hp}/${window.maxHp}`;
  document.getElementById('expText').innerText = `${window.exp}/50`;
  document.getElementById('levelText').innerText = window.lv;
  document.getElementById('atkText').innerText = window.atk;
  document.getElementById('zoneText').innerHTML = getZone().name;
  document.getElementById('monsterName').innerHTML = window.curMonster?.name || '史萊姆';
  document.getElementById('monsterEmoji').innerText = window.curMonster?.emoji || '🟣';
  document.getElementById('monsterHpText').innerText = `${window.curMonster?.hp || 0}/${window.curMonster?.maxHp || 0}`;
  document.getElementById('monsterLevelText').innerText = window.curMonster?.mlv || 0;
  document.getElementById('hpBar').style.width = `${window.hp / window.maxHp * 100}%`;
  document.getElementById('expBar').style.width = `${window.exp / 50 * 100}%`;
  document.getElementById('monsterBar').style.width = `${(window.curMonster?.hp || 0) / (window.curMonster?.maxHp || 1) * 100}%`;
  document.getElementById('restBtn').disabled = window.restUsed;
}
function log(m) { document.getElementById('logMsg').innerHTML = m; }

function saveLocal() {
  const state = {
    lv: window.lv, exp: window.exp, baseAtk: window.baseAtk, baseHp: window.baseHp,
    hp: window.hp, maxHp: window.maxHp, atk: window.atk, restUsed: window.restUsed,
    difficulty: window.difficulty, equipment: window.equipment,
    deathStreak: window.deathStreak, lastDmg: window.lastDmg
  };
  localStorage.setItem('gameSave', JSON.stringify(state));
  toast('💾 本地存檔');
  if (window.saveToCloud) window.saveToCloud(state);
}
function loadLocal() {
  let d = localStorage.getItem('gameSave');
  if (d) {
    try {
      let s = JSON.parse(d);
      window.lv = s.lv ?? 1;
      window.exp = s.exp ?? 0;
      window.baseAtk = s.baseAtk ?? 10;
      window.baseHp = s.baseHp ?? 100;
      window.hp = s.hp ?? 100;
      window.maxHp = s.maxHp ?? 100;
      window.atk = s.atk ?? 10;
      window.restUsed = s.restUsed ?? false;
      window.difficulty = s.difficulty ?? 'normal';
      window.equipment = s.equipment ?? [];
      window.deathStreak = s.deathStreak ?? 0;
      window.lastDmg = s.lastDmg ?? 0;
      document.getElementById('difficultySelect').value = window.difficulty;
    } catch(e) { console.error(e); }
  }
  applyEquipBonus();
  refresh();
  updateUI();
}
window.loadFromCloud = (data) => {
  if (data) {
    window.lv = data.lv ?? 1;
    window.exp = data.exp ?? 0;
    window.baseAtk = data.baseAtk ?? 10;
    window.baseHp = data.baseHp ?? 100;
    window.hp = data.hp ?? 100;
    window.maxHp = data.maxHp ?? 100;
    window.atk = data.atk ?? 10;
    window.restUsed = data.restUsed ?? false;
    window.difficulty = data.difficulty ?? 'normal';
    window.equipment = data.equipment ?? [];
    window.deathStreak = data.deathStreak ?? 0;
    window.lastDmg = data.lastDmg ?? 0;
    applyEquipBonus();
    refresh();
    updateUI();
  }
};

// 战斗逻辑
function levelUp() {
  let up = false;
  while (window.exp >= 50) {
    window.exp -= 50;
    window.lv++;
    window.baseHp += 20;
    window.baseAtk += 5;
    window.hp = Math.floor((window.baseHp + calcEquipBonus().hp) * 0.7);
    up = true;
    log(`🎉 升級 Lv${window.lv} 攻${window.baseAtk + calcEquipBonus().atk}`);
    if (window.playLevelUp) window.playLevelUp();
    if (window.recordMaxLevel) window.recordMaxLevel(window.lv);
  }
  if (up) refresh();
  applyEquipBonus();
  saveLocal();
}
function monsterCounter() {
  if (!window.curMonster) return;
  let dmg = Math.max(1, rand(window.curMonster.atk - 3, window.curMonster.atk + 2));
  window.hp -= dmg;
  if (window.playHurt) window.playHurt();
  log(`😈 Lv.${window.curMonster.mlv} ${window.curMonster.name} 反擊 ${dmg}`);
  if (window.hp <= 0) {
    window.hp = window.maxHp;
    window.restUsed = false;
    window.deathStreak++;
    log(`💀 復活 (連死${window.deathStreak})`);
  } else window.deathStreak = 0;
  updateUI();
  saveLocal();
}
function defeat() {
  if (!window.curMonster) return;
  window.exp += window.curMonster.exp;
  log(`🎉 擊敗 Lv.${window.curMonster.mlv} ${window.curMonster.name} +${window.curMonster.exp}EXP`);
  if (window.playDefeat) window.playDefeat();
  if (window.recordKill) window.recordKill(window.lastDmg);
  // 掉落装备
  if (Math.random() < 0.3) {
    let eq = generateEquipment();
    window.equipment.push(eq);
    toast(`🎁 获得 ${eq.name} +${eq.bonus}`);
    if (!window.equipment.some(e => e.type === eq.type && e.equipped)) {
      eq.equipped = true;
      applyEquipBonus();
      toast(`✨ 自动装备 ${eq.name}`);
    }
    saveLocal();
  }
  levelUp();
  refresh();
  updateUI();
  saveLocal();
}
function attack() {
  if (window.initAudio) window.initAudio();
  if (window.playAttack) window.playAttack();
  if (window.hp <= 0) { log('無法攻擊'); return; }
  let dmg = Math.max(2, rand(window.atk - 3, window.atk + 5));
  window.lastDmg = dmg;
  window.curMonster.hp -= dmg;
  log(`⚔️ ${dmg}傷害`);
  if (window.curMonster.hp <= 0) defeat(); else monsterCounter();
  updateUI();
  saveLocal();
}
function skill() {
  if (window.initAudio) window.initAudio();
  if (window.playSkill) window.playSkill();
  if (window.hp <= 0) { log('無法施放'); return; }
  let dmg = rand(window.atk + 5, window.atk * 2 + 3);
  window.lastDmg = dmg;
  window.curMonster.hp -= dmg;
  log(`🔥 ${dmg}傷害`);
  if (window.curMonster.hp <= 0) defeat(); else monsterCounter();
  updateUI();
  saveLocal();
}
function rest() {
  if (window.initAudio) window.initAudio();
  if (window.playRest) window.playRest();
  if (window.restUsed) { log('已休息過'); return; }
  if (window.hp <= 0) { log('無法休息'); return; }
  window.hp = Math.min(window.maxHp, window.hp + 30);
  window.restUsed = true;
  log(`😴 恢復30 HP`);
  let sneak = Math.max(1, rand(window.curMonster.atk - 2, window.curMonster.atk + 1));
  window.hp -= sneak;
  log(`⚠️ 偷襲 -${sneak}`);
  if (window.hp <= 0) {
    window.hp = window.maxHp;
    window.restUsed = false;
    log('💀 復活');
  }
  updateUI();
  saveLocal();
}

// 装备操作
window.toggleEquip = (id) => {
  let item = window.equipment.find(e => e.id == id);
  if (!item) return;
  if (item.equipped) {
    item.equipped = false;
    toast(`已卸下 ${item.name}`);
  } else {
    let same = window.equipment.find(e => e.type === item.type && e.equipped);
    if (same) same.equipped = false;
    item.equipped = true;
    toast(`已装备 ${item.name}`);
  }
  applyEquipBonus();
  saveLocal();
  if (window.renderSettings) window.renderSettings();
};

// 页面切换
window.showPage = function(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (id === 'mainPage') window.createSpotifyPlayer?.(window.DEFAULT_SPOTIFY_PLAYLIST);
  else window.removeSpotifyPlayer?.();
  if (id === 'settingsPage') window.renderSettings?.();
};
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

window.changeDifficulty = (val) => {
  if (confirm('切換難度會重置當前怪物，確定嗎？')) {
    window.difficulty = val;
    localStorage.setItem('difficulty', val);
    refresh();
    toast(`難度:${val}`);
  } else document.getElementById('diffSelect').value = window.difficulty;
};
loadLocal();
