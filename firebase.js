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

// ========== 装备系统（精简）==========
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
  return { id: Date.now() + '-' + Math.random(), type, quality: q.name, color: q.color, bonus, name: `${q.name} ${type === 'weapon' ? '武器' : '防具'}`, equipped: false };
}
function calcEquipBonus() {
  let atk = 0, hp = 0;
  equipment.forEach(e => { if (e.equipped) e.type === 'weapon' ? atk += e.bonus : hp += e.bonus; });
  return { atk, hp };
}
function applyEquipBonus() {
  let b = calcEquipBonus();
  atk = baseAtk + b.atk;
  maxHp = baseHp + b.hp;
  if (hp > maxHp) hp = maxHp;
  updateUI();
}

// ========== 游戏状态 ==========
let hp = 100, maxHp = 100, exp = 0, lv = 1, atk = 10, restUsed = false, curMonster = null;
let difficulty = localStorage.getItem('difficulty') || 'normal';
let deathStreak = 0, lastDmg = 0;
let equipment = [];
let baseAtk = 10, baseHp = 100;

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

// ========== 存档 ==========
function saveLocal() {
  let state = { lv, exp, baseAtk, baseHp, hp, maxHp, atk, restUsed, difficulty, equipment, deathStreak, lastDmg };
  localStorage.setItem('gameSave', JSON.stringify(state));
  toast('💾 本地存檔');
  if (window.saveToCloud) window.saveToCloud(state);
}
function loadLocal() {
  let d = localStorage.getItem('gameSave');
  if (d) {
    let s = JSON.parse(d);
    lv = s.lv; exp = s.exp; baseAtk = s.baseAtk; baseHp = s.baseHp;
    hp = s.hp; maxHp = s.maxHp; atk = s.atk; restUsed = s.restUsed;
    difficulty = s.difficulty; equipment = s.equipment || [];
    deathStreak = s.deathStreak || 0; lastDmg = s.lastDmg || 0;
    document.getElementById('difficultySelect').value = difficulty;
    applyEquipBonus();
  }
  refresh(); updateUI();
}
window.loadFromCloud = (data) => {
  if (data) {
    lv = data.lv; exp = data.exp; baseAtk = data.baseAtk; baseHp = data.baseHp;
    hp = data.hp; maxHp = data.maxHp; atk = data.atk; restUsed = data.restUsed;
    difficulty = data.difficulty; equipment = data.equipment || [];
    deathStreak = data.deathStreak || 0; lastDmg = data.lastDmg || 0;
    applyEquipBonus();
    refresh(); updateUI();
  }
};

// ========== 战斗逻辑 ==========
function levelUp() {
  let up = false;
  while (exp >= 50) {
    exp -= 50; lv++;
    baseHp += 20; baseAtk += 5;
    hp = Math.floor((baseHp + calcEquipBonus().hp) * 0.7);
    up = true;
    log(`🎉 升級 Lv${lv} 攻${baseAtk + calcEquipBonus().atk}`);
    if (window.playLevelUp) window.playLevelUp();
    if (window.recordMaxLevel) window.recordMaxLevel(lv);
  }
  if (up) refresh();
  applyEquipBonus();
  saveLocal();
}
function monsterCounter() {
  let dmg = Math.max(1, rand(curMonster.atk - 3, curMonster.atk + 2));
  hp -= dmg; if (window.playHurt) window.playHurt();
  log(`😈 Lv.${curMonster.mlv} ${curMonster.name} 反擊 ${dmg}`);
  if (hp <= 0) { hp = maxHp; restUsed = false; deathStreak++; log(`💀 復活 (連死${deathStreak})`); } else deathStreak = 0;
  updateUI(); saveLocal();
}
function defeat() {
  exp += curMonster.exp;
  log(`🎉 擊敗 Lv.${curMonster.mlv} ${curMonster.name} +${curMonster.exp}EXP`);
  if (window.playDefeat) window.playDefeat();
  if (window.recordKill) window.recordKill(lastDmg);
  // 掉落装备
  if (Math.random() < 0.3) {
    let eq = generateEquipment();
    equipment.push(eq);
    toast(`🎁 获得 ${eq.name} +${eq.bonus}`);
    if (!equipment.some(e => e.type === eq.type && e.equipped)) {
      eq.equipped = true;
      applyEquipBonus();
      toast(`✨ 自动装备 ${eq.name}`);
    }
    saveLocal();
  }
  levelUp(); refresh(); updateUI(); saveLocal();
}
function attack() {
  if (window.initAudio) window.initAudio();
  if (window.playAttack) window.playAttack();
  if (hp <= 0) { log('無法攻擊'); return; }
  let dmg = Math.max(2, rand(atk - 3, atk + 5)); lastDmg = dmg;
  curMonster.hp -= dmg; log(`⚔️ ${dmg}傷害`);
  if (curMonster.hp <= 0) defeat(); else monsterCounter();
  updateUI(); saveLocal();
}
function skill() {
  if (window.initAudio) window.initAudio();
  if (window.playSkill) window.playSkill();
  if (hp <= 0) { log('無法施放'); return; }
  let dmg = rand(atk + 5, atk * 2 + 3); lastDmg = dmg;
  curMonster.hp -= dmg; log(`🔥 ${dmg}傷害`);
  if (curMonster.hp <= 0) defeat(); else monsterCounter();
  updateUI(); saveLocal();
}
function rest() {
  if (window.initAudio) window.initAudio();
  if (window.playRest) window.playRest();
  if (restUsed) { log('已休息過'); return; }
  if (hp <= 0) { log('無法休息'); return; }
  hp = Math.min(maxHp, hp + 30); restUsed = true; log(`😴 恢復30HP`);
  let sneak = Math.max(1, rand(curMonster.atk - 2, curMonster.atk + 1));
  hp -= sneak; log(`⚠️ 偷襲 -${sneak}`);
  if (hp <= 0) { hp = maxHp; restUsed = false; log('💀 復活'); }
  updateUI(); saveLocal();
}

// ========== 装备操作 ==========
window.toggleEquip = (id) => {
  let item = equipment.find(e => e.id == id);
  if (!item) return;
  if (item.equipped) {
    item.equipped = false;
    toast(`已卸下 ${item.name}`);
  } else {
    let same = equipment.find(e => e.type === item.type && e.equipped);
    if (same) same.equipped = false;
    item.equipped = true;
    toast(`已装备 ${item.name}`);
  }
  applyEquipBonus();
  saveLocal();
  if (window.renderSettings) window.renderSettings();
};

// ========== 页面切换 ==========
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
    difficulty = val; localStorage.setItem('difficulty', val);
    refresh(); toast(`難度:${val}`);
  } else document.getElementById('diffSelect').value = difficulty;
};
loadLocal();
