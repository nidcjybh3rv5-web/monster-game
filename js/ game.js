function monsterSkillAttack() {
  if (!window.curMonster?.skill) return;
  let s = window.curMonster.skill;
  if (s.name === '治癒' && s.heal) {
    let heal = Math.floor(window.curMonster.maxHp * 0.15);
    window.curMonster.hp = Math.min(window.curMonster.maxHp, window.curMonster.hp + heal);
    log(`💚 ${window.curMonster.emoji}${window.curMonster.name} 使用 ${s.effect}${s.name} 恢復 ${heal} HP`);
    updateUI(); return;
  }
  let baseDmg = Math.max(1, rand(window.curMonster.atk - 2, window.curMonster.atk + 2));
  let dmg = Math.floor(baseDmg * (s.dmgMod || 1));
  window.hp = Math.max(0, window.hp - dmg);
  log(`💀 ${window.curMonster.emoji}${window.curMonster.name} 發動 ${s.effect}${s.name} 造成 ${dmg} 傷害`);
  if (window.hp <= 0) { window.hp = window.maxHp; window.restUsed = false; window.deathStreak++; log(`💀 復活`); }
  updateUI(); saveLocal();
}
function monsterCounter() {
  if (!window.curMonster) return;
  let d = Math.max(1, rand(window.curMonster.atk - 3, window.curMonster.atk + 2));
  window.hp -= d;
  log(`😈 ${window.curMonster.emoji}${window.curMonster.name} 反擊 ${d}`);
  if (window.hp <= 0) { window.hp = window.maxHp; window.restUsed = false; window.deathStreak++; log(`💀 復活`); }
  else window.deathStreak = 0;
  updateUI(); saveLocal();
  let skillChance = window.curMonster.isBoss ? 0.7 : 0.4;
  if (Math.random() < skillChance) monsterSkillAttack();
}
function defeat() {
  if (!window.curMonster) return;
  window.exp += window.curMonster.exp;
  log(`🎉 擊敗 ${window.curMonster.isBoss ? '👑BOSS ' : ''}+${window.curMonster.exp}EXP`);
  window.totalKills++;
  if (window.lastDmg > window.maxDamage) window.maxDamage = window.lastDmg;
  if (Math.random() < 0.3 || window.curMonster.isBoss) {
    let eq = generateEquipment();
    if (window.curMonster.isBoss) eq.quality = '史詩';
    window.equipment.push(eq);
    toast(`🎁獲得 ${eq.name}+${eq.bonus}`);
    if (!window.equipment.some(e => e.type === eq.type && e.equipped)) { eq.equipped = true; applyEquipBonus(); toast(`✨自動裝備`); }
    saveLocal();
  }
  levelUp(); refreshMonster(); updateUI(); saveLocal(); playDefeatSound();
}
function attack() { initAudio(); playAttackSound(); flashScreen(); shakeScreen();
  if (window.hp <= 0) { log('無法攻擊'); return; }
  let d = Math.max(2, rand(window.atk - 3, window.atk + 5));
  window.lastDmg = d;
  window.curMonster.hp -= d;
  log(`⚔️ ${d}傷`);
  if (window.curMonster.hp <= 0) defeat(); else monsterCounter();
  updateUI(); saveLocal();
}
const skills = [
  { name: '火焰拳', dmg: atk => rand(atk + 8, atk * 2 + 5), effect: '🔥' },
  { name: '水槍', dmg: atk => rand(atk + 5, atk * 2 + 2), effect: '💧' },
  { name: '雷電', dmg: atk => rand(atk + 10, atk * 2 + 8), effect: '⚡' },
  { name: '治癒', heal: 30, effect: '💚' }
];
function showSkillMenu() {
  let ov = document.createElement('div'); ov.className = 'skill-menu-overlay';
  let card = document.createElement('div'); card.className = 'skill-menu-card'; card.innerHTML = '<h3>選擇技能</h3>';
  skills.forEach(s => {
    let btn = document.createElement('button');
    btn.innerText = s.name === '治癒' ? `${s.name} (恢復${s.heal}HP)` : s.name;
    btn.onclick = () => {
      document.body.removeChild(ov);
      if (window.hp <= 0) { log('無法施放'); return; }
      if (s.name === '治癒') {
        window.hp = Math.min(window.maxHp, window.hp + s.heal);
        log(`✨恢復${s.heal}HP`);
        updateUI(); saveLocal();
      } else {
        let dmg = s.dmg(window.atk);
        window.lastDmg = dmg;
        window.curMonster.hp -= dmg;
        log(`✨${s.effect} ${dmg}傷`);
        if (window.curMonster.hp <= 0) defeat(); else monsterCounter();
        updateUI(); saveLocal();
      }
      playSkillSound(); flashScreen(); shakeScreen();
    };
    card.appendChild(btn);
  });
  let cancel = document.createElement('button'); cancel.innerText = '取消'; cancel.onclick = () => document.body.removeChild(ov);
  card.appendChild(cancel); ov.appendChild(card); document.body.appendChild(ov);
}
function rest() { initAudio();
  if (window.restUsed) { log('已休息過'); return; }
  if (window.hp <= 0) { log('無法休息'); return; }
  window.hp = Math.min(window.maxHp, window.hp + 30);
  window.restUsed = true;
  log(`😴恢復30HP`);
  let sneak = Math.max(1, rand(window.curMonster.atk - 2, window.curMonster.atk + 1));
  window.hp = Math.max(0, window.hp - sneak);
  log(`⚠️偷襲-${sneak}`);
  if (window.hp <= 0) { window.hp = window.maxHp; window.restUsed = false; log('💀復活'); }
  updateUI(); saveLocal(); playHurtSound();
}
document.getElementById('toGameBtn').onclick = () => showPage('gamePage');
document.getElementById('toSettingsBtn').onclick = () => showPage('settingsPage');
document.getElementById('shopBtn').onclick = () => showPage('shopPage');
document.getElementById('helpBtn').onclick = () => showPage('helpPage');
document.getElementById('backFromSettings').onclick = () => showPage('mainPage');
document.getElementById('backFromShop').onclick = () => showPage('mainPage');
document.getElementById('backFromHelp').onclick = () => showPage('mainPage');
document.getElementById('backFromGame').onclick = () => showPage('mainPage');
document.getElementById('attackBtn').onclick = attack;
document.getElementById('skillBtn').onclick = showSkillMenu;
document.getElementById('restBtn').onclick = rest;
document.getElementById('inventoryBtn').onclick = showBackpack;
document.getElementById('saveBtn').onclick = saveLocal;
