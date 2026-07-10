const SAVE_VERSION = 2;
function makeSaveState(){
  return {saveVersion:SAVE_VERSION,lv:G.lv,exp:G.exp,baseAtk:G.baseAtk,baseHp:G.baseHp,hp:G.hp,maxHp:G.maxHp,atk:G.atk,restUsed:G.restUsed,difficulty:G.difficulty,equipment:G.equipment,deathStreak:G.deathStreak,lastDmg:G.lastDmg,totalKills:G.totalKills,maxDamage:G.maxDamage,maxLevel:G.maxLevel,gold:G.gold,rebirthLevel:G.rebirthLevel,guild:G.guild,achievements:G.achievements,stats:G.stats,seasonData:loadSeasonData(),lastUpdated:new Date().toISOString()};
}
function migrateSave(save){
  const state={...save,saveVersion:save.saveVersion||1};
  state.equipment=Array.isArray(state.equipment)?state.equipment:[];
  state.stats={playTime:0,totalGold:0,totalEquip:0,totalUpgrade:0,skillUsage:0,bossKills:0,...(state.stats||{})};
  state.achievements=state.achievements||{};
  state.guild=state.guild||{name:null,level:1,exp:0,members:[{uid:'player',contribution:0}]};
  state.saveVersion=SAVE_VERSION;
  return state;
}
function hydrateGame(save){
  const s=migrateSave(save);
  G.lv=s.lv??1; G.exp=s.exp??0; G.baseAtk=s.baseAtk??10; G.baseHp=s.baseHp??100;
  G.hp=s.hp??100; G.maxHp=s.maxHp??100; G.atk=s.atk??10; G.restUsed=s.restUsed??false;
  G.difficulty=s.difficulty??'normal'; G.equipment=s.equipment; G.deathStreak=s.deathStreak??0;
  G.lastDmg=s.lastDmg??0; G.totalKills=s.totalKills??0; G.maxDamage=s.maxDamage??0;
  G.maxLevel=s.maxLevel??1; G.gold=s.gold??0; G.rebirthLevel=s.rebirthLevel??0;
  G.guild=s.guild; G.achievements=s.achievements; G.stats=s.stats;
  if(s.seasonData)localStorage.setItem('seasonData',JSON.stringify(s.seasonData));
}
function saveGame(){
  const state=makeSaveState(); localStorage.setItem('gameSave',JSON.stringify(state));
  if(currentUser)db.collection('players').doc(currentUser.uid).set(state).catch(()=>toast(t('toast_cloud_fail'),true));
}
function loadGame(){
  const raw=localStorage.getItem('gameSave');
  if(raw)try{ hydrateGame(JSON.parse(raw)); }catch(e){ console.error('Invalid game save',e); }
  applyEq(); refreshMonster(); updateUI(); renderAchievements();
}
async function loadCloud(){
  if(!currentUser)return;
  try{const doc=await db.collection('players').doc(currentUser.uid).get(); if(doc.exists){hydrateGame(doc.data()); applyEq(); refreshMonster(); updateUI(); renderAchievements(); toast(t('toast_cloud_sync'),false);}}catch(e){toast(t('toast_cloud_fail'),true);}
}
function exportSave(){
  saveGame(); const blob=new Blob([localStorage.getItem('gameSave')],{type:'application/json'});
  const link=document.createElement('a'); link.href=URL.createObjectURL(blob); link.download=`MonsterGame-save-v${SAVE_VERSION}.json`; link.click(); URL.revokeObjectURL(link.href);
}
function importSave(file){
  const reader=new FileReader(); reader.onload=()=>{try{const state=JSON.parse(reader.result); if(!state||typeof state!=='object')throw new Error('Invalid save'); if(confirm('Replace the current local save with this backup?')){localStorage.setItem('gameSave',JSON.stringify(migrateSave(state))); loadGame(); renderSettings(); toast('Save imported.',false);}}catch(e){toast('Invalid save file.',true);}}; reader.readAsText(file);
}
const legacyRenderSettings=window.renderSettings;
window.renderSettings=function(){
  legacyRenderSettings(); const list=document.getElementById('settingsList'); if(!list)return;
  const row=document.createElement('div'); row.className='setting-item'; row.innerHTML='<div>Save backup (v'+SAVE_VERSION+')</div><div><button id="exportSaveBtn" class="game-action">Export</button> <button id="importSaveBtn" class="game-action">Import</button><input id="importSaveFile" type="file" accept="application/json" hidden></div>';
  list.appendChild(row); document.getElementById('exportSaveBtn').onclick=exportSave;
  document.getElementById('importSaveBtn').onclick=()=>document.getElementById('importSaveFile').click();
  document.getElementById('importSaveFile').onchange=e=>{if(e.target.files[0])importSave(e.target.files[0]);};
}
function showDataLoadError(){
  const card=document.createElement('div'); card.className='backpack-overlay'; card.innerHTML='<div class="backpack-card" style="text-align:center"><h3>Game data could not load</h3><p style="margin:12px 0">Open this game through an HTTP server, then retry.</p><button id="retryDataBtn" class="play-btn">Retry</button></div>';
  document.body.appendChild(card); document.getElementById('retryDataBtn').onclick=()=>location.reload();
}
const DAILY_TASKS=[
  {id:'attack',label:'Attack 10 times',target:10,reward:50},
  {id:'kill',label:'Defeat 5 monsters',target:5,reward:80},
  {id:'upgrade',label:'Upgrade equipment once',target:1,reward:100}
];
function taskDate(){return new Date().toDateString();}
function taskState(){
  let state; try{state=JSON.parse(localStorage.getItem('dailyTasks')||'{}');}catch(e){state={};}
  if(state.date!==taskDate())state={date:taskDate(),progress:{},claimed:{}};
  state.progress=state.progress||{}; state.claimed=state.claimed||{}; return state;
}
function storeTaskState(state){localStorage.setItem('dailyTasks',JSON.stringify(state));}
function trackTask(id,amount=1){const state=taskState(); state.progress[id]=(state.progress[id]||0)+amount; storeTaskState(state);}
function claimTask(id){
  const task=DAILY_TASKS.find(x=>x.id===id),state=taskState(); if(!task||state.claimed[id]||(state.progress[id]||0)<task.target)return;
  state.claimed[id]=true; storeTaskState(state); addGold(task.reward); saveGame(); showTasks();
}
function closeFeature(){document.querySelector('.feature-overlay')?.remove();}
function showTasks(){
  closeFeature(); const state=taskState(),card=document.createElement('div'); card.className='backpack-overlay feature-overlay';
  card.innerHTML='<div class="backpack-card"><h3>Daily Tasks</h3>'+DAILY_TASKS.map(task=>{const done=(state.progress[task.id]||0)>=task.target,claimed=state.claimed[task.id]; return '<div class="backpack-item" style="border-left-color:'+(claimed?'#4ade80':'#facc15')+'"><span>'+task.label+'<br><small>'+(state.progress[task.id]||0)+' / '+task.target+' | '+task.reward+' gold</small></span><button class="game-action" data-task="'+task.id+'" '+(!done||claimed?'disabled':'')+'>'+ (claimed?'Claimed':'Claim')+'</button></div>';}).join('')+'<button class="close-backpack" id="closeFeatureBtn">Close</button></div>';
  document.body.appendChild(card); card.querySelectorAll('[data-task]').forEach(button=>button.onclick=()=>claimTask(button.dataset.task)); document.getElementById('closeFeatureBtn').onclick=closeFeature;
}
function bestiaryState(){try{return JSON.parse(localStorage.getItem('bestiary')||'{}');}catch(e){return {};}}
function storeBestiary(state){localStorage.setItem('bestiary',JSON.stringify(state));}
function encounterMonster(monster,killed=false){
  if(!monster)return; const state=bestiaryState(),key=monster.name; const entry=state[key]||{name:monster.name,emoji:monster.emoji,element:monster.element,seen:0,kills:0,firstSeen:new Date().toISOString()};
  entry.seen++; if(killed)entry.kills++; state[key]=entry; storeBestiary(state);
}
function showBestiary(){
  closeFeature(); const entries=Object.values(bestiaryState()).sort((a,b)=>a.name.localeCompare(b.name)),card=document.createElement('div'); card.className='backpack-overlay feature-overlay';
  card.innerHTML='<div class="backpack-card"><h3>Monster Bestiary ('+entries.length+')</h3>'+(entries.length?entries.map(entry=>'<div class="backpack-item" style="border-left-color:#8b5cf6"><span>'+entry.emoji+' '+entry.name+'<br><small>Element: '+entry.element+' | Seen: '+entry.seen+' | Defeated: '+entry.kills+'</small></span></div>').join(''):'<p>No monsters discovered yet.</p>')+'<button class="close-backpack" id="closeFeatureBtn">Close</button></div>';
  document.body.appendChild(card); document.getElementById('closeFeatureBtn').onclick=closeFeature;
}
const legacyAttack=window.attack,legacyDefeatMonster=window.defeatMonster,legacyUpEq=window.upEq,legacyRefreshMonster=window.refreshMonster;
window.attack=function(){legacyAttack(); trackTask('attack');};
window.defeatMonster=function(){const defeated=G.curMonster?{...G.curMonster}:null; legacyDefeatMonster(); encounterMonster(defeated,true); trackTask('kill');};
window.upEq=function(id){const before=G.equipment.find(item=>item.id==id)?.level||0; legacyUpEq(id); if((G.equipment.find(item=>item.id==id)?.level||0)>before)trackTask('upgrade');};
window.refreshMonster=function(){legacyRefreshMonster(); encounterMonster(G.curMonster);};
document.addEventListener('DOMContentLoaded',()=>{
  const actions=document.querySelector('#gamePage .buttons'); if(!actions)return;
  const taskButton=document.createElement('button'); taskButton.className='game-action'; taskButton.style.background='#0ea5e9'; taskButton.textContent='Tasks'; taskButton.onclick=showTasks;
  const bestiaryButton=document.createElement('button'); bestiaryButton.className='game-action'; bestiaryButton.style.background='#7c3aed'; bestiaryButton.textContent='Bestiary'; bestiaryButton.onclick=showBestiary;
  actions.append(taskButton,bestiaryButton);
});
