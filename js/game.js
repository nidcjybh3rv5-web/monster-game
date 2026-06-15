// ========== 版本 ==========
const APP_VERSION = 'v4.2.0';
if (localStorage.getItem('app_version') !== APP_VERSION) {
  localStorage.setItem('app_version', APP_VERSION);
  location.reload();
}

// ========== 工具 ==========
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
  // 解鎖 AudioContext
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

// ========== 裝備系統 ==========
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
  return { id: Date.now() + '-' + Math.random(), type: t, quality: q.name, color: q.color, bonus: b, name: `${q.name} ${t === 'weapon' ? '武' : '防'}`, equipped: false, level: 0 };
}
function calcEqBonus(eq) {
  let a = 0, h = 0;
  eq.forEach(e => { if (e.equipped) e.type === 'weapon' ? a += e.bonus : h += e.bonus; });
  return { atk: a, hp: h };
}
function applyEquipBonus() {
  let b = calcEqBonus(window.equipment);
  window.atk = Math.floor(window.baseAtk + b.atk);
  window.maxHp = Math.floor(window.baseHp + b.hp);
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
    item.bonus += 2;
    toast(`${item.name} 強化至 +${item.level}`, false);
    updateGoldUI();
    saveGame();
    applyEquipBonus();
    showBackpack();
  } else toast(`金幣不足，需要 ${cost}`, true);
}
function toggleEquip(id) {
  let item = window.equipment.find(e => e.id == id);
  if (!item) return;
  if (item.equipped) {
    item.equipped = false;
    toast(`卸下 ${item.name}`);
  } else {
    let same = window.equipment.find(e => e.type === item.type && e.equipped);
    if (same) same.equipped = false;
    item.equipped = true;
    toast(`裝備 ${item.name}`);
  }
  applyEquipBonus();
  saveGame();
  showBackpack();
}
function decomposeEquipment(threshold = '優秀') {
  const order = ['普通', '優秀', '稀有', '史詩'];
  const idx = order.indexOf(threshold);
  let total = 0;
  window.equipment = window.equipment.filter(eq => {
    if (order.indexOf(eq.quality) < idx && !eq.equipped) {
      total += 10;
      return false;
    }
    return true;
  });
  if (total > 0) {
    addGold(total);
    toast(`分解獲得 ${total} 金幣`, false);
    saveGame();
    applyEquipBonus();
    showBackpack();
  } else toast('沒有低於該品質的可分解裝備', true);
}
function showBackpack() {
  let ov = document.createElement('div'); ov.className = 'backpack-overlay';
  let cd = document.createElement('div'); cd.className = 'backpack-card';
  cd.innerHTML = '<h3>🎒 背包</h3>';
  let decomposeDiv = document.createElement('div');
  decomposeDiv.style.display = 'flex'; decomposeDiv.style.justifyContent = 'space-between'; decomposeDiv.style.marginBottom = '12px';
  let select = document.createElement('select');
  select.innerHTML = '<option value="普通">普通及以下</option><option value="優秀">優秀及以下</option><option value="稀有">稀有及以下</option>';
  select.style.background = '#0f172a'; select.style.color = '#fff'; select.style.borderRadius = '20px';
  let btn = document.createElement('button'); btn.innerText = '分解'; btn.style.background = '#ef4444'; btn.style.border = 'none'; btn.style.padding = '4px 12px'; btn.style.borderRadius = '20px';
  btn.onclick = () => { decomposeEquipment(select.value); ov.remove(); };
  decomposeDiv.appendChild(select); decomposeDiv.appendChild(btn); cd.appendChild(decomposeDiv);
  if (window.equipment.length === 0) cd.innerHTML += '<p>無裝備</p>';
  else {
    window.equipment.forEach(e => {
      let div = document.createElement('div'); div.className = 'backpack-item'; div.style.borderLeftColor = e.color;
      div.innerHTML = `<span style="color:${e.color}">${e.name}+${e.bonus} (強化+${e.level||0})</span><div><button class="eqBtn">${e.equipped ? '卸下' : '裝備'}</button><button class="upgradeBtn">強化</button></div>`;
      div.querySelector('.eqBtn').onclick = () => { toggleEquip(e.id); ov.remove(); };
      div.querySelector('.upgradeBtn').onclick = () => { upgradeEquipment(e.id); ov.remove(); };
      cd.appendChild(div);
    });
  }
  let close = document.createElement('button'); close.innerText = '關閉'; close.className = 'close-backpack'; close.onclick = () => ov.remove();
  cd.appendChild(close); ov.appendChild(cd); document.body.appendChild(ov);
}

