// ============================================================
//  ⚔️ Battle System - Core Combat Logic
// ============================================================

import { toast, log, rand, dmgFloat, sanitizeInput } from './utils.js';
import { addGold, saveGame } from './save.js';
import { genEq, applyEq, eqBonus } from './inventory.js';
import { checkAchievements, updateSeasonProgress } from './achievement.js';
import { SFX } from './utils.js';

// Game state reference
const G = window.G;

// ============================================================
//  🎲 Monster Generation
// ============================================================

const ZONES = [
  {
    id: 'beginner',
    name: '🌳新手村',
    maxLevel: 30,
    monsters: ['🟣史萊姆', '🟢哥布林', '🐺森林狼', '🦇蝙蝠', '🌿樹精']
  },
  {
    id: 'desert',
    name: '🏜️沙漠',
    maxLevel: 90,
    monsters: ['🦂巨蠍', '🧻木乃伊', '🐍沙蛇', '🦅沙鷹']
  },
  {
    id: 'sky',
    name: '🐉天空城',
    maxLevel: 100,
    monsters: ['🐉飛龍', '😇天使', '😈魔神']
  }
];

const BOSS = [
  '新手守護者', '沙暴領主', '蒼穹巨龍', '深淵魔王',
  '永凍冰凰', '雷霆泰坦', '暗影幽靈', '黃金獅鷲',
  '時間守護者', '終焉之神'
];

const ELEMS = ['火', '水', '草', '光', '暗'];
const WEAK = { '火': '草', '水': '火', '草': '水', '光': '暗', '暗': '光' };

function getZone() {
  if (G.lv <= 30) return ZONES[0];
  if (G.lv <= 90) return ZONES[1];
  return ZONES[2];
}

function isBoss(level) {
  return level % 10 === 0;
}

function randElem() {
  return ELEMS[rand(0, ELEMS.length - 1)];
}

function elemBonus(attackElem, defenseElem) {
  if (!attackElem || attackElem === '無') return 1;
  if (WEAK[attackElem] === defenseElem) return 1.3;
  if (WEAK[defenseElem] === attackElem) return 0.7;
  return 1;
}

function getMult() {
  const multipliers = {
    easy: { hp: 0.7, atk: 0.7, exp: 1.1, offset: -2 },
    normal: { hp: 1.0, atk: 1.0, exp: 1.0, offset: 0 },
    hard: { hp: 1.5, atk: 1.3, exp: 0.85, offset: 3 },
    extreme: { hp: 2.0, atk: 1.6, exp: 0.7, offset: 6 }
  };
  return multipliers[G.difficulty] || multipliers.normal;
}

function genMonster() {
  const b = isBoss(G.lv);
  let emoji, name, element = randElem();
  
  if (b) {
    emoji = '👑';
    name = BOSS[Math.floor((G.lv - 1) / 10)] || '上古Boss';
  } else {
    const z = getZone();
    const raw = z.monsters[rand(0, z.monsters.length - 1)];
    emoji = raw[0];
    name = raw.slice(1);
  }
  
  const m = getMult();
  let offset = m.offset;
  
  if (G.deathStreak >= 3 && G.difficulty !== 'easy') {
    offset = Math.max(-5, offset - Math.floor(G.deathStreak / 2));
  }
  
  let level = Math.max(1, G.lv + offset);
  if (b) level = G.lv + 2;
  
  const baseHp = (30 + level * 2.5) * m.hp;
  const baseAtk = (5 + Math.floor(level / 2.5)) * m.atk;
  
  let hp = baseHp;
  let atk = baseAtk;
  
  if (b) {
    hp *= 2;
    atk *= 1.5;
  }
  
  const varify = v => Math.floor(v * (0.6 + Math.random() * 0.8));
  let exp = Math.max(1, Math.floor((12 + level * 0.8) * m.exp));
  if (b) exp *= 3;
  
  return {
    emoji,
    name,
    level,
    hp: varify(hp),
    maxHp: varify(hp),
    atk: varify(atk),
    exp,
    isBoss: b,
    element
  };
}

function refreshMonster() {
  G.curMonster = genMonster();
  G.restUsed = false;
  updateUI();
  log(`✨ ${G.curMonster.isBoss ? '👑BOSS ' : ''}${G.curMonster.emoji}${G.curMonster.name} Lv.${G.curMonster.level} HP${G.curMonster.hp}`);
}

