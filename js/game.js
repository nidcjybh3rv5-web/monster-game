// ========== 版本號與更新檢查 ==========
const APP_VERSION = 'v3.6.2';
if (localStorage.getItem('app_version') !== APP_VERSION) {
  const ov = document.createElement('div'); ov.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); backdrop-filter:blur(12px); display:flex; justify-content:center; align-items:center; z-index:10000;';
  const cd = document.createElement('div'); cd.style.cssText = 'background:rgba(30,30,35,0.9); border-radius:32px; padding:24px; width:280px; text-align:center; color:white; border:1px solid rgba(255,255,255,0.2);';
  cd.innerHTML = `<div style="font-size:48px;">✨</div><h3>發現新版本</h3><p>遊戲已更新至 ${APP_VERSION}</p><button id="updateNowBtn" style="background:#facc15; color:#0f172a; border:none; padding:10px 20px; border-radius:40px; margin-top:16px; cursor:pointer;">立即更新</button>`;
  ov.appendChild(cd); document.body.appendChild(ov);
  document.getElementById('updateNowBtn').onclick = () => { localStorage.setItem('app_version', APP_VERSION); location.reload(); };
}

// ========== 全域工具 ==========
function toast(msg, isErr = false) {
  let d = document.createElement('div');
  d.className = 'toast';
  d.innerText = msg;
  d.style.color = isErr ? '#ff8888' : '#facc15';
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 2000);
}
function rand(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

// ========== 音效 ==========
let actx = null, sfxOn = true, mgain = null;
function initAudio() {
  if (actx) return;
  actx = new (window.AudioContext || window.webkitAudioContext)();
  mgain = actx.createGain();
  mgain.gain.value = localStorage.volume ? parseFloat(localStorage.volume) : 0.7;
  mgain.connect(actx.destination);
  let buf = actx.createBuffer(1, 1, 22050);
  let src = actx.createBufferSource();
  src.buffer = buf;
  src.connect(mgain);
  src.start();
  if (actx.state === 'suspended') actx.resume();
}
function tone(f, d, t, v) {
  if (!sfxOn) return;
  initAudio();
  if (!actx || !mgain) return;
  if (actx.state === 'suspended') actx.resume();
  let o = actx.createOscillator();
  let g = actx.createGain();
  o.connect(g);
  g.connect(mgain);
  o.frequency.value = f;
  o.type = t || 'sine';
  g.gain.value = v || 0.2;
  o.start();
  g.gain.exponentialRampToValueAtTime(0.00001, actx.currentTime + d);
  o.stop(actx.currentTime + d);
}
const atkSound = () => tone(523, 0.12, 'triangle', 0.15);
const skillSound = () => tone(880, 0.18, 'square', 0.2);
const hurtSound = () => tone(220, 0.25, 'sawtooth', 0.2);
const lvUpSound = () => { if (!sfxOn) return; tone(523, 0.12); setTimeout(() => tone(659, 0.12), 130); setTimeout(() => tone(784, 0.25), 260); };
const defeatSound = () => { tone(392, 0.15); setTimeout(() => tone(523, 0.25), 160); };
const bossSound = () => { tone(110, 0.5, 'sawtooth', 0.3); setTimeout(() => tone(82, 0.8, 'sawtooth', 0.3), 400); };
window.setVol = v => { if (mgain) mgain.gain.value = v; localStorage.volume = v; };
window.setSfx = e => { sfxOn = e; localStorage.setItem('mute', e ? '0' : '1'); };
const flash = () => { document.body.classList.add('flash'); setTimeout(() => document.body.classList.remove('flash'), 200); };
const shake = () => { document.querySelector('.app').classList.add('shake'); setTimeout(() => document.querySelector('.app').classList.remove('shake'), 200); };

// ========== 裝備強化 ==========
function calcEqBonus(eq) {
  let a = 0, h = 0;
  eq.forEach(e => { if (e.equipped) e.type === 'weapon' ? a += e.bonus : h += e.bonus; });
  return { atk: a, hp: h };
}
function setBonus(eq) {
  let w = eq.filter(e => e.type === 'weapon' && e.equipped).length;
  let a = eq.filter(e => e.type === 'armor' && e.equipped).length;
  return { atk: w >= 2 ? 0.05 : 0, hp: a >= 2 ? 0.05 : 0 };
}
function applyEquipBonus() {
  let b = calcEqBonus(window.equipment);
  let s = setBonus(window.equipment);
  let atkBonus = window.baseAtk + b.atk * (1 + s.atk);
  let hpBonus = window.baseHp + b.hp * (1 + s.hp);
  if (window.petAtkBonus) atkBonus *= (1 + window.petAtkBonus);
  if (window.petHpBonus) hpBonus *= (1 + window.petHpBonus);
  window.atk = Math.floor(atkBonus);
  window.maxHp = Math.floor(hpBonus);
  if (window.hp > window.maxHp) window.hp = window.maxHp;
  updateUI();
}
function upgradeEquipment(id) {
  let item = window.equipment.find(e => e.id == id);
  if (!item) return;
  let cost = 50 * ((item.level || 0) + 1);
  if (window.gold >= cost) {
    window.gold -= cost;
    item.level = (item.level || 0) + 1;
    let addBonus = 2;
    item.bonus += addBonus;
    toast(`${item.name} 強化至 +${item.level}`, false);
    updateGoldUI();
    saveGame();
    applyEquipBonus();
    showBackpack();
  } else toast(`金幣不足，需要 ${cost}`, true);
}

// ========== 裝備系統基礎 ==========
const QUALITY = [
  { name: '普通', color: '#9ca3af', min: 1, max: 3, rate: 0.5 },
  { name: '優秀', color: '#4ade80', min: 4, max: 6, rate: 0.3 },
  { name: '稀有', color: '#3b82f6', min: 7, max: 10, rate: 0.15 },
  { name: '史詩', color: '#a855f7', min: 11, max: 15, rate: 0.05 }
];
function randomQuality() { let r = Math.random(), a = 0; for (let q of QUALITY) if ((a += q.rate) > r) return q; return QUALITY[0]; }
function generateEquipment() {
  let t = rand(0, 1) ? 'weapon' : 'armor';
  let q = randomQuality();
  let b = rand(q.min, q.max);
  return { id: Date.now() + '-' + Math.random(), type: t, quality: q.name, color: q.color, bonus: b, name: `${q.name} ${t === 'weapon' ? '武器' : '防具'}`, equipped: false, level: 0 };
}
function showBackpack() {
  let ov = document.createElement('div'); ov.className = 'backpack-overlay';
  let cd = document.createElement('div'); cd.className = 'backpack-card'; cd.innerHTML = '<h3>🎒 背包</h3>';
  if (window.equipment.length === 0) cd.innerHTML += '<p>無裝備</p>';
  else {
    window.equipment.forEach(e => {
      let level = e.level || 0;
      let div = document.createElement('div'); div.className = 'backpack-item'; div.style.borderLeftColor = e.color;
      div.innerHTML = `<span style="color:${e.color}">${e.name}+${e.bonus} (強化+${level})</span><button data-id="${e.id}" class="eqBtn">${e.equipped ? '卸下' : '裝備'}</button><button data-id="${e.id}" class="upgradeBtn">強化</button>`;
      div.querySelector('.eqBtn').onclick = () => { toggleEquip(e.id); ov.remove(); showBackpack(); };
      div.querySelector('.upgradeBtn').onclick = () => { upgradeEquipment(e.id); ov.remove(); showBackpack(); };
      cd.appendChild(div);
    });
  }
  let cls = document.createElement('button'); cls.innerText = '關閉'; cls.onclick = () => ov.remove();
  cd.appendChild(cls); ov.appendChild(cd); document.body.appendChild(ov);
}
function toggleEquip(id) {
  let item = window.equipment.find(e => e.id == id);
  if (!item) return;
  if (item.equipped) {
    item.equipped = false;
    toast(`已卸下 ${item.name}`);
  } else {
    let same = window.equipment.find(e => e.type === item.type && e.equipped);
    if (same) same.equipped = false;
    item.equipped = true;
    toast(`已裝備 ${item.name}`);
  }
  applyEquipBonus();
  saveGame();
  showBackpack();
}

// ========== 寵物系統 ==========
let ownedPets = [];
let currentPet = null;
const pets = [
  { id: 'fire', name: '🔥小火龍', price: 300, bonus: { atkPercent: 0.05 } },
  { id: 'turtle', name: '🐢綠葉龜', price: 300, bonus: { hpPercent: 0.05 } },
  { id: 'bird', name: '⚡閃電鳥', price: 300, bonus: { critPercent: 0.03 } }
];
function applyPetBonus() {
  window.petAtkBonus = 0;
  window.petHpBonus = 0;
  window.petCritBonus = 0;
  if (currentPet) {
    if (currentPet.bonus.atkPercent) window.petAtkBonus = currentPet.bonus.atkPercent;
    if (currentPet.bonus.hpPercent) window.petHpBonus = currentPet.bonus.hpPercent;
    if (currentPet.bonus.critPercent) window.petCritBonus = currentPet.bonus.critPercent;
  }
  applyEquipBonus();
  updateUI();
}
function buyPet(petId) {
  let pet = pets.find(p => p.id === petId);
  if (ownedPets.includes(petId)) { toast('已經擁有這隻寵物', true); return; }
  if (window.gold >= pet.price) {
    window.gold -= pet.price;
    ownedPets.push(petId);
    currentPet = pet;
    applyPetBonus();
    updateGoldUI();
    saveGame();
    renderShop();
    updatePetUI();
    toast(`成功購買 ${pet.name}！`, false);
  } else toast(`金幣不足，需要 ${pet.price}`, true);
}
function updatePetUI() {
  let petDiv = document.getElementById('petStatus');
  let bonusSpan = document.getElementById('petBonusDisplay');
  if (petDiv) {
    if (currentPet) petDiv.innerHTML = `<div class="pet-active">🐕 夥伴: ${currentPet.name} 已召喚</div>`;
    else petDiv.innerHTML = `<div>尚無寵物，請至商店購買</div>`;
  }
  if (bonusSpan) {
    if (currentPet) {
      let txt = '';
      if (currentPet.bonus.atkPercent) txt = `攻擊 +${currentPet.bonus.atkPercent * 100}%`;
      else if (currentPet.bonus.hpPercent) txt = `生命 +${currentPet.bonus.hpPercent * 100}%`;
      else if (currentPet.bonus.critPercent) txt = `暴擊率 +${currentPet.bonus.critPercent * 100}%`;
      bonusSpan.innerText = `🐾 ${txt}`;
    } else bonusSpan.innerText = '';
  }
}
function buyRandomEquipment() {
  if (window.gold >= 100) {
    window.gold -= 100;
    let eq = generateEquipment();
    window.equipment.push(eq);
    toast(`購買裝備箱獲得 ${eq.name}+${eq.bonus}`, false);
    if (!window.equipment.some(e => e.type === eq.type && e.equipped)) {
      eq.equipped = true;
      applyEquipBonus();
      toast(`✨自動裝備`, false);
    }
    updateGoldUI();
    saveGame();
  } else toast('金幣不足，需要100金幣', true);
}

// ========== 金幣系統 ==========
window.gold = 0;
function updateGoldUI() {
  let spans = document.querySelectorAll('#goldAmount, #goldGame');
  spans.forEach(s => { if (s) s.innerText = window.gold; });
}
function addGold(amount) {
  let mult = window.goldMultiplier || 1;
  let final = Math.floor(amount * mult);
  window.gold += final;
  updateGoldUI();
  saveGame();
}

// ========== 天賦系統 ==========
let talentPoints = 0;
const talents = [
  { id: 'crit', name: '暴擊率', desc: '增加暴擊率 +5%', max: 3, current: 0, effect: lvl => lvl * 0.05 },
  { id: 'exp', name: '經驗加成', desc: '增加經驗獲取 +10%', max: 3, current: 0, effect: lvl => 1 + lvl * 0.1 },
  { id: 'gold', name: '金幣加成', desc: '增加金幣獲取 +10%', max: 3, current: 0, effect: lvl => 1 + lvl * 0.1 }
];
function addTalentPoint() { talentPoints++; updateTalentUI(); saveGame(); }
function upgradeTalent(id) {
  let t = talents.find(t => t.id === id);
  if (t && t.current < t.max && talentPoints > 0) {
    t.current++;
    talentPoints--;
    updateTalentUI();
    saveGame();
    applyTalentBonuses();
    toast(`${t.name} 升級到 Lv.${t.current}`, false);
  } else toast('技能點不足或已滿', true);
}
function applyTalentBonuses() {
  let critBonus = talents.find(t => t.id === 'crit').current * 0.05;
  window.critRate = 0.15 + critBonus + (window.petCritBonus || 0);
  window.expMultiplier = 1 + talents.find(t => t.id === 'exp').current * 0.1;
  window.goldMultiplier = 1 + talents.find(t => t.id === 'gold').current * 0.1;
}
function updateTalentUI() {
  let container = document.getElementById('talentList');
  if (!container) return;
  document.getElementById('talentPoints').innerText = talentPoints;
  container.innerHTML = talents.map(t => `
    <div class="tree-item"><div><strong>${t.name}</strong><br><span style="font-size:0.7rem;">${t.desc} (${t.current}/${t.max})</span></div>
    <button class="upgradeTalentBtn" data-id="${t.id}" ${t.current >= t.max || talentPoints <= 0 ? 'disabled' : ''}>升級</button></div>
  `).join('');
  document.querySelectorAll('.upgradeTalentBtn').forEach(btn => {
    btn.addEventListener('click', () => upgradeTalent(btn.dataset.id));
  });
}

// ========== 每日任務 ==========
let dailyQuests = [
  { desc: '擊敗 5 隻怪物', target: 5, current: 0, reward: 200, completed: false, claimed: false },
  { desc: '使用 3 次技能', target: 3, current: 0, reward: 150, completed: false, claimed: false },
  { desc: '獲得 2 件裝備', target: 2, current: 0, reward: 100, completed: false, claimed: false }
];
function resetDailyQuests() {
  const today = new Date().toDateString();
  if (localStorage.getItem('lastQuestDate') !== today) {
    dailyQuests = dailyQuests.map(q => ({ ...q, current: 0, completed: false, claimed: false }));
    localStorage.setItem('lastQuestDate', today);
    saveGame();
  }
}
function updateQuestProgress(type, amount = 1) {
  if (type === 'kill') dailyQuests[0].current += amount;
  else if (type === 'skill') dailyQuests[1].current += amount;
  else if (type === 'equip') dailyQuests[2].current += amount;
  for (let q of dailyQuests) {
    if (!q.completed && q.current >= q.target) q.completed = true;
  }
  updateQuestUI();
  saveGame();
}
function updateQuestUI() {
  let container = document.getElementById('questList');
  if (!container) return;
  container.innerHTML = dailyQuests.map(q => `
    <div class="setting-item"><div>${q.desc} (${q.current}/${q.target})</div><div>${q.completed ? '✅ 已完成' : '⏳ 進行中'}</div></div>
  `).join('');
}
function claimQuestReward() {
  let total = 0;
  for (let q of dailyQuests) {
    if (q.completed && !q.claimed) {
      q.claimed = true;
      total += q.reward;
    }
  }
  if (total > 0) {
    addGold(total);
    toast(`領取 ${total} 金幣獎勵！`, false);
    saveGame();
    updateQuestUI();
  } else toast('沒有可領取的獎勵', true);
}

// ========== 離線收益 ==========
function calcOfflineReward() {
  let last = localStorage.getItem('lastOnline');
  if (last) {
    let diff = (Date.now() - parseInt(last)) / 1000 / 60 / 60;
    if (diff > 1) {
      let goldGain = Math.floor(10 * Math.min(diff, 24) * (window.goldMultiplier || 1));
      let expGain = Math.floor(5 * Math.min(diff, 24));
      addGold(goldGain);
      window.exp += expGain;
      while (window.exp >= 50) levelUp();
      toast(`離線 ${Math.floor(diff)} 小時，獲得 ${goldGain} 金幣、${expGain} 經驗`, false);
    }
  }
  localStorage.setItem('lastOnline', Date.now());
}

// ========== 遊戲核心狀態 ==========
window.hp = 100; window.maxHp = 100; window.exp = 0; window.lv = 1; window.atk = 10;
window.restUsed = false; window.curMonster = null;
window.baseAtk = 10; window.baseHp = 100;
window.equipment = [];
window.totalKills = 0; window.maxDamage = 0; window.maxLevel = 1;
window.deathStreak = 0; window.lastDmg = 0;
window.difficulty = localStorage.getItem('difficulty') || 'normal';
window.petAtkBonus = 0; window.petHpBonus = 0; window.petCritBonus = 0;
window.critRate = 0.15;
window.expMultiplier = 1;
window.goldMultiplier = 1;

const zones = [
  { name: "🌳新手村", maxLv: 30, mons: ["🟣史萊姆", "🟢哥布林", "🐺森林狼", "🦇蝙蝠", "🌿樹精"] },
  { name: "🏜️沙漠", maxLv: 90, mons: ["🦂巨蠍", "🧻木乃伊", "🐍沙蛇", "🦅沙鷹", "🏺詛咒陶罐"] },
  { name: "⛰️蒼穹", maxLv: 100, mons: ["🐉青龍", "👼天使", "😈惡魔", "✨星辰之靈", "🌙月獸"] }
];
const monsterSkills = [
  { name: '毒擊', effect: '🌿', dmgMod: 1.2 }, { name: '砂塵', effect: '🏜️', dmgMod: 1.0 },
  { name: '龍息', effect: '🐉', dmgMod: 1.5 }, { name: '閃電', effect: '⚡', dmgMod: 1.3 },
  { name: '冰霜', effect: '❄️', dmgMod: 1.1 }, { name: '治癒', effect: '💚', heal: 15 }
];
function isBoss(lv) { return lv % 10 === 0; }
const bossNames = ["新手守護者", "沙暴領主", "蒼穹巨龍", "深淵魔王", "永凍冰凰", "雷霆泰坦", "暗影幽靈", "黃金獅鷲", "時間守護者", "終焉之神"];
function getBossName(lv) { return bossNames[Math.floor((lv - 1) / 10)] || "上古Boss"; }
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
  let isBossNow = isBoss(window.lv);
  let emoji, name, skill;
  if (isBossNow) {
    emoji = "👑"; name = getBossName(window.lv); skill = monsterSkills[Math.floor(Math.random() * monsterSkills.length)];
  } else {
    let zone = getZone(), mons = zone.mons, raw = mons[Math.floor(Math.random() * mons.length)];
    emoji = raw[0]; name = raw.slice(1); skill = monsterSkills[Math.floor(Math.random() * monsterSkills.length)];
  }
  let m = getMult(), off = m.off;
  if (window.deathStreak >= 3 && window.difficulty !== 'easy') off = Math.max(-5, off - Math.floor(window.deathStreak / 2));
  let mlv = Math.max(1, window.lv + off);
  if (isBossNow) mlv = window.lv + 2;
  let baseHp = (30 + mlv * 2.5) * m.hp;
  let baseAtk = (5 + Math.floor(mlv / 2.5)) * m.atk;
  if (isBossNow) { baseHp *= 2; baseAtk *= 1.5; }
  let varf = v => Math.floor(v * (0.6 + Math.random() * 0.8));
  let expGain = Math.max(1, Math.floor((12 + mlv * 0.8) * m.exp));
  if (isBossNow) expGain *= 3;
  return { emoji, name, mlv, hp: varf(baseHp), maxHp: varf(baseHp), atk: varf(baseAtk), exp: expGain, skill, isBoss: isBossNow };
}
function refreshMonster() {
  window.curMonster = genMonster();
  window.restUsed = false;
  updateUI();
  log(`✨ ${window.curMonster.isBoss ? '👑BOSS ' : ''}${window.curMonster.emoji}${window.curMonster.name} Lv.${window.curMonster.mlv} | HP${window.curMonster.hp} 攻${window.curMonster.atk}`);
  if (window.curMonster.isBoss) bossSound();
}
function updateUI() {
  document.getElementById('hpText').innerText = `${window.hp}/${window.maxHp}`;
  document.getElementById('expText').innerText = `${window.exp}/50`;
  document.getElementById('levelText').innerText = window.lv;
  document.getElementById('atkText').innerText = window.atk;
  document.getElementById('zoneText').innerHTML = getZone().name;
  if (window.curMonster) {
    document.getElementById('monsterName').innerHTML = `${window.curMonster.emoji}${window.curMonster.name}`;
    document.getElementById('monsterEmoji').innerText = window.curMonster.emoji;
    document.getElementById('monsterHpText').innerText = `${window.curMonster.hp}/${window.curMonster.maxHp}`;
    document.getElementById('monsterLevelText').innerText = window.curMonster.mlv;
    document.getElementById('monsterBar').style.width = `${(window.curMonster.hp / window.curMonster.maxHp) * 100}%`;
  }
  document.getElementById('hpBar').style.width = `${(window.hp / window.maxHp) * 100}%`;
  document.getElementById('expBar').style.width = `${(window.exp / 50) * 100}%`;
  document.getElementById('restBtn').disabled = window.restUsed;
  updateGoldUI();
  updatePetUI();
}
function log(msg) { document.getElementById('logMsg').innerHTML = msg; }

