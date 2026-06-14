function checkDaily() { let last = localStorage.getItem('lastRewardDate'); return last !== new Date().toDateString(); }
function claimDaily() {
  if (!checkDaily()) { toast('今天已領過'); return false; }
  let r = rand(1, 3);
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
  localStorage.setItem('lastRewardDate', new Date().toDateString());
  saveLocal();
  return true;
}
