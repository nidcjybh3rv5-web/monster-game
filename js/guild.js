const guildsCollection = db.collection('guilds');
myGuild = localStorage.getItem('myGuild') || null;

async function createGuild(name) {
  if (!currentUser) return toast(t('toast_login_first'),true);
  if (myGuild) return toast(t('toast_already_in_guild'),true);
  if (G.gold<1000) return toast(t('toast_not_enough_gold'),true);
  const n=sanitizeInput(name.trim()); if(!n) return toast(t('toast_invalid_name'),true);
  try {
    const ref=guildsCollection.doc(n);
    if((await ref.get()).exists) return toast(t('toast_guild_exists'),true);
    await ref.set({name:n,members:[currentUser.uid],contribution:{[currentUser.uid]:0},bossHp:1000,bossMaxHp:1000,bossDefeated:false,level:1,exp:0,createdAt:Date.now()});
    G.gold-=1000; myGuild=n; localStorage.setItem('myGuild',n); updateGold();
    toast(t('toast_guild_created',{name:n}),false);
    renderGuildUI(); saveGame(); checkAchievements();
  } catch(e){ toast(t('toast_connect_error'),true); }
}

async function joinGuild(name) {
  if (!currentUser) return toast(t('toast_login_first'),true);
  if (myGuild) return toast(t('toast_already_in_guild'),true);
  const n=sanitizeInput(name.trim()); if(!n) return toast(t('toast_invalid_name'),true);
  try {
    const ref=guildsCollection.doc(n);
    const doc=await ref.get();
    if(!doc.exists) return toast(t('toast_guild_not_found'),true);
    if(doc.data().members.length>=10) return toast(t('toast_guild_full'),true);
    await ref.update({members:firebase.firestore.FieldValue.arrayUnion(currentUser.uid),[`contribution.${currentUser.uid}`]:0});
    myGuild=n; localStorage.setItem('myGuild',n);
    toast(t('toast_guild_joined',{name:n}),false);
    renderGuildUI(); checkAchievements();
  } catch(e){ toast(t('toast_connect_error'),true); }
}

async function leaveGuild() {
  if(!myGuild) return toast(t('no_guild'),true);
  if(!confirm(t('leave_confirm'))) return;
  try {
    await guildsCollection.doc(myGuild).update({members:firebase.firestore.FieldValue.arrayRemove(currentUser.uid),[`contribution.${currentUser.uid}`]:firebase.firestore.FieldValue.delete()});
    myGuild=null; localStorage.removeItem('myGuild');
    toast(t('toast_guild_left'),false); renderGuildUI();
  } catch(e){ toast(t('toast_connect_error'),true); }
}

async function donateGuild(amount) {
  if(!myGuild) return toast(t('no_guild'),true);
  if(G.gold<amount) return toast(t('toast_not_enough_gold'),true);
  try {
    const ref=guildsCollection.doc(myGuild);
    const c=Math.floor(amount/10);
    await ref.update({[`contribution.${currentUser.uid}`]:firebase.firestore.FieldValue.increment(c),exp:firebase.firestore.FieldValue.increment(c)});
    G.gold-=amount; updateGold(); saveGame();
    const doc=await ref.get(); const data=doc.data();
    while(data.exp>=data.level*100){ await ref.update({exp:firebase.firestore.FieldValue.increment(-data.level*100),level:firebase.firestore.FieldValue.increment(1)}); toast(t('toast_guild_levelup',{level:data.level+1}),false); applyEq(); }
    toast(t('toast_guild_donate',{gold:amount,contribution:c}),false);
    renderGuildUI(); checkAchievements(); updateSeasonProgress('donate');
  } catch(e){ toast(t('toast_connect_error'),true); }
}