// ========== 存檔與雲端 ==========
const firebaseConfig = { apiKey: "AIzaSyDevirfNqjlg5hVkF6pgMMU9tfx7CDac4A", authDomain: "monster-game-f193f.firebaseapp.com", projectId: "monster-game-f193f", storageBucket: "monster-game-f193f.firebasestorage.app", messagingSenderId: "304101821779", appId: "1:304101821779:web:9b77e901083a7949f265a6" };
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth(), db = firebase.firestore(), provider = new firebase.auth.GoogleAuthProvider();
let currentUser = null;
window.googleLogin = async () => {
  try {
    let r = await auth.signInWithPopup(provider);
    currentUser = r.user;
    let btn = document.getElementById('googleBtn');
    if (btn) { btn.innerText = `👤 ${currentUser.displayName}`; btn.disabled = true; }
    toast(`歡迎 ${currentUser.displayName}`);
    await loadCloudSave();
  } catch (e) { toast('登入失敗', 1); }
};
window.googleLogout = async () => {
  await auth.signOut();
  currentUser = null;
  let btn = document.getElementById('googleBtn');
  if (btn) { btn.innerText = '登入'; btn.disabled = false; }
  toast('已登出');
  loadGame();
};
auth.onAuthStateChanged(u => {
  currentUser = u;
  let btn = document.getElementById('googleBtn');
  if (btn) {
    if (u) { btn.innerText = `👤 ${u.displayName}`; btn.disabled = true; }
    else { btn.innerText = '登入'; btn.disabled = false; }
  }
});
function saveGame() {
  const state = {
    lv: window.lv, exp: window.exp, baseAtk: window.baseAtk, baseHp: window.baseHp,
    hp: window.hp, maxHp: window.maxHp, atk: window.atk, restUsed: window.restUsed,
    difficulty: window.difficulty, equipment: window.equipment, deathStreak: window.deathStreak,
    lastDmg: window.lastDmg, totalKills: window.totalKills, maxDamage: window.maxDamage,
    maxLevel: window.maxLevel, gold: window.gold, ownedPets, currentPet: currentPet ? currentPet.id : null,
    talentPoints, talents: talents.map(t => ({ id: t.id, current: t.current })), dailyQuests
  };
  localStorage.setItem('gameSave', JSON.stringify(state));
  toast('💾 存檔');
  if (currentUser) db.collection('players').doc(currentUser.uid).set(state).catch(e => toast('雲端失敗', 1));
}
function loadGame() {
  let raw = localStorage.getItem('gameSave');
  if (raw) {
    try {
      let s = JSON.parse(raw);
      window.lv = s.lv ?? 1; window.exp = s.exp ?? 0; window.baseAtk = s.baseAtk ?? 10; window.baseHp = s.baseHp ?? 100;
      window.hp = s.hp ?? 100; window.maxHp = s.maxHp ?? 100; window.atk = s.atk ?? 10; window.restUsed = s.restUsed ?? false;
      window.difficulty = s.difficulty ?? 'normal'; window.equipment = Array.isArray(s.equipment) ? s.equipment : [];
      window.deathStreak = s.deathStreak ?? 0; window.lastDmg = s.lastDmg ?? 0;
      window.totalKills = s.totalKills ?? 0; window.maxDamage = s.maxDamage ?? 0; window.maxLevel = s.maxLevel ?? 1;
      window.gold = s.gold ?? 0;
      ownedPets = s.ownedPets || [];
      if (s.currentPet) {
        let pet = pets.find(p => p.id === s.currentPet);
        if (pet) currentPet = pet;
      }
      talentPoints = s.talentPoints ?? 0;
      if (s.talents) {
        for (let t of s.talents) {
          let target = talents.find(tt => tt.id === t.id);
          if (target) target.current = t.current;
        }
      }
      if (s.dailyQuests) dailyQuests = s.dailyQuests;
      resetDailyQuests();
      let ds = document.getElementById('diffSelect'); if (ds) ds.value = window.difficulty;
    } catch (e) { }
  }
  applyEquipBonus();
  applyTalentBonuses();
  applyPetBonus();
  refreshMonster();
  updateUI();
}
async function loadCloudSave() {
  if (!currentUser) return;
  try {
    let doc = await db.collection('players').doc(currentUser.uid).get();
    if (doc.exists) {
      let s = doc.data();
      window.lv = s.lv ?? 1; window.exp = s.exp ?? 0; window.baseAtk = s.baseAtk ?? 10; window.baseHp = s.baseHp ?? 100;
      window.hp = s.hp ?? 100; window.maxHp = s.maxHp ?? 100; window.atk = s.atk ?? 10; window.restUsed = s.restUsed ?? false;
      window.difficulty = s.difficulty ?? 'normal'; window.equipment = Array.isArray(s.equipment) ? s.equipment : [];
      window.deathStreak = s.deathStreak ?? 0; window.lastDmg = s.lastDmg ?? 0;
      window.totalKills = s.totalKills ?? 0; window.maxDamage = s.maxDamage ?? 0; window.maxLevel = s.maxLevel ?? 1;
      window.gold = s.gold ?? 0;
      ownedPets = s.ownedPets || [];
      if (s.currentPet) {
        let pet = pets.find(p => p.id === s.currentPet);
        if (pet) currentPet = pet;
      }
      talentPoints = s.talentPoints ?? 0;
      if (s.talents) {
        for (let t of s.talents) {
          let target = talents.find(tt => tt.id === t.id);
          if (target) target.current = t.current;
        }
      }
      if (s.dailyQuests) dailyQuests = s.dailyQuests;
      resetDailyQuests();
      applyEquipBonus();
      applyTalentBonuses();
      applyPetBonus();
      refreshMonster();
      updateUI();
      toast('☁️ 雲端同步');
    } else loadGame();
  } catch (e) { toast('雲端失敗', 1); loadGame(); }
}

