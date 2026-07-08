// ============================================================
//  🎒 Inventory System - Equipment, Items, Upgrades
// ============================================================

import { toast, rand } from './utils.js';
import { saveGame } from './save.js';

const G = window.G;

// ============================================================
//  📊 Equipment Quality System
// ============================================================

const QUALITIES = [
  { name: '普通', color: '#9ca3af', bonusMin: 1, bonusMax: 3, rarity: 0.5 },
  { name: '優秀', color: '#4ade80', bonusMin: 4, bonusMax: 6, rarity: 0.3 },
  { name: '稀有', color: '#3b82f6', bonusMin: 7, bonusMax: 10, rarity: 0.15 },
  { name: '史詩', color: '#a855f7', bonusMin: 11, bonusMax: 15, rarity: 0.05 }
];

function randQuality() {
  let roll = Math.random(), accumulated = 0;
  for (let q of QUALITIES) {
    if ((accumulated += q.rarity) > roll) return q;
  }
  return QUALITIES[0];
}

// ============================================================
//  🎁 Generate Equipment
// ============================================================

function genEq() {
  const type = rand(0, 1) ? 'weapon' : 'armor';
  const quality = randQuality();
  const bonus = rand(quality.bonusMin, quality.bonusMax);
  const element = Math.random() < 0.3 ? randElem() : '無';
  
  return {
    id: Date.now() + '-' + Math.random(),
    type,
    quality: quality.name,
    color: quality.color,
    bonus,
    element,
    level: 0,
    equipped: false,
    name: `${quality.name}${type === 'weapon' ? '劍' : '甲'}`,
    description: `+${bonus}攻擊` + (element !== '無' ? ` (${element})` : '')
  };
}

// ============================================================
//  ⚙️ Equipment Calculations
// ============================================================

function eqBonus() {
  let attackBonus = 0, hpBonus = 0;
  G.equipment.forEach(e => {
    if (e.equipped) {
      if (e.type === 'weapon') attackBonus += e.bonus;
      else hpBonus += e.bonus;
    }
  });
  return { atk: attackBonus, hp: hpBonus };
}

function applyEq() {
  const bonus = eqBonus();
  const rebirthBonus = 1 + G.rebirthLevel * 0.05;
  const guildBonus = 1 + (G.guild?.level || 0) * 0.02;
  
  G.atk = Math.floor((G.baseAtk + bonus.atk) * rebirthBonus * guildBonus);
  G.maxHp = Math.floor((G.baseHp + bonus.hp) * rebirthBonus);
  
  if (G.hp > G.maxHp) G.hp = G.maxHp;
  
  updateUI();
}

// ============================================================
//  🔧 Equipment Management
// ============================================================

function upgradeEq(id) {
  const item = G.equipment.find(e => e.id === id);
  if (!item) return;
  
  const cost = 50 * ((item.level || 0) + 1);
  if (G.gold < cost) {
    toast(t('toast_not_enough_gold'), true);
    return;
  }
  
  G.gold -= cost;
  item.level = (item.level || 0) + 1;
  item.bonus += 2;
  G.stats.totalUpgrade = (G.stats.totalUpgrade || 0) + 1;
  
  SFX.equip();
  toast(t('toast_upgrade', { name: item.name, level: item.level }), false);
  applyEq();
  saveGame();
}

function toggleEq(id) {
  const item = G.equipment.find(e => e.id === id);
  if (!item) return;
  
  if (item.equipped) {
    item.equipped = false;
    toast(t('toast_unequip', { name: item.name }), false);
  } else {
    const sameType = G.equipment.find(e => e.type === item.type && e.equipped && e.id !== id);
    if (sameType) sameType.equipped = false;
    item.equipped = true;
    toast(t('toast_equip', { name: item.name }), false);
  }
  
  applyEq();
  saveGame();
}

function decomposeEq(quality = '普通') {
  const qualities = ['普通', '優秀', '稀有', '史詩'];
  const idx = qualities.indexOf(quality);
  let total = 0;
  
  G.equipment = G.equipment.filter(e => {
    if (qualities.indexOf(e.quality) <= idx && !e.equipped) {
      total += Math.floor(e.bonus * 10);
      return false;
    }
    return true;
  });
  
  if (total > 0) {
    G.gold += total;
    toast(t('toast_decompose', { gold: total }), false);
    applyEq();
    saveGame();
  } else {
    toast(t('toast_no_decompose'), true);
  }
}

// ============================================================
//  🎒 Backpack UI
// ============================================================

function closeBag() {
  const overlay = document.querySelector('.backpack-overlay');
  if (overlay) overlay.remove();
}

