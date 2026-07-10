function toggleAuto(){
  G.autoBattle=!G.autoBattle;
  document.getElementById('autoBattleBtn').textContent=G.autoBattle?'🤖 ON':'🤖 OFF';
  if(G.autoBattle){ if(autoTimer)clearInterval(autoTimer); autoTimer=setInterval(()=>{ if(G.autoBattle&&document.getElementById('gamePage').classList.contains('active'))attack(); },1200); }
  else { if(autoTimer){ clearInterval(autoTimer); autoTimer=null; } }
}

// ============================================================
//  💤 離線收益
// ============================================================
function calcOffline(){
  const last=localStorage.getItem('lastOnline');
  if(last){
    const diff=(Date.now()-parseInt(last))/1000/60/60;
    if(diff>1){ const g=Math.floor(10*Math.min(diff,24)), e=Math.floor(5*Math.min(diff,24)); addGold(g); G.exp+=e; while(G.exp>=50)levelUp(); toast(t('toast_offline',{hours:Math.floor(diff),gold:g,exp:e}),false); }
  }
  localStorage.setItem('lastOnline',Date.now());
}

// ============================================================
//  🛒 商店
// ============================================================
function renderShop(){
  const c=document.getElementById('shopItemsList');
  if(!c)return;
  c.innerHTML=`
    <div class="setting-item"><div>🎁 裝備箱</div><button id="buyEq">100💰</button></div>
    <div class="setting-item"><div>🧪 經驗藥水 (+30EXP)</div><button id="buyExp">150💰</button></div>
    <div class="setting-item"><div>💊 復活石</div><button id="buyRev">200💰</button></div>
    <div class="setting-item"><div>🐕 寵物 (攻擊+5%)</div><button id="buyPet">300💰</button></div>
  `;
  document.getElementById('buyEq')?.addEventListener('click',()=>{ if(G.gold>=100){ G.gold-=100; const e=genEq(); G.equipment.push(e); G.stats.totalEquip++; SFX.equip(); toast(t('toast_buy_equip',{name:e.name}),false); if(!G.equipment.some(x=>x.type===e.type&&x.equipped)){ e.equipped=true; applyEq(); toast(t('toast_equip_auto'),false); } updateGold(); saveGame(); checkAchievements(); updateSeasonProgress('equip'); } else toast(t('toast_not_enough_gold'),true); });
  document.getElementById('buyExp')?.addEventListener('click',()=>{ if(G.gold>=150){ G.gold-=150; G.exp+=30; SFX.skill(); toast(t('toast_buy_exp'),false); levelUp(); updateGold(); saveGame(); } else toast(t('toast_not_enough_gold'),true); });
  document.getElementById('buyRev')?.addEventListener('click',()=>{ if(G.gold>=200){ G.gold-=200; localStorage.setItem('revive','true'); SFX.equip(); toast(t('toast_buy_revive'),false); updateGold(); saveGame(); } else toast(t('toast_not_enough_gold'),true); });
  document.getElementById('buyPet')?.addEventListener('click',()=>{ if(G.gold>=300){ G.gold-=300; localStorage.setItem('pet','true'); SFX.levelup(); toast(t('toast_buy_pet'),false); G.baseAtk=Math.floor(G.baseAtk*1.05); applyEq(); updateGold(); saveGame(); } else toast(t('toast_not_enough_gold'),true); });
}
function checkDailyUI(){ const d=document.getElementById('dailyRewardStatus'); if(d)d.innerHTML=canDaily()?t('daily_reward'):t('daily_reward')+' ✅'; }