// ========== 戰鬥邏輯 ==========
function levelUp() {
  let up = false;
  while (window.exp >= 50) {
    window.exp -= 50; window.lv++; window.baseHp += 20; window.baseAtk += 5;
    let bonus = calcEqBonus(window.equipment);
    window.hp = Math.floor((window.baseHp + bonus.hp) * 0.7);
    up = true;
    log(`🎉 升 Lv${window.lv} 攻${window.baseAtk + bonus.atk}`);
    if (window.lv > window.maxLevel) window.maxLevel = window.lv;
    lvUpSound();
    addTalentPoint();
  }
  if (up) refreshMonster();
  applyEquipBonus();
  saveGame();
}
function monsterSkillAttack() {
  if (!window.curMonster || !window.curMonster.skill) return;
  let s = window.curMonster.skill;
  if (s.name === '治癒' && s.heal) {
    let heal = Math.floor(window.curMonster.maxHp * 0.15);
    window.curMonster.hp = Math.min(window.curMonster.maxHp, window.curMonster.hp + heal);
    log(`💚 ${window.curMonster.emoji}${window.curMonster.name} 治療 ${heal}HP`);
    updateUI();
    return;
  }
  let baseDmg = Math.max(1, rand(window.curMonster.atk - 2, window.curMonster.atk + 2));
  let dmg = Math.floor(baseDmg * (s.dmgMod || 1));
  window.hp = Math.max(0, window.hp - dmg);
  log(`💀 ${window.curMonster.emoji}${window.curMonster.name} ${s.effect}${s.name} ${dmg}傷`);
  if (window.hp <= 0) { window.hp = window.maxHp; window.restUsed = false; window.deathStreak++; log(`💀 復活`); }
  updateUI();
  saveGame();
}
function monsterCounter() {
  if (!window.curMonster) return;
  let d = Math.max(1, rand(window.curMonster.atk - 3, window.curMonster.atk + 2));
  window.hp -= d;
  log(`😈 ${window.curMonster.emoji}${window.curMonster.name} 反擊 ${d}`);
  if (window.hp <= 0) { window.hp = window.maxHp; window.restUsed = false; window.deathStreak++; log(`💀 復活`); }
  else window.deathStreak = 0;
  updateUI();
  saveGame();
  let skillChance = window.curMonster.isBoss ? 0.7 : 0.4;
  if (Math.random() < skillChance) monsterSkillAttack();
  if (window.curMonster.isBoss && window.curMonster.hp <= window.curMonster.maxHp * 0.3) {
    window.curMonster.atk = Math.floor(window.curMonster.atk * 1.5);
    log(`💢 Boss 狂暴！攻擊力提升 50%！`);
  }
}
function defeatMonster() {
  if (!window.curMonster) return;
  let expGain = Math.floor(window.curMonster.exp * (window.expMultiplier || 1));
  window.exp += expGain;
  let goldDrop = rand(10, window.curMonster.isBoss ? 100 : 30);
  addGold(goldDrop);
  log(`🎉 擊敗 ${window.curMonster.isBoss ? '👑BOSS ' : ''}+${expGain}EXP +${goldDrop}💰`);
  window.totalKills++;
  if (window.lastDmg > window.maxDamage) window.maxDamage = window.lastDmg;
  updateQuestProgress('kill');
  if (Math.random() < 0.3 || window.curMonster.isBoss) {
    let eq = generateEquipment();
    if (window.curMonster.isBoss) eq.quality = '史詩';
    window.equipment.push(eq);
    updateQuestProgress('equip');
    toast(`🎁獲得 ${eq.name}+${eq.bonus}`);
    if (!window.equipment.some(e => e.type === eq.type && e.equipped)) {
      eq.equipped = true;
      applyEquipBonus();
      toast(`✨自動裝備`);
    }
    saveGame();
  }
  levelUp();
  refreshMonster();
  updateUI();
  defeatSound();
}
function attack() {
  initAudio();
  atkSound();
  flash();
  shake();
  if (window.hp <= 0) { log('無法攻擊'); return; }
  if (!window.curMonster) { refreshMonster(); return; }
  let baseDmg = Math.max(2, rand(window.atk - 3, window.atk + 5));
  let isCrit = Math.random() < (window.critRate || 0.15);
  let finalDmg = isCrit ? Math.floor(baseDmg * 1.5) : baseDmg;
  window.lastDmg = finalDmg;
  window.curMonster.hp -= finalDmg;
  let critMsg = isCrit ? ' 暴擊！' : '';
  log(`⚔️ ${finalDmg}傷${critMsg}`);
  if (window.curMonster.hp <= 0) defeatMonster();
  else monsterCounter();
  updateUI();
  saveGame();
}
function showSkillMenu() {
  let ov = document.createElement('div');
  ov.className = 'skill-menu-overlay';
  let cd = document.createElement('div');
  cd.className = 'skill-menu-card';
  cd.innerHTML = '<h3>選技能</h3>';
  const skillList = [
    { name: '火焰拳', dmg: atk => rand(atk + 8, atk * 2 + 5), effect: '🔥' },
    { name: '水槍', dmg: atk => rand(atk + 5, atk * 2 + 2), effect: '💧' },
    { name: '雷電', dmg: atk => rand(atk + 10, atk * 2 + 8), effect: '⚡' },
    { name: '治癒', heal: 30, effect: '💚' }
  ];
  skillList.forEach(s => {
    let btn = document.createElement('button');
    btn.innerText = s.name === '治癒' ? `${s.name} (恢復${s.heal}HP)` : s.name;
    btn.onclick = () => {
      document.body.removeChild(ov);
      if (window.hp <= 0) { log('無法施放'); return; }
      if (!window.curMonster && s.name !== '治癒') { log('沒有怪物'); return; }
      if (s.name === '治癒') {
        window.hp = Math.min(window.maxHp, window.hp + s.heal);
        log(`✨恢復${s.heal}HP`);
        updateUI();
        saveGame();
        updateQuestProgress('skill');
      } else {
        let dmg = s.dmg(window.atk);
        let isCrit = Math.random() < (window.critRate || 0.15);
        if (isCrit) dmg = Math.floor(dmg * 1.5);
        window.lastDmg = dmg;
        window.curMonster.hp -= dmg;
        log(`✨${s.effect} ${dmg}傷${isCrit ? ' 暴擊！' : ''}`);
        if (window.curMonster.hp <= 0) defeatMonster();
        else monsterCounter();
        updateUI();
        saveGame();
        updateQuestProgress('skill');
      }
      skillSound();
      flash();
      shake();
    };
    cd.appendChild(btn);
  });
  let cancel = document.createElement('button');
  cancel.innerText = '取消';
  cancel.onclick = () => document.body.removeChild(ov);
  cd.appendChild(cancel);
  ov.appendChild(cd);
  document.body.appendChild(ov);
}
function rest() {
  initAudio();
  if (window.restUsed) { log('已休息過'); return; }
  if (window.hp <= 0) { log('無法休息'); return; }
  window.hp = Math.min(window.maxHp, window.hp + 30);
  window.restUsed = true;
  log(`😴恢復30HP`);
  let sneak = Math.max(1, rand(window.curMonster.atk - 2, window.curMonster.atk + 1));
  window.hp = Math.max(0, window.hp - sneak);
  log(`⚠️偷襲-${sneak}`);
  if (window.hp <= 0) { window.hp = window.maxHp; window.restUsed = false; log('💀復活'); }
  updateUI();
  saveGame();
  hurtSound();
}