function showBag() {
  closeBag();
  
  const overlay = document.createElement('div');
  overlay.className = 'backpack-overlay';
  
  const card = document.createElement('div');
  card.className = 'backpack-card';
  card.innerHTML = '<h3>🎒 ' + t('inventory') + '</h3>';
  
  const decomDiv = document.createElement('div');
  decomDiv.style.display = 'flex';
  decomDiv.style.justifyContent = 'space-between';
  decomDiv.style.marginBottom = '12px';
  
  const select = document.createElement('select');
  select.innerHTML = `
    <option value="普通">普通及以下</option>
    <option value="優秀">優秀及以下</option>
    <option value="稀有">稀有及以下</option>
  `;
  
  const btn = document.createElement('button');
  btn.textContent = t('decompose');
  btn.style.background = '#ef4444';
  btn.style.border = 'none';
  btn.style.padding = '4px 12px';
  btn.style.borderRadius = '20px';
  btn.style.cursor = 'pointer';
  btn.onclick = () => decomposeEq(select.value);
  
  decomDiv.appendChild(select);
  decomDiv.appendChild(btn);
  card.appendChild(decomDiv);
  
  if (!G.equipment.length) {
    card.innerHTML += '<p>無裝備</p>';
  } else {
    G.equipment.forEach(e => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'backpack-item';
      itemDiv.style.borderLeftColor = e.color;
      itemDiv.innerHTML = `
        <span style="color:${e.color}">${e.name}+${e.bonus} (${e.element}) +${e.level || 0}</span>
        <div>
          <button class="eqBtn" style="font-size:0.7rem;">${e.equipped ? '卸下' : '裝'}</button>
          <button class="upBtn" style="font-size:0.7rem;">強化</button>
        </div>
      `;
      
      itemDiv.querySelector('.eqBtn').onclick = () => {
        toggleEq(e.id);
        showBag();
      };
      
      itemDiv.querySelector('.upBtn').onclick = () => {
        upgradeEq(e.id);
        showBag();
      };
      
      card.appendChild(itemDiv);
    });
  }
  
  const closeBtn = document.createElement('button');
  closeBtn.textContent = t('close');
  closeBtn.className = 'close-backpack';
  closeBtn.onclick = closeBag;
  card.appendChild(closeBtn);
  
  overlay.appendChild(card);
  document.body.appendChild(overlay);
}

// ============================================================
//  🛒 Shop System
// ============================================================

function renderShop() {
  const container = document.getElementById('shopItemsList');
  if (!container) return;
  
  container.innerHTML = `
    <div class="setting-item"><div>🎁 裝備箱</div><button id="buyEq">100💰</button></div>
    <div class="setting-item"><div>🧪 經驗藥水 (+30EXP)</div><button id="buyExp">150💰</button></div>
    <div class="setting-item"><div>💊 復活石</div><button id="buyRev">200💰</button></div>
    <div class="setting-item"><div>🐕 寵物 (攻擊+5%)</div><button id="buyPet">300💰</button></div>
  `;
  
  document.getElementById('buyEq')?.addEventListener('click', () => {
    if (G.gold >= 100) {
      G.gold -= 100;
      const eq = genEq();
      G.equipment.push(eq);
      G.stats.totalEquip = (G.stats.totalEquip || 0) + 1;
      SFX.equip();
      toast(t('toast_buy_equip', { name: eq.name }), false);
      applyEq();
      updateGold();
      saveGame();
    } else {
      toast(t('toast_not_enough_gold'), true);
    }
  });
  
  document.getElementById('buyExp')?.addEventListener('click', () => {
    if (G.gold >= 150) {
      G.gold -= 150;
      G.exp += 30;
      SFX.skill();
      toast(t('toast_buy_exp'), false);
      levelUp();
      updateGold();
      saveGame();
    } else {
      toast(t('toast_not_enough_gold'), true);
    }
  });
  
  document.getElementById('buyRev')?.addEventListener('click', () => {
    if (G.gold >= 200) {
      G.gold -= 200;
      localStorage.setItem('revive', 'true');
      SFX.equip();
      toast(t('toast_buy_revive'), false);
      updateGold();
      saveGame();
    } else {
      toast(t('toast_not_enough_gold'), true);
    }
  });
  
  document.getElementById('buyPet')?.addEventListener('click', () => {
    if (G.gold >= 300) {
      G.gold -= 300;
      localStorage.setItem('pet', 'true');
      SFX.levelup();
      toast(t('toast_buy_pet'), false);
      G.baseAtk = Math.floor(G.baseAtk * 1.05);
      applyEq();
      updateGold();
      saveGame();
    } else {
      toast(t('toast_not_enough_gold'), true);
    }
  });
}

// ============================================================
//  📤 Exports
// ============================================================

export {
  genEq,
  eqBonus,
  applyEq,
  upgradeEq,
  toggleEq,
  decomposeEq,
  showBag,
  closeBag,
  renderShop,
  QUALITIES
};
