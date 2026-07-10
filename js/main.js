const G = window.G;
let currentUser = null, signinStreak = 0, myGuild = null;
let autoTimer = null, isPvPing = false;
let pvpHistory = JSON.parse(localStorage.getItem('pvpHistory') || '[]');

// ============================================================
//  ⚡ 元素克制
// ============================================================
function canDaily(){ return localStorage.getItem('lastDaily')!==new Date().toDateString(); }
function claimDaily(){
  if(!canDaily()){ toast(t('toast_daily_claimed'),true); return; }
  const r=rand(1,3);
  if(r===1){ G.exp+=20; toast(t('toast_daily_exp'),false); levelUp(); }
  else if(r===2){ const e=genEq(); G.equipment.push(e); G.stats.totalEquip++; SFX.equip(); toast(t('toast_daily_equip',{name:e.name}),false); if(!G.equipment.some(x=>x.type===e.type&&x.equipped)){ e.equipped=true; applyEq(); toast(t('toast_equip_auto'),false); } updateSeasonProgress('equip'); }
  else { G.hp=Math.min(G.maxHp,G.hp+50); toast(t('toast_daily_hp'),false); }
  localStorage.setItem('lastDaily',new Date().toDateString());
  updateUI(); saveGame();
}
function doSignin(){
  const last=localStorage.getItem('lastSignin'), today=new Date().toDateString();
  if(last===today)return;
  if(last){ const d=(new Date()-new Date(last))/(1000*3600*24); signinStreak=(d===1)?(signinStreak%7)+1:1; }else signinStreak=1;
  localStorage.setItem('lastSignin',today);
  const r=[100,150,200,250,300,400,500][signinStreak-1]||500;
  addGold(r); SFX.gold();
  toast(t('toast_signin',{days:signinStreak,gold:r}),false);
  document.getElementById('signinStreak').textContent=signinStreak;
  localStorage.setItem('signinStreak',signinStreak);
  if(signinStreak===7){ toast(t('toast_signin_7days'),false); const e=genEq(); e.quality='史詩'; G.equipment.push(e); G.stats.totalEquip++; SFX.equip(); saveGame(); }
  if(signinStreak===30){ toast(t('toast_signin_30days'),false); localStorage.setItem('title','傳奇'); }
}

// ============================================================
//  🔄 轉生
// ============================================================
function canRebirth(){ return G.lv>=100 && G.rebirthLevel<10; }
function doRebirth(){
  if(!canRebirth()){ toast(t('toast_rebirth_fail'),true); return; }
  G.rebirthLevel++; G.lv=1; G.exp=0;
  G.baseAtk=10+G.rebirthLevel*2; G.baseHp=100+G.rebirthLevel*20;
  G.hp=G.maxHp;
  applyEq(); refreshMonster(); saveGame();
  SFX.levelup();
  toast(t('toast_rebirth_success',{level:G.rebirthLevel}),false);
  updateUI();
  checkAchievements();
}

// ============================================================
//  🏛️ 公會系統（完整含推薦與排名）
// ============================================================
document.addEventListener('DOMContentLoaded',async()=>{
  try { await loadExternalData(); } catch (e) { console.error(e); showDataLoadError(e); return; }
  document.getElementById('musicToggleBtn')?.addEventListener('click',toggleMusic);
  document.getElementById('reportBtn')?.addEventListener('click',openReport);
  document.getElementById('attackBtn').onclick=attack;
  document.getElementById('skillBtn').onclick=showSkill;
  document.getElementById('restBtn').onclick=rest;
  document.getElementById('inventoryBtn').onclick=showBag;
  document.getElementById('saveBtn').onclick=saveGame;
  document.getElementById('rebirthBtn').onclick=doRebirth;
  document.getElementById('autoBattleBtn').onclick=toggleAuto;
  document.getElementById('toGameBtn').onclick=()=>showPage('gamePage');
  document.getElementById('toSettingsBtn').onclick=()=>showPage('settingsPage');
  document.getElementById('shopBtn').onclick=()=>showPage('shopPage');
  document.getElementById('guildBtn').onclick=()=>showPage('guildPage');
  document.getElementById('pvpBtn').onclick=()=>showPage('pvpPage');
  document.getElementById('seasonBtn').onclick=()=>showPage('seasonPage');
  document.getElementById('achievementBtn').onclick=()=>showPage('achievementPage');
  document.getElementById('helpBtn').onclick=()=>showPage('helpPage');
  document.querySelectorAll('.back-btn').forEach(btn=>{ btn.onclick=()=>showPage('mainPage'); });
  document.getElementById('backFromGuild').onclick=()=>showPage('mainPage');
  document.getElementById('backFromPvp').onclick=()=>showPage('mainPage');
  document.getElementById('backFromSeason').onclick=()=>showPage('mainPage');

  applyLanguage();
  initAchievements();
  loadGame();
  loadSignin();
  calcOffline();
  renderAchievements();

  if(!localStorage.getItem('guideShown')){
    document.getElementById('guideOverlay').style.display='flex';
    document.getElementById('closeGuideBtn').onclick=()=>{
      document.getElementById('guideOverlay').style.display='none';
      localStorage.setItem('guideShown','true');
    };
  }
  setInterval(()=>{ if(document.getElementById('gamePage').classList.contains('active'))G.stats.playTime++; },1000);
  setTimeout(()=>{ if(musicOn&&!musicTimer){ getCtx(); playMusic(); } },500);
});
