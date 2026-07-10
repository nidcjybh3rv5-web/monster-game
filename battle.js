let ZONES=GAME_DATA.monsters;
let SKILLS=GAME_DATA.skills;
function isBoss(l){ return l%10===0; }
let BOSS=GAME_DATA.bosses;
function getZone(){ return G.lv<=30?ZONES[0]:G.lv<=90?ZONES[1]:ZONES[2]; }
function getMult(){ switch(G.difficulty){ case 'easy':return {hp:.7,atk:.7,exp:1.1,off:-2}; case 'hard':return {hp:1.5,atk:1.3,exp:.85,off:3}; case 'extreme':return {hp:2.0,atk:1.6,exp:.7,off:6}; default:return {hp:1,atk:1,exp:1,off:0}; } }
function genMonster(){
  const b=isBoss(G.lv); let emoji,name,skill,elem=randElem();
  if(b){ emoji="👑"; name=BOSS[Math.floor((G.lv-1)/10)]||"上古Boss"; skill=SKILLS[rand(0,SKILLS.length-1)]; }
  else { const z=getZone(), raw=z.m[rand(0,z.m.length-1)]; emoji=raw[0]; name=raw.slice(1); skill=SKILLS[rand(0,SKILLS.length-1)]; }
  const m=getMult(); let off=m.off;
  if(G.deathStreak>=3&&G.difficulty!=='easy')off=Math.max(-5, off-Math.floor(G.deathStreak/2));
  let lv=Math.max(1, G.lv+off); if(b)lv=G.lv+2;
  let hp=(30+lv*2.5)*m.hp, atk=(5+Math.floor(lv/2.5))*m.atk; if(b){ hp*=2; atk*=1.5; }
  const vf=v=>Math.floor(v*(.6+Math.random()*.8)); let exp=Math.max(1,Math.floor((12+lv*.8)*m.exp)); if(b)exp*=3;
  return {emoji,name,lv,hp:vf(hp),maxHp:vf(hp),atk:vf(atk),exp,skill,isBoss:b,element:elem};
}
function refreshMonster(){ G.curMonster=genMonster(); G.restUsed=false; updateUI(); log(`✨ ${G.curMonster.isBoss?'👑BOSS ':''}${G.curMonster.emoji}${G.curMonster.name} Lv.${G.curMonster.lv} HP${G.curMonster.hp} ${G.curMonster.element}`); if(G.curMonster.isBoss)SFX.boss(); }
function levelUp(){
  let up=false;
  while(G.exp>=50){ G.exp-=50; G.lv++; G.baseHp+=20; G.baseAtk+=5; const b=eqBonus(); G.maxHp=Math.floor(G.baseHp+b.hp); G.hp=G.maxHp; up=true; log(t('toast_levelup',{level:G.lv})); if(G.lv>G.maxLevel)G.maxLevel=G.lv; }
  if(up){ SFX.levelup(); applyEq(); refreshMonster(); }
  saveGame();
}
function monsterCounter(){
  if(!G.curMonster)return; const d=rand(G.curMonster.atk-3,G.curMonster.atk+2); G.hp-=d; SFX.hurt(); log(`😈 反擊 ${d}`);
  if(G.hp<=0){ G.hp=G.maxHp; G.restUsed=false; G.deathStreak++; log(t('toast_revive')); } else G.deathStreak=0;
  updateUI(); saveGame();
}
function defeatMonster(){
  if(!G.curMonster)return;
  G.exp+=G.curMonster.exp; const g=rand(10,G.curMonster.isBoss?100:30); addGold(g); SFX.defeat();
  log(t('toast_defeat',{exp:G.curMonster.exp,gold:g})); G.totalKills++;
  if(G.lastDmg>G.maxDamage)G.maxDamage=G.lastDmg;
  if(G.curMonster.isBoss){ G.stats.bossKills=(G.stats.bossKills||0)+1; updateSeasonProgress('boss'); }
  if(Math.random()<.3||G.curMonster.isBoss){ const e=genEq(); if(G.curMonster.isBoss)e.quality='史詩'; G.equipment.push(e); G.stats.totalEquip++; SFX.equip(); toast(t('toast_buy_equip',{name:e.name}),false); if(!G.equipment.some(x=>x.type===e.type&&x.equipped)){ e.equipped=true; applyEq(); toast(t('toast_equip_auto'),false); } updateSeasonProgress('equip'); }
  levelUp(); refreshMonster(); updateUI(); saveGame(); checkAchievements();
}
function attack(){
  if(G.hp<=0){ log(t('toast_cannot_attack')); return; }
  if(!G.curMonster)refreshMonster();
  const base=rand(G.atk-3,G.atk+5); const eb=elemBonus(playerElem(), G.curMonster.element); const d=Math.floor(base*eb);
  G.lastDmg=d; G.curMonster.hp-=d; SFX.attack();
  const rect=document.getElementById('attackBtn').getBoundingClientRect();
  dmgFloat(rect.left+20, rect.top-20, '-'+d, d>20?'#ff6b6b':'#ffd93d');
  log(t('toast_damage',{dmg:d})+(eb>1?' 克制!':''));
  if(playerElem()!=='無'){ let used=JSON.parse(localStorage.getItem('elements_used')||'[]'); if(!used.includes(playerElem())){ used.push(playerElem()); localStorage.setItem('elements_used',JSON.stringify(used)); } }
  updateSeasonProgress('attack');
  if(G.curMonster.hp<=0)defeatMonster(); else monsterCounter();
  updateUI(); saveGame();
  if(d>G.atk*1.5){ document.body.classList.add('flash'); setTimeout(()=>document.body.classList.remove('flash'),200); }
}
function showSkill(){
  const ov=document.createElement('div'); ov.className='skill-menu-overlay';
  const cd=document.createElement('div'); cd.className='skill-menu-card'; cd.innerHTML='<h3>選技能</h3>';
  const list=[{n:'火焰拳', d:a=>rand(a+8,a*2+5), e:'🔥'},{n:'水槍', d:a=>rand(a+5,a*2+2), e:'💧'},{n:'雷電', d:a=>rand(a+10,a*2+8), e:'⚡'},{n:'治癒', h:30, e:'💚'}];
  list.forEach(s=>{ const b=document.createElement('button'); b.textContent=s.n==='治癒'?`${s.n} (+${s.h}HP)`:s.n; b.onclick=()=>{ document.body.removeChild(ov); if(G.hp<=0){ log(t('toast_cannot_attack')); return; } if(s.n==='治癒'){ G.hp=Math.min(G.maxHp,G.hp+s.h); log(t('toast_heal',{hp:s.h})); updateUI(); saveGame(); SFX.skill(); } else { if(!G.curMonster){ log(t('toast_no_monster')); return; } let d=s.d(G.atk); const eb=elemBonus(playerElem(), G.curMonster.element); d=Math.floor(d*eb); G.lastDmg=d; G.curMonster.hp-=d; G.stats.skillUsage++; SFX.skill(); log(`✨${s.e} ${d}傷`); if(G.curMonster.hp<=0)defeatMonster(); else monsterCounter(); updateUI(); saveGame(); checkAchievements(); } }; cd.appendChild(b); });
  const c=document.createElement('button'); c.textContent=t('close'); c.onclick=()=>document.body.removeChild(ov); cd.appendChild(c); ov.appendChild(cd); document.body.appendChild(ov);
}
function rest(){
  if(G.restUsed){ log(t('toast_rested')); return; }
  if(G.hp<=0){ log(t('toast_cannot_rest')); return; }
  if(!G.curMonster){ log(t('toast_no_monster')); return; }
  G.hp=Math.min(G.maxHp,G.hp+30); G.restUsed=true;
  log(t('toast_heal',{hp:30}));
  const s=rand(G.curMonster.atk-2,G.curMonster.atk+1); G.hp=Math.max(0,G.hp-s); if(s>0)SFX.hurt();
  log(`⚠️偷襲-${s}`);
  if(G.hp<=0){ G.hp=G.maxHp; G.restUsed=false; SFX.hurt(); log(t('toast_revive')); }
  updateUI(); saveGame();
}
function updateUI(){
  document.getElementById('hpText').textContent=`${G.hp}/${G.maxHp}`;
  document.getElementById('expText').textContent=`${G.exp}/50`;
  document.getElementById('levelText').textContent=G.lv;
  document.getElementById('atkText').textContent=G.atk;
  document.getElementById('zoneText').textContent=getZone().n;
  document.getElementById('playerElem').textContent=playerElem();
  document.getElementById('rebirthLevel').textContent=G.rebirthLevel;
  if(G.curMonster){
    document.getElementById('monsterName').innerHTML=`${G.curMonster.emoji}${G.curMonster.name}`;
    document.getElementById('monsterEmoji').textContent=G.curMonster.emoji;
    document.getElementById('monsterHpText').textContent=`${G.curMonster.hp}/${G.curMonster.maxHp}`;
    document.getElementById('monsterLevelText').textContent=G.curMonster.lv;
    document.getElementById('monsterElem').textContent=G.curMonster.element;
    document.getElementById('monsterBar').style.width=`${(G.curMonster.hp/G.curMonster.maxHp)*100}%`;
  }
  document.getElementById('hpBar').style.width=`${(G.hp/G.maxHp)*100}%`;
  document.getElementById('expBar').style.width=`${(G.exp/50)*100}%`;
  document.getElementById('restBtn').disabled=G.restUsed;
  updateGold();
}
function log(m){ const el=document.getElementById('logMsg'); if(el) el.textContent=m; }

// ============================================================
//  🤖 自動戰鬥
// ============================================================
