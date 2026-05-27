let hp = 100, maxHp = 100, exp = 0, lv = 1, atk = 10, restUsed = false, curMonster = null;
let difficulty = localStorage.difficulty || 'normal', deathStreak = 0, lastDmg = 0;
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
  if (deathStreak >= 3 && difficulty != 'easy') off = Math.max(-5, off - Math.floor(deathStreak / 2));
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
  let state = { hp, maxHp, exp, lv, atk, restUsed, difficulty, achievements, deathStreak, lastDmg };
  localStorage.setItem('gameSave', JSON.stringify(state));
  toast('💾 本地存檔');
  if (window.saveToCloud) window.saveToCloud(state);
}
function loadLocal() {
  let d = localStorage.getItem('gameSave');
  if (d) {
    let s = JSON.parse(d);
    hp = s.hp; maxHp = s.maxHp; exp = s.exp; lv = s.lv; atk = s.atk; restUsed = s.restUsed;
    difficulty = s.difficulty; achievements = s.achievements || { kills: 0, maxDmg: 0, maxLv: 1 };
    deathStreak = s.deathStreak || 0; lastDmg = s.lastDmg || 0;
    document.getElementById('difficultySelect').value = difficulty;
  }
  refresh(); updateUI();
}
window.loadFromCloud = (data) => {
  hp = data.hp; maxHp = data.maxHp; exp = data.exp; lv = data.lv; atk = data.atk; restUsed = data.restUsed;
  difficulty = data.difficulty; achievements = data.achievements; deathStreak = data.deathStreak || 0; lastDmg = data.lastDmg || 0;
  refresh(); updateUI(); updateAchievementsUI();
};
window.changeDifficulty = (val) => { if (confirm('切換難度會重置怪物')) { difficulty = val; localStorage.difficulty = val; refresh(); toast(`難度:${val}`); } else document.getElementById('diffSelect').value = difficulty; };
function levelUp() {
  let up = false;
  while (exp >= 50) {
    exp -= 50; lv++; maxHp += 20; atk += 5; hp = Math.floor(maxHp * 0.7); up = true;
    log(`🎉 升級 Lv${lv} 攻${atk}`); playLevelUp(); recordLevel(lv);
  }
  if (up) refresh(); updateUI(); saveLocal();
}
function defeat() {
  exp += curMonster.exp; log(`🎉 擊敗 Lv.${curMonster.mlv} ${curMonster.name} +${curMonster.exp}EXP`);
  playDefeat(); recordKill(lastDmg); levelUp(); refresh(); updateUI(); saveLocal();
}
function attack() {
  initAudio(); playAttack(); if (hp <= 0) { log('無法攻擊'); return; }
  let dmg = Math.max(2, rand(atk - 3, atk + 5)); lastDmg = dmg; curMonster.hp -= dmg; log(`⚔️ ${dmg}傷害`);
  if (curMonster.hp <= 0) defeat(); else monsterCounter();
  updateUI(); saveLocal();
}
function skill() {
  initAudio(); playSkill(); if (hp <= 0) { log('無法施放'); return; }
  let dmg = rand(atk + 5, atk * 2 + 3); lastDmg = dmg; curMonster.hp -= dmg; log(`🔥 ${dmg}傷害`);
  if (curMonster.hp <= 0) defeat(); else monsterCounter();
  updateUI(); saveLocal();
}
function rest() {
  initAudio(); playRest(); if (restUsed) { log('已休息過'); return; } if (hp <= 0) { log('無法休息'); return; }
  hp = Math.min(maxHp, hp + 30); restUsed = true; log(`😴 恢復30HP`);
  let sneak = Math.max(1, rand(curMonster.atk - 2, curMonster.atk + 1)); hp -= sneak; log(`⚠️ 偷襲 -${sneak}`);
  if (hp <= 0) { hp = maxHp; restUsed = false; log('💀 復活'); }
  updateUI(); saveLocal();
}
function monsterCounter() {
  let dmg = Math.max(1, rand(curMonster.atk - 3, curMonster.atk + 2)); hp -= dmg; playHurt(); log(`😈 Lv.${curMonster.mlv} ${curMonster.name} 反擊 ${dmg}`);
  if (hp <= 0) { hp = maxHp; restUsed = false; deathStreak++; log(`💀 復活 (連死${deathStreak})`); } else deathStreak = 0;
  updateUI(); saveLocal();
}
// 頁面切換
function showPage(id) { document.querySelectorAll('.page').forEach(p => p.classList.remove('active')); document.getElementById(id).classList.add('active'); if (id === 'settingsPage') renderSettings(); }
document.getElementById('toGameBtn').onclick = () => showPage('gamePage');
document.getElementById('toSettingsBtn').onclick = () => showPage('settingsPage');
document.getElementById('helpBtn').onclick = () => showPage('helpPage');
document.getElementById('backFromSettings').onclick = () => showPage('mainPage');
document.getElementById('backFromHelp').onclick = () => showPage('mainPage');
document.getElementById('backFromGame').onclick = () => showPage('mainPage');
document.getElementById('attackBtn').onclick = attack;
document.getElementById('skillBtn').onclick = skill;
document.getElementById('restBtn').onclick = rest;
document.getElementById('saveBtn').onclick = saveLocal;
loadLocal();