// ============================================================
//  ⬆️ Level & Experience
// ============================================================

function levelUp() {
  let leveledUp = false;
  while (G.exp >= 50) {
    G.exp -= 50;
    G.level++;
    G.baseHp += 20;
    G.baseAtk += 5;
    const bonus = eqBonus();
    G.maxHp = Math.floor(G.baseHp + bonus.hp);
    G.hp = G.maxHp;
    leveledUp = true;
    log(t('toast_levelup', { level: G.level }));
    
    if (G.level > (G.maxLevel || 0)) {
      G.maxLevel = G.level;
      checkAchievements();
    }
  }
  
  if (leveledUp) {
    SFX.levelup();
    applyEq();
    refreshMonster();
  }
  
  saveGame();
}

// ============================================================
//  💥 Combat Actions
// ============================================================

function playerElem() {
  const weapon = G.equipment.find(e => e.type === 'weapon' && e.equipped);
  return weapon?.element || '無';
}

function guildBuff() {
  return G.guild?.name ? 1 + G.guild.level * 0.02 : 1;
}

function monsterCounter() {
  if (!G.curMonster) return;
  const damage = rand(G.curMonster.atk - 3, G.curMonster.atk + 2);
  G.hp -= damage;
  SFX.hurt();
  log(`😈 反擊 ${damage}`);
  
  if (G.hp <= 0) {
    G.hp = G.maxHp;
    G.restUsed = false;
    G.deathStreak++;
    log(t('toast_revive'));
  } else {
    G.deathStreak = 0;
  }
  
  updateUI();
  saveGame();
}

function defeatMonster() {
  if (!G.curMonster) return;
  
  G.exp += G.curMonster.exp;
  const gold = rand(10, G.curMonster.isBoss ? 100 : 30);
  addGold(gold);
  SFX.defeat();
  
  log(t('toast_defeat', { exp: G.curMonster.exp, gold }));
  G.totalKills = (G.totalKills || 0) + 1;
  
  if (G.lastDmg > (G.maxDamage || 0)) {
    G.maxDamage = G.lastDmg;
  }
  
  if (G.curMonster.isBoss) {
    G.stats.bossKills = (G.stats.bossKills || 0) + 1;
    updateSeasonProgress('boss');
  }
  
  // Drop equipment
  if (Math.random() < 0.3 || G.curMonster.isBoss) {
    const eq = genEq();
    if (G.curMonster.isBoss) eq.quality = '史詩';
    G.equipment.push(eq);
    G.stats.totalEquip = (G.stats.totalEquip || 0) + 1;
    SFX.equip();
    toast(t('toast_buy_equip', { name: eq.name }), false);
  }
  
  levelUp();
  refreshMonster();
  updateUI();
  saveGame();
  checkAchievements();
}

function attack() {
  if (G.hp <= 0) {
    log(t('toast_cannot_attack'));
    return;
  }
  
  if (!G.curMonster) refreshMonster();
  
  const base = rand(G.atk - 3, G.atk + 5);
  const elemBonus = elemBonus(playerElem(), G.curMonster.element);
  const damage = Math.floor(base * elemBonus);
  
  G.lastDmg = damage;
  G.curMonster.hp -= damage;
  SFX.attack();
  
  const btn = document.getElementById('attackBtn');
  if (btn) {
    const rect = btn.getBoundingClientRect();
    dmgFloat(rect.left + 20, rect.top - 20, '-' + damage, damage > 20 ? '#ff6b6b' : '#ffd93d');
  }
  
  log(t('toast_damage', { dmg: damage }) + (elemBonus > 1 ? ' 克制!' : ''));
  
  // Track element usage
  if (playerElem() !== '無') {
    let used = JSON.parse(localStorage.getItem('elements_used') || '[]');
    if (!used.includes(playerElem())) {
      used.push(playerElem());
      localStorage.setItem('elements_used', JSON.stringify(used));
    }
  }
  
  updateSeasonProgress('attack');
  
  if (G.curMonster.hp <= 0) {
    defeatMonster();
  } else {
    monsterCounter();
  }
  
  updateUI();
  saveGame();
  
  // Flash effect on critical hit
  if (damage > G.atk * 1.5) {
    document.body.classList.add('flash');
    setTimeout(() => document.body.classList.remove('flash'), 200);
  }
}