// ========== 金幣 ==========
window.gold = 0;
function updateGoldUI() { document.querySelectorAll('#goldAmount, #goldGame').forEach(s => { if(s) s.innerText = window.gold; }); }
function addGold(amount) { window.gold += amount; updateGoldUI(); saveGame(); }

// ========== 每日獎勵 ==========
function canDaily() { return localStorage.getItem('lastDaily') !== new Date().toDateString(); }
function claimDaily() {
  if (!canDaily()) { toast('今日已領'); return false; }
  let r = rand(1,3);
  if (r === 1) { window.exp += 20; toast('🎁20經驗'); levelUp(); }
  else if (r === 2) {
    let eq = generateEquipment();
    window.equipment.push(eq);
    toast(`🎁獲得 ${eq.name}+${eq.bonus}`);
    if (!window.equipment.some(e => e.type === eq.type && e.equipped)) { eq.equipped = true; applyEquipBonus(); toast('✨自動裝備'); }
    updateUI();
  } else {
    window.hp = Math.min(window.maxHp, window.hp + 50);
    toast('🎁50HP藥水');
    updateUI();
  }
  localStorage.setItem('lastDaily', new Date().toDateString());
  saveGame();
  return true;
}

// ========== 戰鬥核心 ==========
window.hp = 100; window.maxHp = 100; window.exp = 0; window.lv = 1; window.atk = 10;
window.restUsed = false; window.curMonster = null;
window.baseAtk = 10; window.baseHp = 100;
window.equipment = [];
window.totalKills = 0; window.maxDamage = 0; window.maxLevel = 1;
window.deathStreak = 0; window.lastDmg = 0;
window.difficulty = localStorage.getItem('difficulty') || 'normal';