// ========== 商店頁面渲染 ==========
function renderShop() {
  let container = document.getElementById('shopItemsList');
  if (!container) return;
  container.innerHTML = `
    <div class="shop-item"><div>🎁 隨機裝備箱</div><button id="buyEqBtn">100💰</button></div>
    ${pets.map(pet => `
      <div class="shop-item"><div>${pet.name}</div><button id="buyPet_${pet.id}" ${ownedPets.includes(pet.id) ? 'disabled style="opacity:0.5;"' : ''}>${pet.price}💰</button></div>
    `).join('')}
  `;
  document.getElementById('buyEqBtn')?.addEventListener('click', () => buyRandomEquipment());
  pets.forEach(pet => {
    document.getElementById(`buyPet_${pet.id}`)?.addEventListener('click', () => buyPet(pet.id));
  });
}

// ========== UI設定 ==========
window.renderSettings = () => {
  let c = document.getElementById('settingsList');
  if (!c) return;
  let vol = Math.round((localStorage.volume ? parseFloat(localStorage.volume) : 0.7) * 100);
  let diff = window.difficulty, isMuted = localStorage.getItem('mute') === '1';
  c.innerHTML = `
    <div class="setting-item"><div>🔊音量</div><input type="range" id="volSlider" min="0" max="100" value="${vol}"></div>
    <div class="setting-item"><div>🔔音效</div><label class="switch"><input type="checkbox" id="sfxCk" ${!isMuted ? 'checked' : ''}><span class="slider"></span></label></div>
    <div class="setting-item"><div>⚔️難度</div><select id="diffSelect"><option value="easy" ${diff === 'easy' ? 'selected' : ''}>簡單</option><option value="normal" ${diff === 'normal' ? 'selected' : ''}>普通</option><option value="hard" ${diff === 'hard' ? 'selected' : ''}>困難</option><option value="extreme" ${diff === 'extreme' ? 'selected' : ''}>極限</option></select></div>
    <div class="setting-item"><div>🔐Google</div><div><button id="googleBtn" style="background:#334155;padding:6px 12px;">登入</button> <button id="logoutBtn" style="background:#334155;padding:6px 12px;">登出</button></div></div>
    <div class="setting-item"><div>🏆成就</div><div>🐉${window.totalKills} 💥${window.maxDamage} 🏆${window.maxLevel}</div></div>
    <div class="setting-item"><div>📌 版本</div><div>${APP_VERSION}</div></div>
    <div class="setting-item"><div>🔄 檢查更新</div><button id="checkUpdateBtn" style="background:#3b82f6; color:white; border:none; padding:6px 12px; border-radius:30px; cursor:pointer;">檢查</button></div>
    <div class="setting-item"><div style="color:#f87171;">⚠️重置遊戲</div><button id="resetGameBtn" style="background:#ef4444; color:white; border:none; padding:6px 12px; border-radius:30px; cursor:pointer;">重置</button></div>`;
  document.getElementById('volSlider')?.addEventListener('input', e => { let v = e.target.value / 100; if (window.setVol) window.setVol(v); });
  document.getElementById('sfxCk')?.addEventListener('change', e => { if (window.setSfx) window.setSfx(e.target.checked); localStorage.setItem('mute', e.target.checked ? '0' : '1'); });
  document.getElementById('diffSelect')?.addEventListener('change', e => { window.difficulty = e.target.value; localStorage.setItem('difficulty', window.difficulty); refreshMonster(); toast(`難度:${window.difficulty}`); });
  document.getElementById('googleBtn')?.addEventListener('click', () => window.googleLogin());
  document.getElementById('logoutBtn')?.addEventListener('click', () => window.googleLogout());
  document.getElementById('checkUpdateBtn')?.addEventListener('click', () => { if (confirm('檢查新版本？')) window.location.reload(); });
  document.getElementById('resetGameBtn')?.addEventListener('click', () => {
    if (confirm('⚠️ 確定重置？所有進度將消失！')) {
      localStorage.clear();
      if (window.googleLogout) window.googleLogout();
      alert('遊戲已重置');
      window.location.reload();
    }
  });
  if (currentUser) { let gb = document.getElementById('googleBtn'); if (gb) { gb.innerText = `👤 ${currentUser.displayName}`; gb.disabled = true; } }
};