function rest() {
  if (G.restUsed) {
    log(t('toast_rested'));
    return;
  }
  
  if (G.hp <= 0) {
    log(t('toast_cannot_rest'));
    return;
  }
  
  if (!G.curMonster) {
    log(t('toast_no_monster'));
    return;
  }
  
  G.hp = Math.min(G.maxHp, G.hp + 30);
  G.restUsed = true;
  log(t('toast_heal', { hp: 30 }));
  
  const sneak = rand(G.curMonster.atk - 2, G.curMonster.atk + 1);
  G.hp = Math.max(0, G.hp - sneak);
  
  if (sneak > 0) SFX.hurt();
  log(`⚠️偷襲-${sneak}`);
  
  if (G.hp <= 0) {
    G.hp = G.maxHp;
    G.restUsed = false;
    SFX.hurt();
    log(t('toast_revive'));
  }
  
  updateUI();
  saveGame();
}

function showSkill() {
  const overlay = document.createElement('div');
  overlay.className = 'skill-menu-overlay';
  
  const card = document.createElement('div');
  card.className = 'skill-menu-card';
  card.innerHTML = '<h3>選技能</h3>';
  
  const skills = [
    { name: '火焰拳', damage: a => rand(a + 8, a * 2 + 5), emoji: '🔥' },
    { name: '水槍', damage: a => rand(a + 5, a * 2 + 2), emoji: '💧' },
    { name: '雷電', damage: a => rand(a + 10, a * 2 + 8), emoji: '⚡' },
    { name: '治癒', heal: 30, emoji: '💚' }
  ];
  
  skills.forEach(skill => {
    const btn = document.createElement('button');
    btn.textContent = skill.name === '治癒' ? `${skill.name} (+${skill.heal}HP)` : skill.name;
    btn.onclick = () => {
      document.body.removeChild(overlay);
      if (G.hp <= 0) {
        log(t('toast_cannot_attack'));
      } else if (!G.curMonster) {
        log(t('toast_skill_no_monster'));
      } else if (skill.heal) {
        G.hp = Math.min(G.maxHp, G.hp + skill.heal);
        log(t('toast_heal', { hp: skill.heal }));
        SFX.skill();
      } else {
        const dmg = Math.floor(skill.damage(G.atk));
        G.curMonster.hp -= dmg;
        log(t('toast_damage', { dmg }));
        SFX.skill();
        if (G.curMonster.hp <= 0) defeatMonster();
        else monsterCounter();
      }
      updateUI();
      saveGame();
    };
    card.appendChild(btn);
  });
  
  const closeBtn = document.createElement('button');
  closeBtn.textContent = t('close');
  closeBtn.onclick = () => document.body.removeChild(overlay);
  card.appendChild(closeBtn);
  
  overlay.appendChild(card);
  document.body.appendChild(overlay);
}

// ============================================================
//  🤖 Auto Battle
// ============================================================

let autoTimer = null;

function toggleAuto() {
  G.autoBattle = !G.autoBattle;
  const btn = document.getElementById('autoBattleBtn');
  if (btn) btn.textContent = G.autoBattle ? '🤖 ON' : '🤖 OFF';
  
  if (G.autoBattle) {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = setInterval(() => {
      if (G.autoBattle && document.getElementById('gamePage').classList.contains('active')) {
        attack();
      }
    }, 1200);
  } else {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }
}

// ============================================================
//  🎬 Battle Initialization
// ============================================================

function initBattle() {
  if (!G.curMonster) {
    refreshMonster();
  }
  updateUI();
  
  // Attach event listeners
  document.getElementById('attackBtn')?.addEventListener('click', attack);
  document.getElementById('skillBtn')?.addEventListener('click', showSkill);
  document.getElementById('restBtn')?.addEventListener('click', rest);
  document.getElementById('autoBattleBtn')?.addEventListener('click', toggleAuto);
}

// ============================================================
//  📤 Exports
// ============================================================

export {
  attack,
  rest,
  showSkill,
  toggleAuto,
  refreshMonster,
  levelUp,
  defeatMonster,
  playerElem,
  elemBonus,
  isBoss,
  initBattle,
  ZONES,
  BOSS,
  ELEMS
};