const zones = [
  { name: "🌳新手村", maxLv: 30, mons: ["🟣史萊姆","🟢哥布林","🐺森林狼","🦇蝙蝠","🌿樹精"] },
  { name: "🏜️沙漠", maxLv: 90, mons: ["🦂巨蠍","🧻木乃伊","🐍沙蛇","🦅沙鷹","🏺詛咒陶罐"] },
  { name: "⛰️蒼穹", maxLv: 100, mons: ["🐉青龍","👼天使","😈惡魔","✨星辰之靈","🌙月獸"] }
];
const skills = [
  { name: '毒擊', effect: '🌿', dmgMod: 1.2 }, { name: '砂塵', effect: '🏜️', dmgMod: 1.0 },
  { name: '龍息', effect: '🐉', dmgMod: 1.5 }, { name: '閃電', effect: '⚡', dmgMod: 1.3 },
  { name: '冰霜', effect: '❄️', dmgMod: 1.1 }, { name: '治癒', effect: '💚', heal: 15 }
];
function isBoss(lv) { return lv % 10 === 0; }
const bossNames = ["新手守護者","沙暴領主","蒼穹巨龍","深淵魔王","永凍冰凰","雷霆泰坦","暗影幽靈","黃金獅鷲","時間守護者","終焉之神"];
function getZone() { return window.lv <= 30 ? zones[0] : window.lv <= 90 ? zones[1] : zones[2]; }
function getMult() {
  switch(window.difficulty){
    case 'easy': return { hp:0.7, atk:0.7, exp:1.1, off:-2 };
    case 'hard': return { hp:1.5, atk:1.3, exp:0.85, off:3 };
    case 'extreme': return { hp:2.0, atk:1.6, exp:0.7, off:6 };
    default: return { hp:1, atk:1, exp:1, off:0 };
  }
}
function genMonster() {
  let isBossNow = isBoss(window.lv);
  let emoji, name, skill;
  if (isBossNow) {
    emoji = "👑"; name = bossNames[Math.floor((window.lv-1)/10)] || "上古Boss"; skill = skills[Math.floor(Math.random()*skills.length)];
  } else {
    let zone = getZone(), raw = zone.mons[Math.floor(Math.random()*zone.mons.length)];
    emoji = raw[0]; name = raw.slice(1); skill = skills[Math.floor(Math.random()*skills.length)];
  }
  let m = getMult(), off = m.off;
  if (window.deathStreak >= 3 && window.difficulty !== 'easy') off = Math.max(-5, off - Math.floor(window.deathStreak/2));
  let mlv = Math.max(1, window.lv + off);
  if (isBossNow) mlv = window.lv + 2;
  let baseHp = (30 + mlv*2.5) * m.hp;
  let baseAtk = (5 + Math.floor(mlv/2.5)) * m.atk;
  if (isBossNow) { baseHp *= 2; baseAtk *= 1.5; }
  let varf = v => Math.floor(v * (0.6 + Math.random()*0.8));
  let expGain = Math.max(1, Math.floor((12 + mlv*0.8) * m.exp));
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
function levelUp() {
  let up = false;
  while (window.exp >= 50) {
    window.exp -= 50; window.lv++; window.baseHp += 20; window.baseAtk += 5;
    window.hp = window.maxHp; // 升級滿血
    up = true;
    log(`🎉 升 Lv${window.lv} 攻${window.baseAtk}`);
    if (window.lv > window.maxLevel) window.maxLevel = window.lv;
    lvUpSound();
  }
  if (up) refreshMonster();
  applyEquipBonus();
  saveGame();
}
function monsterSkillAttack() {
  if (!window.curMonster?.skill) return;
  let s = window.curMonster.skill;
  if (s.name === '治癒' && s.heal) {
    let heal = Math.floor(window.curMonster.maxHp * 0.15);
    window.curMonster.hp = Math.min(window.curMonster.maxHp, window.curMonster.hp + heal);
    log(`💚 ${window.curMonster.emoji}${window.curMonster.name} 治療 ${heal}HP`);
    updateUI(); return;
  }
  let dmg = Math.floor(Math.max(1, rand(window.curMonster.atk-2, window.curMonster.atk+2)) * (s.dmgMod||1));
  window.hp = Math.max(0, window.hp - dmg);
  log(`💀 ${window.curMonster.emoji}${window.curMonster.name} ${s.effect}${s.name} ${dmg}傷`);
  if (window.hp <= 0) { window.hp = window.maxHp; window.restUsed = false; window.deathStreak++; log(`💀 復活`); }
  updateUI(); saveGame();
}
function monsterCounter() {
  let d = Math.max(1, rand(window.curMonster.atk-3, window.curMonster.atk+2));
  window.hp -= d;
  log(`😈 ${window.curMonster.emoji}${window.curMonster.name} 反擊 ${d}`);
  if (window.hp <= 0) { window.hp = window.maxHp; window.restUsed = false; window.deathStreak++; log(`💀 復活`); }
  else window.deathStreak = 0;
  updateUI(); saveGame();
  if (Math.random() < (window.curMonster.isBoss ? 0.7 : 0.4)) monsterSkillAttack();
}
function defeatMonster() {
  window.exp += window.curMonster.exp;
  let goldDrop = rand(10, window.curMonster.isBoss ? 100 : 30);
  addGold(goldDrop);
  log(`🎉 擊敗 ${window.curMonster.isBoss ? '👑BOSS ' : ''}+${window.curMonster.exp}EXP +${goldDrop}💰`);
  window.totalKills++;
  if (window.lastDmg > window.maxDamage) window.maxDamage = window.lastDmg;
  if (Math.random() < 0.3 || window.curMonster.isBoss) {
    let eq = generateEquipment();
    if (window.curMonster.isBoss) eq.quality = '史詩';
    window.equipment.push(eq);
    toast(`🎁獲得 ${eq.name}+${eq.bonus}`);
    if (!window.equipment.some(e => e.type === eq.type && e.equipped)) { eq.equipped = true; applyEquipBonus(); toast(`✨自動裝備`); }
  }
  levelUp();
  refreshMonster();
  updateUI();
  defeatSound();
}
function attack() {
  initAudio(); atkSound(); flash(); shake();
  if (window.hp <= 0) { log('無法攻擊'); return; }
  if (!window.curMonster) refreshMonster();
  let dmg = Math.max(2, rand(window.atk-3, window.atk+5));
  window.lastDmg = dmg;
  window.curMonster.hp -= dmg;
  log(`⚔️ ${dmg}傷`);
  if (window.curMonster.hp <= 0) defeatMonster();
  else monsterCounter();
  updateUI(); saveGame();
}
function showSkillMenu() {
  let ov = document.createElement('div'); ov.className = 'skill-menu-overlay';
  let cd = document.createElement('div'); cd.className = 'skill-menu-card'; cd.innerHTML = '<h3>選技能</h3>';
  const skillList = [
    { name: '火焰拳', dmg: a => rand(a+8, a*2+5), effect: '🔥' },
    { name: '水槍', dmg: a => rand(a+5, a*2+2), effect: '💧' },
    { name: '雷電', dmg: a => rand(a+10, a*2+8), effect: '⚡' },
    { name: '治癒', heal: 30, effect: '💚' }
  ];
  skillList.forEach(s => {
    let btn = document.createElement('button');
    btn.innerText = s.name === '治癒' ? `${s.name} (恢復${s.heal}HP)` : s.name;
    btn.onclick = () => {
      document.body.removeChild(ov);
      if (window.hp <= 0) { log('無法施放'); return; }
      if (s.name === '治癒') {
        window.hp = Math.min(window.maxHp, window.hp + s.heal);
        log(`✨恢復${s.heal}HP`);
        updateUI(); saveGame();
      } else {
        let d = s.dmg(window.atk);
        window.lastDmg = d;
        window.curMonster.hp -= d;
        log(`✨${s.effect} ${d}傷`);
        if (window.curMonster.hp <= 0) defeatMonster();
        else monsterCounter();
        updateUI(); saveGame();
      }
      skillSound(); flash(); shake();
    };
    cd.appendChild(btn);
  });
  let cancel = document.createElement('button'); cancel.innerText = '取消'; cancel.onclick = () => document.body.removeChild(ov);
  cd.appendChild(cancel); ov.appendChild(cd); document.body.appendChild(ov);
}
function rest() {
  initAudio();
  if (window.restUsed) { log('已休息過'); return; }
  if (window.hp <= 0) { log('無法休息'); return; }
  window.hp = Math.min(window.maxHp, window.hp + 30);
  window.restUsed = true;
  log(`😴恢復30HP`);
  let sneak = Math.max(1, rand(window.curMonster.atk-2, window.curMonster.atk+1));
  window.hp = Math.max(0, window.hp - sneak);
  log(`⚠️偷襲-${sneak}`);
  if (window.hp <= 0) { window.hp = window.maxHp; window.restUsed = false; log('💀復活'); }
  updateUI(); saveGame(); hurtSound();
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
    document.getElementById('monsterBar').style.width = `${(window.curMonster.hp/window.curMonster.maxHp)*100}%`;
  }
  document.getElementById('hpBar').style.width = `${(window.hp/window.maxHp)*100}%`;
  document.getElementById('expBar').style.width = `${(window.exp/50)*100}%`;
  document.getElementById('restBtn').disabled = window.restUsed;
  updateGoldUI();
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
    await loadCloud();
  } catch(e) { toast('登入失敗',1); }
};
window.googleLogout = async () => {
  await auth.signOut();
  currentUser = null;
  let btn = document.getElementById('googleBtn');
  if (btn) { btn.innerText = '登入'; btn.disabled = false; }
  toast('已登出'); loadGame();
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
    maxLevel: window.maxLevel, gold: window.gold
  };
  localStorage.setItem('gameSave', JSON.stringify(state));
  toast('💾 存檔');
  if (currentUser) db.collection('players').doc(currentUser.uid).set(state).catch(e => toast('雲端失敗',1));
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
      let ds = document.getElementById('diffSelect'); if (ds) ds.value = window.difficulty;
    } catch(e) {}
  }
  applyEquipBonus();
  refreshMonster();
  updateUI();
}
async function loadCloud() {
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
      applyEquipBonus(); refreshMonster(); updateUI();
      toast('☁️ 同步');
    } else loadGame();
  } catch(e) { toast('雲端失敗',1); loadGame(); }
}