async function attackGuildBoss() {
  if(!myGuild) return toast(t('no_guild'),true);
  if(G.hp<=0) return toast(t('toast_cannot_attack'),true);
  try {
    const ref=guildsCollection.doc(myGuild);
    const doc=await ref.get(); const data=doc.data();
    if(data.bossDefeated) return toast(t('toast_guild_boss_defeated'),true);
    const d=rand(G.atk-5,G.atk+15); const newHp=Math.max(0,data.bossHp-d);
    await ref.update({bossHp:newHp,[`contribution.${currentUser.uid}`]:firebase.firestore.FieldValue.increment(d)});
    const c=rand(5,20); G.hp=Math.max(0,G.hp-c); if(G.hp===0){ G.hp=G.maxHp; G.restUsed=false; toast(t('toast_revive'),true); }
    updateUI(); saveGame();
    if(newHp<=0){ await ref.update({bossDefeated:true,bossHp:0}); addGold(500); toast(t('toast_guild_boss_defeated',{gold:500}),false); }
    else toast(t('toast_guild_boss_damage',{dmg:d,hp:newHp,max:data.bossMaxHp}),false);
    renderGuildUI();
  } catch(e){ toast(t('toast_connect_error'),true); }
}

async function resetGuildBossIfNeeded() {
  const last=localStorage.getItem('guildBossReset');
  const now=Date.now();
  if(!last||now-parseInt(last)>7*24*60*60*1000){
    try {
      const snap=await guildsCollection.get(); const batch=db.batch();
      snap.forEach(d=>{ const ref=d.ref; const data=d.data(); batch.update(ref,{bossHp:1000+(data.level-1)*200,bossMaxHp:1000+(data.level-1)*200,bossDefeated:false}); });
      await batch.commit(); localStorage.setItem('guildBossReset',now.toString()); toast(t('toast_guild_boss_reset'),false);
    } catch(e){ console.error('重置Boss失敗:',e); }
  }
}

async function loadRecommendAndRanking() {
  try {
    const snapshot = await guildsCollection.orderBy('level', 'desc').limit(20).get();
    const guilds = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      const totalContrib = Object.values(data.contribution || {}).reduce((a, b) => a + b, 0);
      guilds.push({
        id: doc.id,
        name: data.name,
        level: data.level || 1,
        members: data.members?.length || 0,
        contribution: totalContrib,
        bossDefeated: data.bossDefeated || false
      });
    });

    const recommend = guilds.filter(g => g.members < 10 && !g.bossDefeated).sort((a,b)=>b.level-a.level).slice(0,3);
    const recDiv = document.getElementById('guildRecommend');
    if (recDiv) {
      if (recommend.length === 0) recDiv.innerHTML = `<p style="color:#94a3b8;">${t('no_recommend')}</p>`;
      else recDiv.innerHTML = `<h4>${t('recommend')}</h4>` + recommend.map(g => `
        <div class="setting-item" style="font-size:0.8rem;">
          <div>🏛️ ${g.name} (Lv.${g.level})<br><span style="font-size:0.7rem;color:#94a3b8;">${t('member_count',{count:g.members})}</span></div>
          <button onclick="joinGuild('${g.name}')" class="game-action" style="padding:4px 12px;">${t('join_guild')}</button>
        </div>
      `).join('');
    }

    const rankDiv = document.getElementById('guildRanking');
    if (rankDiv) {
      const top10 = guilds.slice(0, 10);
      rankDiv.innerHTML = `<h4>${t('ranking')}</h4>` + top10.map((g, i) => `
        <div class="setting-item" style="font-size:0.8rem;">
          <div>${i+1}. ${g.name} (Lv.${g.level})<br><span style="font-size:0.7rem;color:#94a3b8;">${t('member_count',{count:g.members})} | 💰 ${g.contribution}</span></div>
          <span style="color:${i===0?'#facc15':i===1?'#94a3b8':i===2?'#cd7f32':'#475569'}">${i===0?'🥇':i===1?'🥈':i===2?'🥉':''}</span>
        </div>
      `).join('');
    }
  } catch (e) {
    console.error('載入推薦/排名失敗:', e);
  }
}

