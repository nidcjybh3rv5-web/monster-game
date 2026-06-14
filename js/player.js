window.hp = 100; window.maxHp = 100; window.exp = 0; window.lv = 1; window.atk = 10;
window.restUsed = false; window.baseAtk = 10; window.baseHp = 100;
window.totalKills = 0; window.maxDamage = 0; window.maxLevel = 1;
window.deathStreak = 0; window.lastDmg = 0;

function levelUp() {
  let up = false;
  while (window.exp >= 50) {
    window.exp -= 50; window.lv++; window.baseHp += 20; window.baseAtk += 5;
    let bonus = calcEquipBonus(window.equipment);
    window.hp = Math.floor((window.baseHp + bonus.hp) * 0.7);
    up = true;
    log(`🎉 升級 Lv${window.lv} 攻${window.baseAtk + bonus.atk}`);
    if (window.lv > window.maxLevel) window.maxLevel = window.lv;
    playLevelUpSound();
  }
  if (up) refreshMonster();
  applyEquipBonus(); saveLocal();
}