// ========== 商店 ==========
function renderShop() {
  let container = document.getElementById('shopItemsList');
  if (!container) return;
  container.innerHTML = `<div class="setting-item"><div>🎁 隨機裝備箱</div><button id="buyEqBtn">100💰</button></div>`;
  document.getElementById('buyEqBtn')?.addEventListener('click', () => {
    if (window.gold >= 100) {
      window.gold -= 100;
      let eq = generateEquipment();
      window.equipment.push(eq);
      toast(`購買獲得 ${eq.name}+${eq.bonus}`, false);
      if (!window.equipment.some(e => e.type === eq.type && e.equipped)) { eq.equipped = true; applyEquipBonus(); toast(`✨自動裝備`); }
      updateGoldUI(); saveGame();
    } else toast('金幣不足', true);
  });
}
function checkDailyUI() {
  let sd = document.getElementById('dailyRewardStatus');
  if (sd) sd.innerHTML = canDaily() ? '⭐可領取' : '✅已領';
}

// ========== 設定頁面 ==========
window.renderSettings = () => {
  let c = document.getElementById('settingsList');
  if (!c) return;
  let vol = Math.round((localStorage.volume ? parseFloat(localStorage.volume) : 0.7) * 100);
  let diff = window.difficulty, isMuted = localStorage.getItem('mute') === '1';
  c.innerHTML = `
    <div class="setting-item"><div>🔊音量</div><input type="range" id="volSlider" min="0" max="100" value="${vol}"></div>
    <div class="setting-item"><div>🔔音效</div><label class="switch"><input type="checkbox" id="sfxCk" ${!isMuted ? 'checked' : ''}><span class="slider"></span></label></div>
    <div class="setting-item"><div>⚔️難度</div><select id="diffSelect"><option value="easy" ${diff==='easy'?'selected':''}>簡單</option><option value="normal" ${diff==='normal'?'selected':''}>普通</option><option value="hard" ${diff==='hard'?'selected':''}>困難</option><option value="extreme" ${diff==='extreme'?'selected':''}>極限</option></select></div>
    <div class="setting-item"><div>🔐Google</div><div><button id="googleBtn" style="background:#334155;padding:6px 12px;">登入</button> <button id="logoutBtn" style="background:#334155;padding:6px 12px;">登出</button></div></div>
    <div class="setting-item"><div>🏆成就</div><div>🐉${window.totalKills} 💥${window.maxDamage} 🏆${window.maxLevel}</div></div>
    <div class="setting-item"><div>📌 版本</div><div>${APP_VERSION}</div></div>
    <div class="setting-item"><div>🔄 檢查更新</div><button id="checkUpdateBtn" style="background:#3b82f6; color:white; border:none; padding:6px 12px; border-radius:30px;">檢查</button></div>
    <div class="setting-item"><div style="color:#f87171;">⚠️重置遊戲</div><button id="resetGameBtn" style="background:#ef4444; color:white; border:none; padding:6px 12px; border-radius:30px;">重置</button></div>`;
  document.getElementById('volSlider')?.addEventListener('input', e => { let v = e.target.value/100; if(window.setVol) window.setVol(v); });
  document.getElementById('sfxCk')?.addEventListener('change', e => { if(window.setSfx) window.setSfx(e.target.checked); localStorage.setItem('mute', e.target.checked?'0':'1'); });
  document.getElementById('diffSelect')?.addEventListener('change', e => { window.difficulty = e.target.value; localStorage.setItem('difficulty', window.difficulty); refreshMonster(); toast(`難度:${window.difficulty}`); });
  document.getElementById('googleBtn')?.addEventListener('click', () => window.googleLogin());
  document.getElementById('logoutBtn')?.addEventListener('click', () => window.googleLogout());
  document.getElementById('checkUpdateBtn')?.addEventListener('click', () => { if(confirm('檢查新版本？')) location.reload(); });
  document.getElementById('resetGameBtn')?.addEventListener('click', () => { if(confirm('⚠️ 確定重置？')) { localStorage.clear(); if(window.googleLogout) window.googleLogout(); alert('已重置'); location.reload(); } });
  if (currentUser) { let gb = document.getElementById('googleBtn'); if(gb) { gb.innerText = `👤 ${currentUser.displayName}`; gb.disabled = true; } }
};