// ============================================================
//  ⚙️ 設定
// ============================================================
function renderSettings(){
  const c=document.getElementById('settingsList');
  if(!c)return;
  const vol=localStorage.volume?parseFloat(localStorage.volume)*100:70;
  c.innerHTML=`
    <div class="setting-item"><div>${t('volume')}</div><input type="range" id="volSlider" min="0" max="100" value="${vol}"></div>
    <div class="setting-item"><div>${t('music')}</div><button id="musicToggleSettingBtn" class="music-btn ${musicOn?'on':''}" style="width:auto;padding:4px 16px;border-radius:20px;">${musicOn?'🔊 '+t('music'):'🔇 '+t('music')}</button></div>
    <div class="setting-item"><div>${t('language')}</div><select id="langSelect"><option value="zh-TW" ${currentLang==='zh-TW'?'selected':''}>🇹🇼 繁體中文</option><option value="zh-CN" ${currentLang==='zh-CN'?'selected':''}>🇨🇳 简体中文</option><option value="en" ${currentLang==='en'?'selected':''}>🇬🇧 English</option></select></div>
    <div class="setting-item"><div>${t('difficulty')}</div><select id="diffSelect"><option value="easy" ${G.difficulty==='easy'?'selected':''}>簡單</option><option value="normal" ${G.difficulty==='normal'?'selected':''}>普通</option><option value="hard" ${G.difficulty==='hard'?'selected':''}>困難</option><option value="extreme" ${G.difficulty==='extreme'?'selected':''}>極限</option></select></div>
    <div class="setting-item"><div>${t('google')}</div><div><button id="googleBtn" style="background:#334155;padding:6px 12px;">登入</button> <button id="logoutBtn" style="background:#334155;padding:6px 12px;">登出</button></div></div>
    <div class="setting-item"><div>${t('achievements')}</div><div>${Object.values(G.achievements).filter(v=>v).length}/${ACHIEVEMENTS.length}</div></div>
    <div class="setting-item"><div>${t('version')}</div><div>v8.0</div></div>
    <div class="setting-item"><div>${t('check_update')}</div><button id="checkUpdateBtn" style="background:#3b82f6;color:#fff;border:none;padding:6px 12px;border-radius:30px;">${t('check_update')}</button></div>
    <div class="setting-item"><div style="color:#f87171;">${t('reset')}</div><button id="resetGameBtn" style="background:#ef4444;color:#fff;border:none;padding:6px 12px;border-radius:30px;">${t('reset')}</button></div>
  `;
  document.getElementById('volSlider')?.addEventListener('input',e=>localStorage.setItem('volume',e.target.value/100));
  document.getElementById('musicToggleSettingBtn')?.addEventListener('click',toggleMusic);
  document.getElementById('langSelect')?.addEventListener('change',e=>{ currentLang=e.target.value; localStorage.setItem('language',currentLang); applyLanguage(); toast(t('toast_language_changed'),false); });
  document.getElementById('diffSelect')?.addEventListener('change',e=>{ G.difficulty=e.target.value; localStorage.setItem('difficulty',G.difficulty); refreshMonster(); toast(t('toast_difficulty_changed'),false); });
  document.getElementById('googleBtn')?.addEventListener('click',googleLogin);
  document.getElementById('logoutBtn')?.addEventListener('click',googleLogout);
  document.getElementById('checkUpdateBtn')?.addEventListener('click',()=>toast(t('toast_latest_version'),false));
  document.getElementById('resetGameBtn')?.addEventListener('click',()=>{ if(confirm(t('reset_confirm'))){ localStorage.clear(); location.reload(); } });
  if(currentUser){ const g=document.getElementById('googleBtn'); if(g){ g.textContent=`👤 ${currentUser.displayName}`; g.disabled=true; } }
}

