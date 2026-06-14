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
  let baseHp = (30 + mlv * 2.5) * m.hp, baseAtk = (5 + Math.floor(mlv / 2.5)) * m.atk;
  if (isBossNow) { baseHp *= 2; baseAtk *= 1.5; }
  let varf = v => Math.floor(v * (0.6 + Math.random() * 0.8));
  let expGain = Math.max(1, Math.floor((12 + mlv * 0.8) * m.exp));
  if (isBossNow) expGain *= 3;
  return { emoji, name, mlv, hp: varf(baseHp), maxHp: varf(baseHp), atk: varf(baseAtk), exp: expGain, skill, isBoss: isBossNow };
}
function refreshMonster() { window.curMonster = genMonster(); window.restUsed = false; updateUI(); log(`✨ ${window.curMonster.isBoss ? '👑BOSS ' : ''}${window.curMonster.emoji}${window.curMonster.name} Lv.${window.curMonster.mlv} | HP${window.curMonster.hp} 攻${window.curMonster.atk}`); if (window.curMonster.isBoss) playBossSound(); }