// ========== 頁面切換 ==========
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
  if (id === 'settingsPage') window.renderSettings();
  if (id === 'shopPage') { renderShop(); updateGoldUI(); checkDailyUI(); document.getElementById('claimDailyBtn').onclick = () => { claimDaily(); checkDailyUI(); }; }
}

// ========== 事件綁定 ==========
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('attackBtn').onclick = attack;
  document.getElementById('skillBtn').onclick = showSkillMenu;
  document.getElementById('restBtn').onclick = rest;
  document.getElementById('inventoryBtn').onclick = showBackpack;
  document.getElementById('saveBtn').onclick = saveGame;
  document.getElementById('toGameBtn').onclick = () => showPage('gamePage');
  document.getElementById('toSettingsBtn').onclick = () => showPage('settingsPage');
  document.getElementById('shopBtn').onclick = () => showPage('shopPage');
  document.getElementById('helpBtn').onclick = () => showPage('helpPage');
  document.getElementById('backFromSettings').onclick = () => showPage('mainPage');
  document.getElementById('backFromShop').onclick = () => showPage('mainPage');
  document.getElementById('backFromHelp').onclick = () => showPage('mainPage');
  document.getElementById('backFromGame').onclick = () => showPage('mainPage');
  loadGame();
  if (!localStorage.getItem('guideShown')) {
    let ov = document.getElementById('guideOverlay');
    ov.style.display = 'flex';
    document.getElementById('closeGuideBtn').onclick = () => { ov.style.display = 'none'; localStorage.setItem('guideShown','true'); };
  }
});