// ============================================================
//  🏆 成就系統
// ============================================================
const ACHIEVEMENTS = [
  {id:'first_blood',name:'第一滴血',desc:'擊殺第1隻怪物',icon:'🩸',check:()=>G.totalKills>=1,reward:50},
  {id:'hundred_kills',name:'百人斬',desc:'擊殺100隻怪物',icon:'⚔️',check:()=>G.totalKills>=100,reward:200},
  {id:'thousand_kills',name:'千人斬',desc:'擊殺1000隻怪物',icon:'💀',check:()=>G.totalKills>=1000,reward:500},
  {id:'first_upgrade',name:'強化新手',desc:'強化1次裝備',icon:'🔧',check:()=>G.stats.totalUpgrade>=1,reward:50},
  {id:'master_upgrade',name:'強化大師',desc:'強化10次裝備',icon:'🔨',check:()=>G.stats.totalUpgrade>=10,reward:300},
  {id:'collector',name:'裝備收藏家',desc:'獲得5件裝備',icon:'📦',check:()=>G.stats.totalEquip>=5,reward:100},
  {id:'guild_member',name:'公會成員',desc:'創建或加入公會',icon:'🏛️',check:()=>G.guild.name!==null,reward:100},
  {id:'guild_contributor',name:'公會貢獻者',desc:'貢獻值達100',icon:'💰',check:()=>{ const m=G.guild.members.find(x=>x.uid==='player'); return m?m.contribution>=100:false; },reward:200},
  {id:'element_master',name:'元素大師',desc:'使用3種不同元素攻擊',icon:'🔥',check:()=>{ const s=localStorage.getItem('elements_used'); return s?JSON.parse(s).length>=3:false; },reward:150},
  {id:'boss_hunter',name:'Boss獵人',desc:'擊殺5隻Boss',icon:'👑',check:()=>(G.stats.bossKills||0)>=5,reward:300},
  {id:'rebirth_1',name:'轉生者',desc:'轉生1次',icon:'🔄',check:()=>G.rebirthLevel>=1,reward:500},
  {id:'rebirth_5',name:'傳奇',desc:'轉生5次',icon:'🌟',check:()=>G.rebirthLevel>=5,reward:1000}
];
function initAchievements(){ const saved=localStorage.getItem('achievements'); if(saved) G.achievements=JSON.parse(saved); else G.achievements={}; ACHIEVEMENTS.forEach(a=>{ if(!(a.id in G.achievements)) G.achievements[a.id]=false; }); }
function checkAchievements(){
  let unlocked=false;
  ACHIEVEMENTS.forEach(a=>{ if(!G.achievements[a.id] && a.check()){ G.achievements[a.id]=true; unlocked=true; addGold(a.reward); toast(t('toast_achievement_unlock',{icon:a.icon,name:a.name,reward:a.reward}),false); localStorage.setItem('achievements',JSON.stringify(G.achievements)); saveGame(); } });
  if(unlocked) renderAchievements();
}
function renderAchievements(){
  const c=document.getElementById('achievementList');
  if(!c)return;
  let html='';
  ACHIEVEMENTS.forEach(a=>{ const unlocked=G.achievements[a.id]||false; const status=unlocked?'✅ 已解鎖':'🔒 未解鎖'; const cls=unlocked?'unlocked':'locked'; html+=`<div class="achievement-card ${cls}"><div class="ach-icon">${a.icon}</div><div class="ach-info"><div class="ach-name">${a.name}</div><div class="ach-desc">${a.desc}</div></div><div class="ach-status">${status}</div></div>`; });
  c.innerHTML=html;
}

// ============================================================
//  ⚔️ PvP
// ============================================================
async function findOpponent(){
  if(!currentUser) return toast(t('toast_login_first'),true);
  try {
    const snap=await db.collection('players').limit(20).get();
    const candidates=snap.docs.filter(d=>d.id!==currentUser.uid).map(d=>({uid:d.id,...d.data()}));
    if(candidates.length===0){ toast(t('pvp_no_opponent'),true); return null; }
    return candidates[Math.floor(Math.random()*candidates.length)];
  } catch(e){ toast(t('toast_connect_error'),true); return null; }
}
async function startPvP(){
  if(isPvPing) return toast(t('pvp_battle'),true);
  if(G.hp<=0) return toast(t('toast_cannot_attack'),true);
  isPvPing=true;
  try {
    const opp=await findOpponent();
    if(!opp){ isPvPing=false; return; }
    const op={name:opp.uid?'玩家'+opp.uid.slice(0,4):'對手',lv:opp.lv||1,hp:opp.hp||100,maxHp:opp.maxHp||100,atk:opp.atk||10,element:opp.playerElem||'無'};
    let pHp=G.hp, oHp=op.hp;
    while(pHp>0&&oHp>0){
      const pD=rand(G.atk-3,G.atk+5); oHp=Math.max(0,oHp-pD); if(oHp<=0)break;
      const aD=rand(op.atk-3,op.atk+5); pHp=Math.max(0,pHp-aD);
    }
    let result='';
    if(pHp>0&&oHp<=0){ result='win'; const r=50+rand(0,50); addGold(r); toast(t('toast_pvp_result_win',{opponent:op.name,gold:r}),false); checkAchievements(); }
    else if(oHp>0&&pHp<=0){ result='lose'; toast(t('toast_pvp_result_lose',{opponent:op.name}),true); G.hp=G.maxHp; G.restUsed=false; updateUI(); }
    else { result='draw'; toast(t('toast_pvp_result_draw'),false); }
    pvpHistory.push({opponent:op.name,result:result,time:new Date().toISOString()});
    if(pvpHistory.length>50)pvpHistory.shift();
    localStorage.setItem('pvpHistory',JSON.stringify(pvpHistory));
    G.hp=Math.min(G.maxHp,pHp); updateUI(); saveGame();
  } catch(e){ toast(t('toast_pvp_fail'),true); }
  isPvPing=false;
}
function renderPvPUI(){
  document.getElementById('pvpContent').innerHTML=`
    <div style="text-align:center;padding:16px;">
      <h3>${t('pvp_title')}</h3>
      <button id="pvpFindBtn" class="play-btn" style="width:auto;margin:16px auto;">${t('pvp_find')}</button>
      <div id="pvpHistory"><h4>${t('pvp_history')}</h4>${pvpHistory.slice(-5).map(h=>`<div class="setting-item"><span>${h.opponent}</span><span style="color:${h.result==='win'?'#4ade80':h.result==='lose'?'#ef4444':'#facc15'}">${h.result==='win'?t('pvp_win'):h.result==='lose'?t('pvp_lose'):t('pvp_draw')}</span></div>`).join('')}</div>
    </div>
  `;
  document.getElementById('pvpFindBtn')?.addEventListener('click',startPvP);
}