async function fetchGuildInfo() {
  if (!myGuild) {
    document.getElementById('guildInfo').innerHTML = `<p>${t('no_guild')}</p>`;
    document.getElementById('guildActions').innerHTML = `
      <input type="text" id="guildNameInput" placeholder="${t('guild_name_placeholder')}" style="background:#0f172a;color:#fff;padding:8px;border-radius:20px;">
      <button id="createGuildBtn" class="play-btn" style="width:auto;margin-top:8px;">${t('create_guild',{gold:1000})}</button>
      <button id="joinGuildBtn" class="play-btn" style="width:auto;margin-top:8px;">${t('join_guild')}</button>
      <div id="guildRecommend" style="margin-top:16px;text-align:left;"></div>
      <div id="guildRanking" style="margin-top:16px;text-align:left;"></div>
    `;
    document.getElementById('createGuildBtn')?.addEventListener('click', () => {
      const n = document.getElementById('guildNameInput').value;
      if (n) createGuild(n);
    });
    document.getElementById('joinGuildBtn')?.addEventListener('click', () => {
      const n = document.getElementById('guildNameInput').value;
      if (n) joinGuild(n);
    });
    await loadRecommendAndRanking();
    return;
  }
  try {
    const doc = await guildsCollection.doc(myGuild).get();
    if (!doc.exists) { toast(t('toast_guild_not_found'),true); myGuild=null; localStorage.removeItem('myGuild'); renderGuildUI(); return; }
    const data = doc.data();
    const myC = data.contribution[currentUser?.uid] || 0;
    document.getElementById('guildInfo').innerHTML = `
      <div>${t('guild_level',{name:data.name,level:data.level})} ${t('guild_exp',{exp:data.exp,max:data.level*100})}</div>
      <div>${t('guild_atk_bonus',{bonus:data.level*2})}</div>
      <div>${t('member_count',{count:data.members.length})}</div>
      <div>${t('contribution',{value:myC})}</div>
      <div>${t('guild_boss')}: ${data.bossHp}/${data.bossMaxHp} ${data.bossDefeated?'✅':''}</div>
    `;
    document.getElementById('guildActions').innerHTML = `
      <button id="d100" class="game-action">${t('donate',{amount:100})}</button>
      <button id="d500" class="game-action">${t('donate',{amount:500})}</button>
      <button id="d1000" class="game-action">${t('donate',{amount:1000})}</button>
      <button id="attackBossBtn" class="game-action" ${data.bossDefeated?'disabled':''}>${t('guild_boss_challenge')}</button>
      <button id="leaveBtn" class="game-action" style="background:#ef4444;">${t('leave_guild')}</button>
      <div id="guildShop"></div>
    `;
    document.getElementById('d100')?.addEventListener('click', () => donateGuild(100));
    document.getElementById('d500')?.addEventListener('click', () => donateGuild(500));
    document.getElementById('d1000')?.addEventListener('click', () => donateGuild(1000));
    document.getElementById('attackBossBtn')?.addEventListener('click', attackGuildBoss);
    document.getElementById('leaveBtn')?.addEventListener('click', leaveGuild);
    const shop = document.getElementById('guildShop');
    shop.innerHTML = `<div class="setting-item"><div>${t('guild_shop')}</div><button id="buyGuildEq" ${myC<200?'disabled':''}>${t('guild_shop_cost',{cost:200})}</button></div>`;
    document.getElementById('buyGuildEq')?.addEventListener('click', async () => {
      if (myC >= 200) {
        await guildsCollection.doc(myGuild).update({[`contribution.${currentUser.uid}`]: firebase.firestore.FieldValue.increment(-200)});
        const e = genEq(); e.quality = '稀有'; G.equipment.push(e); applyEq();
        toast(t('toast_buy_equip',{name:e.name}), false); saveGame(); renderGuildUI();
      } else toast(t('toast_insufficient_contribution'), true);
    });
  } catch (e) {
    toast(t('toast_connect_error'), true);
  }
}

function renderGuildUI(){ document.getElementById('guildInfo').innerHTML=t('guild_loading'); document.getElementById('guildActions').innerHTML=''; fetchGuildInfo(); }
resetGuildBossIfNeeded();

// ============================================================
//  ⚔️ 戰鬥核心
// ============================================================