// ========== 頁面切換 ==========
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
  if (id === 'settingsPage') window.renderSettings();
  if (id === 'shopPage') { renderShop(); updateGoldUI(); updatePetUI(); }
  if (id === 'talentPage') updateTalentUI();
  if (id === 'questPage') { resetDailyQuests(); updateQuestUI(); document.getElementById('claimQuestRewardBtn').onclick = claimQuestReward; }
}

// ========== 事件綁定（確保攻擊按鈕可用）==========
document.addEventListener('DOMContentLoaded', () => {
  const attackBtn = document.getElementById('attackBtn');
  if (attackBtn) attackBtn.onclick = attack;
  const skillBtn = document.getElementById('skillBtn');
  if (skillBtn) skillBtn.onclick = showSkillMenu;
  const restBtn = document.getElementById('restBtn');
  if (restBtn) restBtn.onclick = rest;
  const inventoryBtn = document.getElementById('inventoryBtn');
  if (inventoryBtn) inventoryBtn.onclick = showBackpack;
  const talentsBtn = document.getElementById('talentsBtn');
  if (talentsBtn) talentsBtn.onclick = () => showPage('talentPage');
  const questBtn = document.getElementById('questBtn');
  if (questBtn) questBtn.onclick = () => showPage('questPage');
  const saveBtn = document.getElementById('saveBtn');
  if (saveBtn) saveBtn.onclick = saveGame;
  // 其他按鈕綁定（與原有保持一致）
  document.getElementById('toGameBtn').onclick = () => showPage('gamePage');
  document.getElementById('toSettingsBtn').onclick = () => showPage('settingsPage');
  document.getElementById('shopBtn').onclick = () => showPage('shopPage');
  document.getElementById('helpBtn').onclick = () => showPage('helpPage');
  document.getElementById('backFromSettings').onclick = () => showPage('mainPage');
  document.getElementById('backFromShop').onclick = () => showPage('mainPage');
  document.getElementById('backFromHelp').onclick = () => showPage('mainPage');
  document.getElementById('backFromGame').onclick = () => showPage('mainPage');
  document.getElementById('backFromTalent').onclick = () => showPage('gamePage');
  document.getElementById('backFromQuest').onclick = () => showPage('gamePage');
});

// ========== 初始啟動 ==========
loadGame();
calcOfflineReward();
if (!localStorage.getItem('guideShown')) {
  let ov = document.getElementById('guideOverlay');
  ov.style.display = 'flex';
  document.getElementById('closeGuideBtn').onclick = () => { ov.style.display = 'none'; localStorage.setItem('guideShown', 'true'); };
}