// ============================================================
//  🎖️ 賽季通行證
// ============================================================
const SEASON_EXP_PER_LEVEL=100;
function loadSeasonData(){
  const d=localStorage.getItem('seasonData');
  if(d)return JSON.parse(d);
  return {level:1,exp:0,claimed:[],tasks:[
    {id:'s1',desc:t('season_task_attack'),target:10,current:0,reward:100,claimed:false},
    {id:'s2',desc:t('season_task_boss'),target:5,current:0,reward:200,claimed:false},
    {id:'s3',desc:t('season_task_upgrade'),target:3,current:0,reward:150,claimed:false},
    {id:'s4',desc:t('season_task_donate'),target:2,current:0,reward:120,claimed:false},
    {id:'s5',desc:t('season_task_equip'),target:10,current:0,reward:300,claimed:false}
  ]};
}
function saveSeasonData(d){ localStorage.setItem('seasonData',JSON.stringify(d)); }
function updateSeasonProgress(type,amt=1){
  const d=loadSeasonData();
  d.tasks.forEach(t=>{ if(t.claimed)return; if((type==='attack'&&t.id==='s1')||(type==='boss'&&t.id==='s2')||(type==='upgrade'&&t.id==='s3')||(type==='donate'&&t.id==='s4')||(type==='equip'&&t.id==='s5')){ t.current=Math.min(t.target,t.current+amt); if(t.current>=t.target&&!t.claimed){ t.claimed=true; d.exp+=20; toast(t('season_task_complete',{task:t.desc,exp:20}),false); while(d.exp>=SEASON_EXP_PER_LEVEL){ d.exp-=SEASON_EXP_PER_LEVEL; d.level++; toast(t('toast_season_levelup',{level:d.level}),false); } saveSeasonData(d); renderSeasonUI(); } } });
  saveSeasonData(d);
}
function claimSeasonReward(level){
  const d=loadSeasonData();
  if(d.claimed.includes(level)) return toast(t('toast_already_claimed'),true);
  if(d.level<level) return toast(t('toast_level_not_enough'),true);
  const rewards={2:{gold:200},3:{equip:'common'},5:{gold:500},7:{equip:'rare'},10:{gold:1000}};
  const r=rewards[level]; if(!r)return toast(t('toast_no_reward'),true);
  if(r.gold){ addGold(r.gold); toast(t('season_reward_gold',{gold:r.gold}),false); }
  else if(r.equip){ const e=genEq(); if(r.equip==='rare')e.quality='稀有'; G.equipment.push(e); toast(t('season_reward_equip',{equip:e.name}),false); saveGame(); }
  d.claimed.push(level); saveSeasonData(d); renderSeasonUI();
}
function renderSeasonUI(){
  const d=loadSeasonData(); const c=document.getElementById('seasonContent');
  if(!c)return;
  let html=`
    <div style="padding:16px;">
      <h3>${t('season_title')}</h3>
      <div class="setting-item"><div>${t('season_level',{level:d.level})}</div><div>${t('season_exp',{exp:d.exp,max:SEASON_EXP_PER_LEVEL})}</div></div>
      <div style="margin:16px 0;"><h4>${t('season_tasks')}</h4>${d.tasks.map(t=>`<div class="setting-item"><div>${t.desc} (${t.current}/${t.target})</div><div>${t.claimed?t('season_claimed'):'⏳'}</div></div>`).join('')}</div>
      <div><h4>${t('season_rewards')}</h4>${[2,3,5,7,10].map(l=>`<div class="setting-item"><div>Lv.${l} ${l===2?'200金':l===3?'裝備箱':l===5?'500金':l===7?'稀有裝備箱':'1000金'}</div><button ${d.level>=l&&!d.claimed.includes(l)?'':'disabled'} onclick="claimSeasonReward(${l})">${d.claimed.includes(l)?t('season_claimed'):t('season_claim')}</button></div>`).join('')}</div>
    </div>
  `;
  c.innerHTML=html;
}
window.claimSeasonReward = claimSeasonReward;

