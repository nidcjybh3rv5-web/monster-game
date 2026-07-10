function saveGame(){
  const state={lv:G.lv,exp:G.exp,baseAtk:G.baseAtk,baseHp:G.baseHp,hp:G.hp,maxHp:G.maxHp,atk:G.atk,restUsed:G.restUsed,difficulty:G.difficulty,equipment:G.equipment,deathStreak:G.deathStreak,lastDmg:G.lastDmg,totalKills:G.totalKills,maxDamage:G.maxDamage,maxLevel:G.maxLevel,gold:G.gold,rebirthLevel:G.rebirthLevel,guild:G.guild,achievements:G.achievements,stats:G.stats,seasonData:loadSeasonData(),lastUpdated:new Date().toISOString()};
  localStorage.setItem('gameSave',JSON.stringify(state));
  if(currentUser){ db.collection('players').doc(currentUser.uid).set(state).catch(e=>{ toast(t('toast_cloud_fail'),true); }); }
}
function loadGame(){
  const raw=localStorage.getItem('gameSave');
  if(raw){
    try{
      const s=JSON.parse(raw);
      G.lv=s.lv??1; G.exp=s.exp??0; G.baseAtk=s.baseAtk??10; G.baseHp=s.baseHp??100;
      G.hp=s.hp??100; G.maxHp=s.maxHp??100; G.atk=s.atk??10; G.restUsed=s.restUsed??false;
      G.difficulty=s.difficulty??'normal'; G.equipment=s.equipment??[];
      G.deathStreak=s.deathStreak??0; G.lastDmg=s.lastDmg??0;
      G.totalKills=s.totalKills??0; G.maxDamage=s.maxDamage??0; G.maxLevel=s.maxLevel??1;
      G.gold=s.gold??0; G.rebirthLevel=s.rebirthLevel??0;
      if(s.guild)G.guild=s.guild;
      if(s.achievements)G.achievements=s.achievements;
      if(s.stats)G.stats=s.stats;
      if(s.seasonData)localStorage.setItem('seasonData',JSON.stringify(s.seasonData));
    }catch(e){}
  }
  applyEq(); refreshMonster(); updateUI(); renderAchievements();
}
async function loadCloud(){
  if(!currentUser)return;
  try{
    const doc=await db.collection('players').doc(currentUser.uid).get();
    if(doc.exists){
      const s=doc.data();
      G.lv=s.lv??1; G.exp=s.exp??0; G.baseAtk=s.baseAtk??10; G.baseHp=s.baseHp??100;
      G.hp=s.hp??100; G.maxHp=s.maxHp??100; G.atk=s.atk??10; G.restUsed=s.restUsed??false;
      G.difficulty=s.difficulty??'normal'; G.equipment=s.equipment??[];
      G.deathStreak=s.deathStreak??0; G.lastDmg=s.lastDmg??0;
      G.totalKills=s.totalKills??0; G.maxDamage=s.maxDamage??0; G.maxLevel=s.maxLevel??1;
      G.gold=s.gold??0; G.rebirthLevel=s.rebirthLevel??0;
      if(s.guild)G.guild=s.guild;
      if(s.achievements)G.achievements=s.achievements;
      if(s.stats)G.stats=s.stats;
      if(s.seasonData)localStorage.setItem('seasonData',JSON.stringify(s.seasonData));
      applyEq(); refreshMonster(); updateUI(); renderAchievements();
      toast(t('toast_cloud_sync'),false);
    }
  }catch(e){ toast(t('toast_cloud_fail'),true); }
}

// ============================================================
//  📄 頁面切換
// ============================================================
function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
  if(autoTimer){ clearInterval(autoTimer); autoTimer=null; }
  if(id==='settingsPage')renderSettings();
  if(id==='shopPage'){ renderShop(); updateGold(); checkDailyUI(); loadSignin(); document.getElementById('claimDailyBtn').onclick=()=>{ claimDaily(); checkDailyUI(); }; document.getElementById('signinBtn').onclick=()=>{ doSignin(); loadSignin(); }; }
  if(id==='guildPage')renderGuildUI();
  if(id==='pvpPage')renderPvPUI();
  if(id==='seasonPage')renderSeasonUI();
  if(id==='achievementPage')renderAchievements();
  if(id==='gamePage'){ if(musicOn&&!musicTimer)playMusic(); }
}
function loadSignin(){
  const last=localStorage.getItem('lastSignin'), today=new Date().toDateString();
  signinStreak=(last===today)?parseInt(localStorage.getItem('signinStreak')||'0'):0;
  document.getElementById('signinStreak').textContent=signinStreak;
}

// ============================================================
//  🚀 初始化
// ============================================================
