const QUALITY = [
  { name: '普通', color: '#9ca3af', min: 1, max: 3, rate: 0.5 },
  { name: '優秀', color: '#4ade80', min: 4, max: 6, rate: 0.3 },
  { name: '稀有', color: '#3b82f6', min: 7, max: 10, rate: 0.15 },
  { name: '史詩', color: '#a855f7', min: 11, max: 15, rate: 0.05 }
];
function randomQuality() { let r = Math.random(), a = 0; for (let q of QUALITY) if ((a += q.rate) > r) return q; return QUALITY[0]; }
function generateEquipment() { let t = rand(0, 1) ? 'weapon' : 'armor'; let q = randomQuality(); let b = rand(q.min, q.max); return { id: Date.now() + '-' + Math.random(), type: t, quality: q.name, color: q.color, bonus: b, name: `${q.name} ${t === 'weapon' ? '武器' : '防具'}`, equipped: false }; }
function calcEquipBonus(equip) { let a = 0, h = 0; equip.forEach(e => { if (e.equipped) e.type === 'weapon' ? a += e.bonus : h += e.bonus; }); return { atk: a, hp: h }; }
function setBonus(equip) { let w = equip.filter(e => e.type === 'weapon' && e.equipped).length; let a = equip.filter(e => e.type === 'armor' && e.equipped).length; return { atk: w >= 2 ? 0.05 : 0, hp: a >= 2 ? 0.05 : 0 }; }
function applyEquipBonus() { let b = calcEquipBonus(window.equipment); let s = setBonus(window.equipment); window.atk = Math.floor(window.baseAtk + b.atk * (1 + s.atk)); window.maxHp = Math.floor(window.baseHp + b.hp * (1 + s.hp)); if (window.hp > window.maxHp) window.hp = window.maxHp; updateUI(); }
function showBackpack() {
  let ov = document.createElement('div'); ov.className = 'backpack-overlay';
  let card = document.createElement('div'); card.className = 'backpack-card'; card.innerHTML = '<h3>🎒 裝備背包</h3>';
  if (window.equipment.length === 0) card.innerHTML += '<p>尚無裝備</p>';
  else window.equipment.forEach(eq => {
    let div = document.createElement('div'); div.className = 'backpack-item'; div.style.borderLeftColor = eq.color;
    div.innerHTML = `<span style="color:${eq.color}">${eq.name} +${eq.bonus}</span><button data-id="${eq.id}">${eq.equipped ? '卸下' : '裝備'}</button>`;
    div.querySelector('button').onclick = () => { window.toggleEquip(eq.id); ov.remove(); showBackpack(); };
    card.appendChild(div);
  });
  let close = document.createElement('button'); close.innerText = '關閉'; close.className = 'close-backpack'; close.onclick = () => ov.remove();
  card.appendChild(close); ov.appendChild(card); document.body.appendChild(ov);
}
window.toggleEquip = (id) => {
  let item = window.equipment.find(e => e.id == id);
  if (!item) return;
  if (item.equipped) { item.equipped = false; toast(`已卸下 ${item.name}`); }
  else { let same = window.equipment.find(e => e.type === item.type && e.equipped); if (same) same.equipped = false; item.equipped = true; toast(`已裝備 ${item.name}`); }
  applyEquipBonus(); saveLocal(); showBackpack();
};