// ============================================================
//  📋 回報功能
// ============================================================
function openReport(){
  const now=new Date(); const timeStr=now.toLocaleString('zh-TW',{hour12:false});
  const ua=navigator.userAgent; const gn=G.guild?.name||'無', gl=G.guild?.level||0;
  const gc=G.guild?.members?.find(m=>m.uid==='player')?.contribution||0;
  const w=G.equipment.find(e=>e.type==='w'&&e.equipped); const a=G.equipment.find(e=>e.type==='a'&&e.equipped);
  const wi=w?`${w.name}+${w.bonus} (${w.element})`:'無'; const ai=a?`${a.name}+${a.bonus} (${a.element})`:'無';
  const mi=G.curMonster?`${G.curMonster.emoji}${G.curMonster.name} Lv.${G.curMonster.lv} HP:${G.curMonster.hp}/${G.curMonster.maxHp}`:'無';
  const ach=Object.values(G.achievements).filter(v=>v).length;
  const report=`========================================\n🎮 幻獸鬥士 Bug 回報\n========================================\n📅 時間：${timeStr}\n🔍 版本：v8.0\n\n━━━ 玩家狀態 ━━━\n👤 等級：${G.lv}\n❤️ HP：${G.hp}/${G.maxHp}\n⚔️ 攻擊：${G.atk}\n💰 金幣：${G.gold}\n🔄 轉生：${G.rebirthLevel} 次\n🔥 元素：${playerElem()}\n🏛️ 公會：${gn} (Lv.${gl}) 貢獻:${gc}\n🏆 成就：${ach}/${ACHIEVEMENTS.length}\n\n━━━ 裝備 ━━━\n🗡️ 武器：${wi}\n🛡️ 防具：${ai}\n🎒 總裝備數：${G.equipment.length} 件\n\n━━━ 戰鬥 ━━━\n👾 當前怪物：${mi}\n💀 總擊殺數：${G.totalKills}\n💥 最大傷害：${G.maxDamage}\n\n━━━ 系統資訊 ━━━\n🌐 瀏覽器：${ua}\n📱 平台：${navigator.platform}\n☁️ 登入狀態：${currentUser?'已登入 ('+currentUser.displayName+')':'未登入'}\n\n━━━ 請描述您遇到的問題 ━━━\n（請在這裡輸入詳細描述...）\n========================================`;
  const ov=document.createElement('div'); ov.className='report-overlay';
  const cd=document.createElement('div'); cd.className='report-card';
  const title=document.createElement('h3'); title.textContent=t('report'); title.style.marginBottom='8px';
  const ta=document.createElement('textarea'); ta.id='reportTextarea'; ta.value=report;
  const bd=document.createElement('div'); bd.className='report-buttons';
  const copy=document.createElement('button'); copy.className='copy-btn'; copy.textContent=t('report_copy');
  copy.onclick=()=>{ ta.select(); ta.setSelectionRange(0,99999); if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(ta.value).then(()=>toast(t('report_copied'),false)).catch(()=>{ document.execCommand('copy'); toast(t('report_copied'),false); }); } else { document.execCommand('copy'); toast(t('report_copied'),false); } };
  const send=document.createElement('button'); send.className='discord-btn'; send.textContent=t('report_discord');
  send.onclick=()=>{ const content=ta.value; send.textContent='⏳ 發送中...'; send.disabled=true; fetch(WEBHOOK_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({content:content})}).then(res=>{ send.textContent=t('report_discord'); send.disabled=false; if(res.ok){ toast(t('report_discord_sent'),false); }else{ toast(t('report_discord_fail')+' (HTTP '+res.status+')',true); } }).catch(()=>{ send.textContent=t('report_discord'); send.disabled=false; toast(t('report_discord_fail'),true); }); };
  const close=document.createElement('button'); close.className='close-btn'; close.textContent=t('report_close'); close.onclick=()=>document.body.removeChild(ov);
  ov.onclick=e=>{ if(e.target===ov)document.body.removeChild(ov); };
  bd.appendChild(copy); bd.appendChild(send); bd.appendChild(close);
  cd.appendChild(title); cd.appendChild(ta); cd.appendChild(bd);
  ov.appendChild(cd); document.body.appendChild(ov);
  setTimeout(()=>{ ta.select(); ta.setSelectionRange(0,99999); },100);
}

// ============================================================
//  ☁️ Firebase 登入 & 存檔
// ============================================================
