// ============================================================
//  🔥 Firebase 設定
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyDevirfNqjlg5hVkF6pgMMU9tfx7CDac4A",
  authDomain: "monster-game-f193f.firebaseapp.com",
  databaseURL: "https://monster-game-f193f-default-rtdb.firebaseio.com",
  projectId: "monster-game-f193f",
  storageBucket: "monster-game-f193f.firebasestorage.app",
  messagingSenderId: "304101821779",
  appId: "1:304101821779:web:9b77e901083a7949f265a6",
  measurementId: "G-LDLS7KEDZ9"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth(), db = firebase.firestore(), provider = new firebase.auth.GoogleAuthProvider();

// ============================================================
//  🔒 Webhook URL
// ============================================================
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1503764494969475215/yj1L6PR8nVzbSEWomvEZYBas9Jx4_5KwQZJrvcrNUsBHcKx9nmI59bRGkOM7R_90yjb8';

// ============================================================
//  🎵 音樂與音效
// ============================================================
let actx=null, musicOn=true, musicTimer=null;
function getCtx(){ if(!actx)actx=new(window.AudioContext||window.webkitAudioContext)(); if(actx.state==='suspended')actx.resume(); return actx; }
function playTone(f,d,t='sine',v=0.15){ if(!musicOn)return; try{ const c=getCtx(), o=c.createOscillator(), g=c.createGain(); o.connect(g); g.connect(c.destination); o.frequency.value=f; o.type=t; g.gain.setValueAtTime(v,c.currentTime); g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+d); o.start(c.currentTime); o.stop(c.currentTime+d); }catch(e){} }
function playChord(n,d=0.4,v=0.08){ if(!musicOn)return; try{ const c=getCtx(); n.forEach(f=>{ const o=c.createOscillator(), g=c.createGain(); o.connect(g); g.connect(c.destination); o.frequency.value=f; o.type='sine'; g.gain.setValueAtTime(v,c.currentTime); g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+d); o.start(c.currentTime); o.stop(c.currentTime+d); }); }catch(e){} }
const SFX={attack:()=>{playTone(600,.08,'square',.12);setTimeout(()=>playTone(400,.06,'square',.08),60);},skill:()=>{playTone(880,.1,'square',.15);setTimeout(()=>playTone(1100,.12,'square',.1),80);},hurt:()=>{playTone(250,.2,'sawtooth',.12);setTimeout(()=>playTone(180,.25,'sawtooth',.1),100);},levelup:()=>{playChord([523,659,784],.15,.1);setTimeout(()=>playChord([784,988,1175],.2,.08),150);},defeat:()=>{playTone(392,.15,'sine',.12);setTimeout(()=>playTone(523,.25,'sine',.12),150);},boss:()=>{playTone(110,.4,'sawtooth',.2);setTimeout(()=>playTone(82,.6,'sawtooth',.2),300);},equip:()=>{playTone(600,.06,'sine',.1);setTimeout(()=>playTone(800,.08,'sine',.08),80);},gold:()=>{playTone(1000,.05,'sine',.08);setTimeout(()=>playTone(1200,.06,'sine',.06),60);}};
const MEL=[[523,659,784],[587,740,880],[523,659,784],[494,659,880],[523,659,784],[587,740,880],[523,659,784],[880,988,1175]], BASS=[130,146,130,123,130,146,130,110];
function playMusic(){ if(!musicOn){ stopMusic(); return; } if(musicTimer)return; let b=0; musicTimer=setInterval(()=>{ if(!musicOn){ stopMusic(); return; } try{ const c=getCtx(); const i=b%MEL.length; MEL[i].forEach((f,j)=>{ const o=c.createOscillator(), g=c.createGain(); o.connect(g); g.connect(c.destination); o.frequency.value=f; o.type='sine'; g.gain.setValueAtTime(j===0?.06:.04,c.currentTime); g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.6); o.start(c.currentTime); o.stop(c.currentTime+.6); }); const bo=c.createOscillator(), bg=c.createGain(); bo.connect(bg); bg.connect(c.destination); bo.frequency.value=BASS[i]; bo.type='triangle'; bg.gain.setValueAtTime(.08,c.currentTime); bg.gain.exponentialRampToValueAtTime(.001,c.currentTime+.4); bo.start(c.currentTime); bo.stop(c.currentTime+.4); if(b%2===0){ const buf=c.createBuffer(1,c.sampleRate*.02,c.sampleRate); const d=buf.getChannelData(0); for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length); const src=c.createBufferSource(), g=c.createGain(); src.buffer=buf; src.connect(g); g.connect(c.destination); g.gain.setValueAtTime(.04,c.currentTime); g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.04); src.start(c.currentTime); src.stop(c.currentTime+.04); } b++; }catch(e){} },600); }
function stopMusic(){ if(musicTimer){ clearInterval(musicTimer); musicTimer=null; } }
function toggleMusic(){ musicOn=!musicOn; const b=document.getElementById('musicToggleBtn'); if(b){ b.textContent=musicOn?'🔊':'🔇'; b.className='music-btn'+(musicOn?' on':''); } if(musicOn){ getCtx(); playMusic(); toast('🎵 音樂已開啟',false); } else { stopMusic(); toast('🔇 音樂已關閉',false); } }
document.addEventListener('click',()=>{ if(!actx){ getCtx(); if(musicOn)playMusic(); } },{once:true});
document.addEventListener('touchstart',()=>{ if(!actx){ getCtx(); if(musicOn)playMusic(); } },{once:true});

// ============================================================
//  📦 全域狀態
// ============================================================
const G = {
  lv:1, exp:0, hp:100, maxHp:100, atk:10, baseAtk:10, baseHp:100,
  gold:0, restUsed:false, difficulty:'normal', rebirthLevel:0,
  curMonster:null, deathStreak:0, lastDmg:0,
  totalKills:0, maxDamage:0, maxLevel:1,
  equipment:[],
  guild:{name:null, level:1, exp:0, members:[{uid:'player',contribution:0}]},
  achievements:{},
  stats:{playTime:0, totalGold:0, totalEquip:0, totalUpgrade:0, skillUsage:0, bossKills:0},
  autoBattle:false
};
let currentUser=null, signinStreak=0, myGuild=null;
let autoTimer=null;

// ============================================================
//  🛠️ 工具
// ============================================================
function toast(m,e){ const d=document.createElement('div');d.className='toast';d.textContent=m;d.style.color=e?'#ff8888':'#facc15';document.body.appendChild(d);setTimeout(()=>d.remove(),2000); }
function rand(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }
function dmgFloat(x,y,t,c='#ff6b6b'){ const e=document.createElement('div');e.className='dmg-float';e.textContent=t;e.style.left=x+'px';e.style.top=y+'px';e.style.color=c;document.body.appendChild(e);setTimeout(()=>e.remove(),1000); }
function sanitizeInput(str){ return str.replace(/[<>"']/g, ''); }

// ============================================================
//  ⚡ 元素克制
// ============================================================
const ELEMS=['火','水','草','光','暗'], WEAK={'火':'草','水':'火','草':'水','光':'暗','暗':'光'};
function randElem(){ return ELEMS[rand(0,4)]; }
function elemBonus(a,d){ if(!a||a==='無')return 1; if(WEAK[a]===d)return 1.3; if(WEAK[d]===a)return 0.7; return 1; }

// ============================================================
//  🎒 裝備系統
// ============================================================
const QUAL=[{n:'普通',c:'#9ca3af',min:1,max:3,r:.5},{n:'優秀',c:'#4ade80',min:4,max:6,r:.3},{n:'稀有',c:'#3b82f6',min:7,max:10,r:.15},{n:'史詩',c:'#a855f7',min:11,max:15,r:.05}];
function randQ(){ let r=Math.random(),a=0; for(let q of QUAL)if((a+=q.r)>r)return q; return QUAL[0]; }
function genEq(){ let t=rand(0,1)?'w':'a', q=randQ(), b=rand(q.min,q.max), e=Math.random()<.3?randElem():'無'; return {id:Date.now()+'-'+Math.random(), type:t, quality:q.n, color:q.c, bonus:b, name:`${q.n} ${t==='w'?'武':'防'}`, equipped:false, level:0, element:e}; }
function eqBonus(){ let a=0,h=0; G.equipment.forEach(e=>{ if(e.equipped)e.type==='w'?a+=e.bonus:h+=e.bonus; }); return {atk:a,hp:h}; }
function playerElem(){ const w=G.equipment.find(e=>e.type==='w'&&e.equipped); return w?.element||'無'; }
function guildBuff(){ return G.guild.name?1+G.guild.level*.02:1; }
function applyEq(){ const b=eqBonus(), rb=1+G.rebirthLevel*.05, gb=guildBuff(); G.atk=Math.floor((G.baseAtk+b.atk)*rb*gb); G.maxHp=Math.floor((G.baseHp+b.hp)*rb); if(G.hp>G.maxHp)G.hp=G.maxHp; updateUI(); }
function upEq(id){ const i=G.equipment.find(e=>e.id==id); if(!i)return; const c=50*((i.level||0)+1); if(G.gold>=c){ G.gold-=c; i.level++; i.bonus+=2; G.stats.totalUpgrade++; SFX.equip(); toast(`${i.name} +${i.level}`,false); updateGold(); saveGame(); applyEq(); closeBag(); updateSeasonProgress('upgrade'); }else toast('金幣不足',true); }
function toggleEq(id){ const i=G.equipment.find(e=>e.id==id); if(!i)return; if(i.equipped){ i.equipped=false; toast(`卸下 ${i.name}`); }else{ const s=G.equipment.find(e=>e.type===i.type&&e.equipped); if(s)s.equipped=false; i.equipped=true; toast(`裝備 ${i.name}`); SFX.equip(); } applyEq(); saveGame(); closeBag(); }
function decomEq(t='普通'){ const o=['普通','優秀','稀有','史詩']; const idx=o.indexOf(t); let total=0; G.equipment=G.equipment.filter(e=>{ if(o.indexOf(e.quality)<idx&&!e.equipped){ total+=10; return false; } return true; }); if(total>0){ G.gold+=total; G.stats.totalGold+=total; SFX.gold(); toast(`分解得 ${total}金`,false); saveGame(); applyEq(); }else toast('無可分解',true); closeBag(); }
function closeBag(){ const o=document.querySelector('.backpack-overlay'); if(o)o.remove(); }
function showBag(){
  closeBag();
  const ov=document.createElement('div'); ov.className='backpack-overlay';
  const cd=document.createElement('div'); cd.className='backpack-card';
  cd.innerHTML='<h3>🎒 背包</h3>';
  const dd=document.createElement('div'); dd.style.display='flex'; dd.style.justifyContent='space-between'; dd.style.marginBottom='12px';
  const sel=document.createElement('select'); sel.innerHTML='<option value="普通">普通及以下</option><option value="優秀">優秀及以下</option><option value="稀有">稀有及以下</option>'; sel.style.background='#0f172a'; sel.style.color='#fff'; sel.style.borderRadius='20px';
  const btn=document.createElement('button'); btn.textContent='分解'; btn.style.background='#ef4444'; btn.style.border='none'; btn.style.padding='4px 12px'; btn.style.borderRadius='20px'; btn.onclick=()=>{ decomEq(sel.value); };
  dd.appendChild(sel); dd.appendChild(btn); cd.appendChild(dd);
  if(!G.equipment.length)cd.innerHTML+='<p>無裝備</p>';
  else G.equipment.forEach(e=>{
    const d=document.createElement('div'); d.className='backpack-item'; d.style.borderLeftColor=e.color;
    d.innerHTML=`<span style="color:${e.color}">${e.name}+${e.bonus} (${e.element}) +${e.level||0}</span><div><button class="eqBtn">${e.equipped?'卸下':'裝'}</button><button class="upBtn">強化</button></div>`;
    d.querySelector('.eqBtn').onclick=()=>{ toggleEq(e.id); };
    d.querySelector('.upBtn').onclick=()=>{ upEq(e.id); };
    cd.appendChild(d);
  });
  const cl=document.createElement('button'); cl.textContent='關閉'; cl.className='close-backpack'; cl.onclick=closeBag;
  cd.appendChild(cl); ov.appendChild(cd); document.body.appendChild(ov);
}

// ============================================================
//  💰 金幣
// ============================================================
function updateGold(){ const g=document.getElementById('goldGame'); if(g)g.textContent=G.gold; }
function addGold(a){ G.gold+=a; G.stats.totalGold+=a; SFX.gold(); updateGold(); saveGame(); }

// ============================================================
//  📅 每日 & 簽到
// ============================================================
function canDaily(){ return localStorage.getItem('lastDaily')!==new Date().toDateString(); }
function claimDaily(){
  if(!canDaily()){ toast('今日已領',true); return; }
  const r=rand(1,3);
  if(r===1){ G.exp+=20; toast('🎁20EXP',false); levelUp(); }
  else if(r===2){ const e=genEq(); G.equipment.push(e); G.stats.totalEquip++; SFX.equip(); toast(`🎁${e.name}`,false); if(!G.equipment.some(x=>x.type===e.type&&x.equipped)){ e.equipped=true; applyEq(); toast('✨自動裝',false); } updateSeasonProgress('equip'); }
  else { G.hp=Math.min(G.maxHp,G.hp+50); toast('🎁50HP',false); }
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
  toast(`簽到！連續${signinStreak}天 +${r}金`,false);
  document.getElementById('signinStreak').textContent=signinStreak;
  localStorage.setItem('signinStreak',signinStreak);
  if(signinStreak===7){ toast('🎉 連續7天！史詩裝備箱！',false); const e=genEq(); e.quality='史詩'; G.equipment.push(e); G.stats.totalEquip++; SFX.equip(); saveGame(); }
  if(signinStreak===30){ toast('🎉 連續30天！稱號「傳奇」！',false); localStorage.setItem('title','傳奇'); }
}

// ============================================================
//  🔄 轉生
// ============================================================
function canRebirth(){ return G.lv>=100 && G.rebirthLevel<10; }
function doRebirth(){
  if(!canRebirth()){ toast('需Lv100且<10次轉生',true); return; }
  G.rebirthLevel++; G.lv=1; G.exp=0;
  G.baseAtk=10+G.rebirthLevel*2; G.baseHp=100+G.rebirthLevel*20;
  G.hp=G.maxHp;
  applyEq(); refreshMonster(); saveGame();
  SFX.levelup();
  toast(`✨轉生成功！Lv.${G.rebirthLevel}`,false);
  updateUI();
  checkAchievements();
}

// ============================================================
//  🏛️ 公會系統（完整）
// ============================================================
const guildsCollection = db.collection('guilds');
myGuild = localStorage.getItem('myGuild') || null;

async function createGuild(guildName) {
  if (!currentUser) return toast('請先登入', true);
  if (myGuild) return toast('您已有公會', true);
  if (G.gold < 1000) return toast('需要 1000 金幣', true);
  const cleanName = sanitizeInput(guildName.trim());
  if (!cleanName) return toast('請輸入有效名稱', true);
  try {
    const docRef = guildsCollection.doc(cleanName);
    const doc = await docRef.get();
    if (doc.exists) return toast('公會名稱已存在', true);
    await docRef.set({
      name: cleanName,
      members: [currentUser.uid],
      contribution: { [currentUser.uid]: 0 },
      bossHp: 1000,
      bossMaxHp: 1000,
      bossDefeated: false,
      level: 1,
      exp: 0,
      createdAt: Date.now()
    });
    G.gold -= 1000;
    myGuild = cleanName;
    localStorage.setItem('myGuild', myGuild);
    updateGold();
    toast(`公會「${cleanName}」創建成功！`, false);
    renderGuildUI();
    saveGame();
    checkAchievements();
  } catch (e) { toast('創建失敗: ' + e.message, true); }
}

async function joinGuild(guildName) {
  if (!currentUser) return toast('請先登入', true);
  if (myGuild) return toast('您已有公會', true);
  const cleanName = sanitizeInput(guildName.trim());
  if (!cleanName) return toast('請輸入公會名稱', true);
  try {
    const docRef = guildsCollection.doc(cleanName);
    const doc = await docRef.get();
    if (!doc.exists) return toast('公會不存在', true);
    await docRef.update({
      members: firebase.firestore.FieldValue.arrayUnion(currentUser.uid),
      [`contribution.${currentUser.uid}`]: 0
    });
    myGuild = cleanName;
    localStorage.setItem('myGuild', myGuild);
    toast(`加入「${cleanName}」成功！`, false);
    renderGuildUI();
    checkAchievements();
  } catch (e) { toast('加入失敗: ' + e.message, true); }
}

async function leaveGuild() {
  if (!myGuild) return toast('您未加入任何公會', true);
  if (!confirm('確定要退出公會嗎？')) return;
  try {
    const docRef = guildsCollection.doc(myGuild);
    await docRef.update({
      members: firebase.firestore.FieldValue.arrayRemove(currentUser.uid),
      [`contribution.${currentUser.uid}`]: firebase.firestore.FieldValue.delete()
    });
    myGuild = null;
    localStorage.removeItem('myGuild');
    toast('已退出公會', false);
    renderGuildUI();
  } catch (e) { toast('退出失敗: ' + e.message, true); }
}

async function donateGold(amount) {
  if (!myGuild) return toast('請先加入公會', true);
  if (G.gold < amount) return toast('金幣不足', true);
  try {
    const docRef = guildsCollection.doc(myGuild);
    const contribution = Math.floor(amount / 10);
    await docRef.update({
      [`contribution.${currentUser.uid}`]: firebase.firestore.FieldValue.increment(contribution),
      exp: firebase.firestore.FieldValue.increment(contribution)
    });
    G.gold -= amount;
    updateGold();
    saveGame();
    const doc = await docRef.get();
    const data = doc.data();
    while (data.exp >= data.level * 100) {
      await docRef.update({
        exp: firebase.firestore.FieldValue.increment(-data.level * 100),
        level: firebase.firestore.FieldValue.increment(1)
      });
      toast(`公會升至 Lv.${data.level + 1}！`, false);
      applyEq();
    }
    toast(`捐獻 ${amount} 金，獲得 ${contribution} 貢獻值`, false);
    renderGuildUI();
    checkAchievements();
    updateSeasonProgress('donate');
  } catch (e) { toast('捐獻失敗: ' + e.message, true); }
}

async function attackGuildBoss() {
  if (!myGuild) return toast('請先加入公會', true);
  if (G.hp <= 0) return toast('HP 不足', true);
  try {
    const docRef = guildsCollection.doc(myGuild);
    const doc = await docRef.get();
    const data = doc.data();
    if (data.bossDefeated) return toast('本週 Boss 已被擊敗！', true);
    const damage = rand(G.atk - 5, G.atk + 15);
    const newHp = Math.max(0, data.bossHp - damage);
    await docRef.update({
      bossHp: newHp,
      [`contribution.${currentUser.uid}`]: firebase.firestore.FieldValue.increment(damage)
    });
    const counter = rand(5, 20);
    G.hp = Math.max(0, G.hp - counter);
    if (G.hp === 0) { G.hp = G.maxHp; G.restUsed = false; toast('💀 你被 Boss 擊敗，已復活', true); }
    updateUI();
    saveGame();
    if (newHp <= 0) {
      await docRef.update({ bossDefeated: true, bossHp: 0 });
      addGold(500);
      toast('🎉 公會 Boss 已被擊敗！獲得 500 金幣獎勵！', false);
    } else {
      toast(`對 Boss 造成 ${damage} 傷害！剩餘 HP: ${newHp}/${data.bossMaxHp}`, false);
    }
    renderGuildUI();
  } catch (e) { toast('Boss 戰鬥失敗: ' + e.message, true); }
}

async function resetGuildBossIfNeeded() {
  const lastReset = localStorage.getItem('guildBossReset');
  const now = Date.now();
  const week = 7 * 24 * 60 * 60 * 1000;
  if (!lastReset || now - parseInt(lastReset) > week) {
    const snapshot = await guildsCollection.get();
    const batch = db.batch();
    snapshot.forEach(doc => {
      const ref = doc.ref;
      batch.update(ref, {
        bossHp: 1000 + (doc.data().level - 1) * 200,
        bossMaxHp: 1000 + (doc.data().level - 1) * 200,
        bossDefeated: false
      });
    });
    await batch.commit();
    localStorage.setItem('guildBossReset', now.toString());
    toast('🔄 公會 Boss 已重置', false);
  }
}

async function fetchGuildInfo() {
  if (!myGuild) {
    document.getElementById('guildInfo').innerHTML = '<p>尚未加入公會</p>';
    document.getElementById('guildActions').innerHTML = `
      <input type="text" id="guildNameInput" placeholder="公會名稱" style="background:#0f172a;color:#fff;padding:8px;border-radius:20px;">
      <button id="createGuildBtn" class="play-btn" style="width:auto;margin-top:8px;">創建 (1000金)</button>
      <button id="joinGuildBtn" class="play-btn" style="width:auto;margin-top:8px;">加入</button>
    `;
    document.getElementById('createGuildBtn')?.addEventListener('click', () => {
      const name = document.getElementById('guildNameInput').value;
      if (name) createGuild(name);
    });
    document.getElementById('joinGuildBtn')?.addEventListener('click', () => {
      const name = document.getElementById('guildNameInput').value;
      if (name) joinGuild(name);
    });
    return;
  }
  try {
    const doc = await guildsCollection.doc(myGuild).get();
    if (!doc.exists) { toast('公會資料不存在', true); myGuild = null; localStorage.removeItem('myGuild'); renderGuildUI(); return; }
    const data = doc.data();
    const myContrib = data.contribution[currentUser?.uid] || 0;
    document.getElementById('guildInfo').innerHTML = `
      <div>🏛️ ${data.name} Lv.${data.level} (${data.exp}/${data.level*100})</div>
      <div>📈 全體攻擊 +${data.level*2}%</div>
      <div>👥 成員: ${data.members.length} 人</div>
      <div>💰 我的貢獻: ${myContrib}</div>
      <div>👾 Boss HP: ${data.bossHp}/${data.bossMaxHp} ${data.bossDefeated?'✅已擊敗':''}</div>
    `;
    document.getElementById('guildActions').innerHTML = `
      <button id="donate100Btn" class="game-action">捐100金</button>
      <button id="donate500Btn" class="game-action">捐500金</button>
      <button id="donate1000Btn" class="game-action">捐1000金</button>
      <button id="attackBossBtn" class="game-action" ${data.bossDefeated?'disabled':''}>⚔️ Boss</button>
      <button id="leaveGuildBtn" class="game-action" style="background:#ef4444;">退出公會</button>
      <div id="guildShop"></div>
    `;
    document.getElementById('donate100Btn')?.addEventListener('click', () => donateGold(100));
    document.getElementById('donate500Btn')?.addEventListener('click', () => donateGold(500));
    document.getElementById('donate1000Btn')?.addEventListener('click', () => donateGold(1000));
    document.getElementById('attackBossBtn')?.addEventListener('click', attackGuildBoss);
    document.getElementById('leaveGuildBtn')?.addEventListener('click', leaveGuild);
    const shopDiv = document.getElementById('guildShop');
    shopDiv.innerHTML = `
      <div class="setting-item"><div>🎁 稀有裝備箱</div><button id="buyGuildEq" ${myContrib<200?'disabled':''}>200貢獻</button></div>
    `;
    document.getElementById('buyGuildEq')?.addEventListener('click', async () => {
      if (myContrib >= 200) {
        await guildsCollection.doc(myGuild).update({
          [`contribution.${currentUser.uid}`]: firebase.firestore.FieldValue.increment(-200)
        });
        const eq = generateEquipment();
        eq.quality = '稀有';
        G.equipment.push(eq);
        toast(`獲得 ${eq.name}+${eq.bonus}`, false);
        saveGame();
        renderGuildUI();
      } else { toast('貢獻不足', true); }
    });
  } catch (e) { toast('載入公會資訊失敗: ' + e.message, true); }
}

function renderGuildUI() {
  document.getElementById('guildInfo').innerHTML = '載入中...';
  document.getElementById('guildActions').innerHTML = '';
  fetchGuildInfo();
}
resetGuildBossIfNeeded();

// ============================================================
//  ⚔️ 戰鬥核心
// ============================================================
const ZONES=[
  {n:"🌳新手村",max:30,m:["🟣史萊姆","🟢哥布林","🐺森林狼","🦇蝙蝠","🌿樹精"]},
  {n:"🏜️沙漠",max:90,m:["🦂巨蠍","🧻木乃伊","🐍沙蛇","🦅沙鷹","🏺詛咒陶罐"]},
  {n:"⛰️蒼穹",max:100,m:["🐉青龍","👼天使","😈惡魔","✨星辰之靈","🌙月獸"]}
];
const SKILLS=[
  {n:'毒擊',e:'🌿',m:1.2},{n:'砂塵',e:'🏜️',m:1.0},
  {n:'龍息',e:'🐉',m:1.5},{n:'閃電',e:'⚡',m:1.3},
  {n:'冰霜',e:'❄️',m:1.1},{n:'治癒',e:'💚',h:15}
];
function isBoss(l){ return l%10===0; }
const BOSS=["新手守護者","沙暴領主","蒼穹巨龍","深淵魔王","永凍冰凰","雷霆泰坦","暗影幽靈","黃金獅鷲","時間守護者","終焉之神"];
function getZone(){ return G.lv<=30?ZONES[0]:G.lv<=90?ZONES[1]:ZONES[2]; }
function getMult(){
  switch(G.difficulty){
    case 'easy':return {hp:.7,atk:.7,exp:1.1,off:-2};
    case 'hard':return {hp:1.5,atk:1.3,exp:.85,off:3};
    case 'extreme':return {hp:2.0,atk:1.6,exp:.7,off:6};
    default:return {hp:1,atk:1,exp:1,off:0};
  }
}
function genMonster(){
  const b=isBoss(G.lv); let emoji,name,skill,elem=randElem();
  if(b){ emoji="👑"; name=BOSS[Math.floor((G.lv-1)/10)]||"上古Boss"; skill=SKILLS[rand(0,SKILLS.length-1)]; }
  else { const z=getZone(), raw=z.m[rand(0,z.m.length-1)]; emoji=raw[0]; name=raw.slice(1); skill=SKILLS[rand(0,SKILLS.length-1)]; }
  const m=getMult(); let off=m.off;
  if(G.deathStreak>=3&&G.difficulty!=='easy')off=Math.max(-5, off-Math.floor(G.deathStreak/2));
  let lv=Math.max(1, G.lv+off);
  if(b)lv=G.lv+2;
  let hp=(30+lv*2.5)*m.hp, atk=(5+Math.floor(lv/2.5))*m.atk;
  if(b){ hp*=2; atk*=1.5; }
  const vf=v=>Math.floor(v*(.6+Math.random()*.8));
  let exp=Math.max(1,Math.floor((12+lv*.8)*m.exp));
  if(b)exp*=3;
  return {emoji,name,lv,hp:vf(hp),maxHp:vf(hp),atk:vf(atk),exp,skill,isBoss:b,element:elem};
}
function refreshMonster(){ G.curMonster=genMonster(); G.restUsed=false; updateUI(); log(`✨ ${G.curMonster.isBoss?'👑BOSS ':''}${G.curMonster.emoji}${G.curMonster.name} Lv.${G.curMonster.lv} HP${G.curMonster.hp} ${G.curMonster.element}`); if(G.curMonster.isBoss)SFX.boss(); }
function levelUp(){
  let up=false;
  while(G.exp>=50){
    G.exp-=50; G.lv++; G.baseHp+=20; G.baseAtk+=5;
    const b=eqBonus();
    G.maxHp=Math.floor(G.baseHp+b.hp);
    G.hp=G.maxHp;
    up=true;
    log(`🎉 升 Lv${G.lv}`);
    if(G.lv>G.maxLevel)G.maxLevel=G.lv;
  }
  if(up){ SFX.levelup(); applyEq(); refreshMonster(); }
  saveGame();
}
function monsterCounter(){
  if(!G.curMonster)return;
  const d=rand(G.curMonster.atk-3,G.curMonster.atk+2);
  G.hp-=d; SFX.hurt(); log(`😈 反擊 ${d}`);
  if(G.hp<=0){ G.hp=G.maxHp; G.restUsed=false; G.deathStreak++; log('💀復活'); }
  else G.deathStreak=0;
  updateUI(); saveGame();
}
function defeatMonster(){
  if(!G.curMonster)return;
  G.exp+=G.curMonster.exp;
  const g=rand(10,G.curMonster.isBoss?100:30);
  addGold(g); SFX.defeat();
  log(`🎉 +${G.curMonster.exp}EXP +${g}💰`);
  G.totalKills++;
  if(G.lastDmg>G.maxDamage)G.maxDamage=G.lastDmg;
  if(G.curMonster.isBoss){ G.stats.bossKills=(G.stats.bossKills||0)+1; updateSeasonProgress('boss'); }
  if(Math.random()<.3||G.curMonster.isBoss){
    const e=genEq();
    if(G.curMonster.isBoss)e.quality='史詩';
    G.equipment.push(e); G.stats.totalEquip++;
    SFX.equip();
    toast(`🎁獲得 ${e.name}`,false);
    if(!G.equipment.some(x=>x.type===e.type&&x.equipped)){ e.equipped=true; applyEq(); toast('✨自動裝',false); }
    updateSeasonProgress('equip');
  }
  levelUp();
  refreshMonster();
  updateUI();
  saveGame();
  checkAchievements();
}
function attack(){
  if(G.hp<=0){ log('無法攻擊'); return; }
  if(!G.curMonster)refreshMonster();
  const base=rand(G.atk-3,G.atk+5);
  const eb=elemBonus(playerElem(), G.curMonster.element);
  const d=Math.floor(base*eb);
  G.lastDmg=d;
  G.curMonster.hp-=d;
  SFX.attack();
  const rect=document.getElementById('attackBtn').getBoundingClientRect();
  dmgFloat(rect.left+20, rect.top-20, '-'+d, d>20?'#ff6b6b':'#ffd93d');
  log(`⚔️ ${d}傷${eb>1?' 克制!':''}`);
  if(playerElem()!=='無'){
    let used = JSON.parse(localStorage.getItem('elements_used')||'[]');
    if(!used.includes(playerElem())){ used.push(playerElem()); localStorage.setItem('elements_used',JSON.stringify(used)); }
  }
  updateSeasonProgress('attack');
  if(G.curMonster.hp<=0)defeatMonster();
  else monsterCounter();
  updateUI(); saveGame();
  if(d>G.atk*1.5){ document.body.classList.add('flash'); setTimeout(()=>document.body.classList.remove('flash'),200); }
}
function showSkill(){
  const ov=document.createElement('div'); ov.className='skill-menu-overlay';
  const cd=document.createElement('div'); cd.className='skill-menu-card'; cd.innerHTML='<h3>選技能</h3>';
  const list=[
    {n:'火焰拳', d:a=>rand(a+8,a*2+5), e:'🔥'},
    {n:'水槍', d:a=>rand(a+5,a*2+2), e:'💧'},
    {n:'雷電', d:a=>rand(a+10,a*2+8), e:'⚡'},
    {n:'治癒', h:30, e:'💚'}
  ];
  list.forEach(s=>{
    const b=document.createElement('button');
    b.textContent=s.n==='治癒'?`${s.n} (+${s.h}HP)`:s.n;
    b.onclick=()=>{
      document.body.removeChild(ov);
      if(G.hp<=0){ log('無法施放'); return; }
      if(s.n==='治癒'){
        G.hp=Math.min(G.maxHp,G.hp+s.h);
        log(`✨恢復${s.h}HP`);
        updateUI(); saveGame();
        SFX.skill();
      } else {
        if(!G.curMonster){ log('沒有怪物'); return; }
        let d=s.d(G.atk);
        const eb=elemBonus(playerElem(), G.curMonster.element);
        d=Math.floor(d*eb);
        G.lastDmg=d;
        G.curMonster.hp-=d;
        G.stats.skillUsage++;
        SFX.skill();
        log(`✨${s.e} ${d}傷`);
        if(G.curMonster.hp<=0)defeatMonster();
        else monsterCounter();
        updateUI(); saveGame();
        checkAchievements();
      }
    };
    cd.appendChild(b);
  });
  const c=document.createElement('button'); c.textContent='取消'; c.onclick=()=>document.body.removeChild(ov);
  cd.appendChild(c); ov.appendChild(cd); document.body.appendChild(ov);
}
function rest(){
  if(G.restUsed){ log('已休息過'); return; }
  if(G.hp<=0){ log('無法休息'); return; }
  if(!G.curMonster){ log('沒有怪物'); return; }
  G.hp=Math.min(G.maxHp,G.hp+30);
  G.restUsed=true;
  log(`😴恢復30HP`);
  const s=rand(G.curMonster.atk-2,G.curMonster.atk+1);
  G.hp=Math.max(0,G.hp-s);
  if(s>0)SFX.hurt();
  log(`⚠️偷襲-${s}`);
  if(G.hp<=0){ G.hp=G.maxHp; G.restUsed=false; SFX.hurt(); log('💀復活'); }
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
    if(diff>1){
      const g=Math.floor(10*Math.min(diff,24)), e=Math.floor(5*Math.min(diff,24));
      addGold(g); G.exp+=e;
      while(G.exp>=50)levelUp();
      toast(`離線 ${Math.floor(diff)}小時 +${g}金 +${e}EXP`,false);
    }
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
  document.getElementById('buyEq')?.addEventListener('click',()=>{
    if(G.gold>=100){ G.gold-=100; const e=genEq(); G.equipment.push(e); G.stats.totalEquip++; SFX.equip(); toast(`獲得 ${e.name}`,false); if(!G.equipment.some(x=>x.type===e.type&&x.equipped)){ e.equipped=true; applyEq(); toast('✨自動裝',false); } updateGold(); saveGame(); checkAchievements(); updateSeasonProgress('equip'); }
    else toast('金幣不足',true);
  });
  document.getElementById('buyExp')?.addEventListener('click',()=>{
    if(G.gold>=150){ G.gold-=150; G.exp+=30; SFX.skill(); toast('🧪 +30EXP',false); levelUp(); updateGold(); saveGame(); }
    else toast('金幣不足',true);
  });
  document.getElementById('buyRev')?.addEventListener('click',()=>{
    if(G.gold>=200){ G.gold-=200; localStorage.setItem('revive','true'); SFX.equip(); toast('💊 復活石',false); updateGold(); saveGame(); }
    else toast('金幣不足',true);
  });
  document.getElementById('buyPet')?.addEventListener('click',()=>{
    if(G.gold>=300){ G.gold-=300; localStorage.setItem('pet','true'); SFX.levelup(); toast('🐕 寵物！攻擊+5%',false); G.baseAtk=Math.floor(G.baseAtk*1.05); applyEq(); updateGold(); saveGame(); }
    else toast('金幣不足',true);
  });
}
function checkDailyUI(){ const d=document.getElementById('dailyRewardStatus'); if(d)d.innerHTML=canDaily()?'⭐可領取':'✅已領'; }

// ============================================================
//  ⚙️ 設定
// ============================================================
function renderSettings(){
  const c=document.getElementById('settingsList');
  if(!c)return;
  const vol=localStorage.volume?parseFloat(localStorage.volume)*100:70;
  c.innerHTML=`
    <div class="setting-item"><div>🔊音量</div><input type="range" id="volSlider" min="0" max="100" value="${vol}"></div>
    <div class="setting-item"><div>🎵音樂</div><button id="musicToggleSettingBtn" class="music-btn ${musicOn?'on':''}" style="width:auto;padding:4px 16px;border-radius:20px;">${musicOn?'🔊 開啟':'🔇 關閉'}</button></div>
    <div class="setting-item"><div>⚔️難度</div><select id="diffSelect"><option value="easy" ${G.difficulty==='easy'?'selected':''}>簡單</option><option value="normal" ${G.difficulty==='normal'?'selected':''}>普通</option><option value="hard" ${G.difficulty==='hard'?'selected':''}>困難</option><option value="extreme" ${G.difficulty==='extreme'?'selected':''}>極限</option></select></div>
    <div class="setting-item"><div>🔐Google</div><div><button id="googleBtn" style="background:#334155;padding:6px 12px;">登入</button> <button id="logoutBtn" style="background:#334155;padding:6px 12px;">登出</button></div></div>
    <div class="setting-item"><div>🏆成就</div><div>${Object.values(G.achievements).filter(v=>v).length}/${ACHIEVEMENTS.length}</div></div>
    <div class="setting-item"><div>📌 版本</div><div>v8.0</div></div>
    <div class="setting-item"><div>🔄 更新</div><button id="checkUpdateBtn" style="background:#3b82f6;color:#fff;border:none;padding:6px 12px;border-radius:30px;">檢查</button></div>
    <div class="setting-item"><div style="color:#f87171;">⚠️重置</div><button id="resetGameBtn" style="background:#ef4444;color:#fff;border:none;padding:6px 12px;border-radius:30px;">重置</button></div>
  `;
  document.getElementById('volSlider')?.addEventListener('input',e=>localStorage.setItem('volume',e.target.value/100));
  document.getElementById('musicToggleSettingBtn')?.addEventListener('click',toggleMusic);
  document.getElementById('diffSelect')?.addEventListener('change',e=>{ G.difficulty=e.target.value; localStorage.setItem('difficulty',G.difficulty); refreshMonster(); toast(`難度:${G.difficulty}`); });
  document.getElementById('googleBtn')?.addEventListener('click',googleLogin);
  document.getElementById('logoutBtn')?.addEventListener('click',googleLogout);
  document.getElementById('checkUpdateBtn')?.addEventListener('click',()=>toast('已是最新版本',false));
  document.getElementById('resetGameBtn')?.addEventListener('click',()=>{ if(confirm('確定重置？')){ localStorage.clear(); location.reload(); } });
  if(currentUser){ const g=document.getElementById('googleBtn'); if(g){ g.textContent=`👤 ${currentUser.displayName}`; g.disabled=true; } }
}

// ============================================================
//  🏆 成就系統
// ============================================================
const ACHIEVEMENTS = [
  { id:'first_blood', name:'第一滴血', desc:'擊殺第1隻怪物', icon:'🩸', check:()=>G.totalKills>=1, reward:50 },
  { id:'hundred_kills', name:'百人斬', desc:'擊殺100隻怪物', icon:'⚔️', check:()=>G.totalKills>=100, reward:200 },
  { id:'thousand_kills', name:'千人斬', desc:'擊殺1000隻怪物', icon:'💀', check:()=>G.totalKills>=1000, reward:500 },
  { id:'first_upgrade', name:'強化新手', desc:'強化1次裝備', icon:'🔧', check:()=>G.stats.totalUpgrade>=1, reward:50 },
  { id:'master_upgrade', name:'強化大師', desc:'強化10次裝備', icon:'🔨', check:()=>G.stats.totalUpgrade>=10, reward:300 },
  { id:'collector', name:'裝備收藏家', desc:'獲得5件裝備', icon:'📦', check:()=>G.stats.totalEquip>=5, reward:100 },
  { id:'guild_member', name:'公會成員', desc:'創建或加入公會', icon:'🏛️', check:()=>G.guild.name!==null, reward:100 },
  { id:'guild_contributor', name:'公會貢獻者', desc:'貢獻值達100', icon:'💰', check:()=>{ const m=G.guild.members.find(x=>x.uid==='player'); return m?m.contribution>=100:false; }, reward:200 },
  { id:'element_master', name:'元素大師', desc:'使用3種不同元素攻擊', icon:'🔥', check:()=>{ const s=localStorage.getItem('elements_used'); return s?JSON.parse(s).length>=3:false; }, reward:150 },
  { id:'boss_hunter', name:'Boss獵人', desc:'擊殺5隻Boss', icon:'👑', check:()=>(G.stats.bossKills||0)>=5, reward:300 },
  { id:'rebirth_1', name:'轉生者', desc:'轉生1次', icon:'🔄', check:()=>G.rebirthLevel>=1, reward:500 },
  { id:'rebirth_5', name:'傳奇', desc:'轉生5次', icon:'🌟', check:()=>G.rebirthLevel>=5, reward:1000 }
];
function initAchievements(){
  const saved = localStorage.getItem('achievements');
  if(saved) G.achievements = JSON.parse(saved);
  else G.achievements = {};
  ACHIEVEMENTS.forEach(a=>{ if(!(a.id in G.achievements)) G.achievements[a.id]=false; });
}
function checkAchievements(){
  let unlocked = false;
  ACHIEVEMENTS.forEach(a=>{
    if(!G.achievements[a.id] && a.check()){
      G.achievements[a.id] = true;
      unlocked = true;
      addGold(a.reward);
      toast(`🏆 解鎖成就：${a.icon} ${a.name}！獎勵 ${a.reward} 金幣`, false);
      localStorage.setItem('achievements', JSON.stringify(G.achievements));
      saveGame();
    }
  });
  if(unlocked) renderAchievements();
}
function renderAchievements(){
  const container = document.getElementById('achievementList');
  if(!container) return;
  let html = '';
  ACHIEVEMENTS.forEach(a=>{
    const unlocked = G.achievements[a.id] || false;
    const status = unlocked ? '✅ 已解鎖' : '🔒 未解鎖';
    const cls = unlocked ? 'unlocked' : 'locked';
    html += `<div class="achievement-card ${cls}">
      <div class="ach-icon">${a.icon}</div>
      <div class="ach-info">
        <div class="ach-name">${a.name}</div>
        <div class="ach-desc">${a.desc}</div>
      </div>
      <div class="ach-status">${status}</div>
    </div>`;
  });
  container.innerHTML = html;
}

// ============================================================
//  ⚔️ PvP 竞技場
// ============================================================
let pvpHistory = JSON.parse(localStorage.getItem('pvpHistory') || '[]');
async function findOpponent() {
  if (!currentUser) return toast('請先登入', true);
  try {
    const snapshot = await db.collection('players').limit(20).get();
    const candidates = snapshot.docs
      .filter(doc => doc.id !== currentUser.uid)
      .map(doc => ({ uid: doc.id, ...doc.data() }));
    if (candidates.length === 0) { toast('沒有可用的對手', true); return null; }
    return candidates[Math.floor(Math.random() * candidates.length)];
  } catch (e) { toast('匹配對手失敗: ' + e.message, true); return null; }
}
async function startPvP() {
  if (G.hp <= 0) return toast('HP 不足', true);
  const opponent = await findOpponent();
  if (!opponent) return;
  const opp = {
    name: opponent.displayName || '未知玩家',
    lv: opponent.lv || 1,
    hp: opponent.hp || 100,
    maxHp: opponent.maxHp || 100,
    atk: opponent.atk || 10,
    element: opponent.playerElem || '無'
  };
  const backupHp = G.hp;
  let playerHp = G.hp;
  let oppHp = opp.hp;
  let round = 1;
  while (playerHp > 0 && oppHp > 0) {
    const pDmg = rand(G.atk - 3, G.atk + 5);
    oppHp = Math.max(0, oppHp - pDmg);
    if (oppHp <= 0) break;
    const aiDmg = rand(opp.atk - 3, opp.atk + 5);
    playerHp = Math.max(0, playerHp - aiDmg);
    round++;
  }
  let result = '';
  if (playerHp > 0 && oppHp <= 0) {
    result = 'win';
    const reward = 50 + rand(0, 50);
    addGold(reward);
    toast(`🏆 擊敗 ${opp.name}！獲得 ${reward} 金幣`, false);
    checkAchievements();
  } else if (oppHp > 0 && playerHp <= 0) {
    result = 'lose';
    toast(`💀 被 ${opp.name} 擊敗`, true);
    G.hp = G.maxHp;
    G.restUsed = false;
    updateUI();
  } else {
    result = 'draw';
    toast('平局', false);
  }
  pvpHistory.push({ opponent: opp.name, result: result, time: new Date().toISOString() });
  if (pvpHistory.length > 50) pvpHistory.shift();
  localStorage.setItem('pvpHistory', JSON.stringify(pvpHistory));
  G.hp = Math.min(G.maxHp, playerHp);
  updateUI();
  saveGame();
}
function renderPvPUI() {
  document.getElementById('pvpContent').innerHTML = `
    <div style="text-align:center;padding:16px;">
      <h3>⚔️ PvP 竞技場</h3>
      <button id="pvpFindBtn" class="play-btn" style="width:auto;margin:16px auto;">尋找對手</button>
      <div id="pvpHistory">
        <h4>最近戰鬥</h4>
        ${pvpHistory.slice(-5).map(h => `
          <div class="setting-item">
            <span>${h.opponent}</span>
            <span style="color:${h.result==='win'?'#4ade80':h.result==='lose'?'#ef4444':'#facc15'}">${h.result==='win'?'✅勝':h.result==='lose'?'❌敗':'⚖️平'}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  document.getElementById('pvpFindBtn')?.addEventListener('click', startPvP);
}

// ============================================================
//  🎖️ 賽季通行證
// ============================================================
const SEASON_ID = 'season_1';
const SEASON_EXP_PER_LEVEL = 100;
function loadSeasonData() {
  let data = localStorage.getItem('seasonData');
  if (data) return JSON.parse(data);
  return {
    level: 1,
    exp: 0,
    claimed: [],
    tasks: [
      { id: 's1', desc: '完成10次攻擊', target: 10, current: 0, reward: 100, claimed: false },
      { id: 's2', desc: '擊敗5隻Boss', target: 5, current: 0, reward: 200, claimed: false },
      { id: 's3', desc: '強化3次裝備', target: 3, current: 0, reward: 150, claimed: false },
      { id: 's4', desc: '捐獻公會2次', target: 2, current: 0, reward: 120, claimed: false },
      { id: 's5', desc: '獲得10件裝備', target: 10, current: 0, reward: 300, claimed: false }
    ]
  };
}
function saveSeasonData(data) { localStorage.setItem('seasonData', JSON.stringify(data)); }
function updateSeasonProgress(type, amount = 1) {
  const data = loadSeasonData();
  data.tasks.forEach(task => {
    if (task.claimed) return;
    if ((type === 'attack' && task.id === 's1') ||
        (type === 'boss' && task.id === 's2') ||
        (type === 'upgrade' && task.id === 's3') ||
        (type === 'donate' && task.id === 's4') ||
        (type === 'equip' && task.id === 's5')) {
      task.current = Math.min(task.target, task.current + amount);
      if (task.current >= task.target && !task.claimed) {
        task.claimed = true;
        data.exp += 20;
        toast(`📋 任務完成：${task.desc}，獲得 20 賽季經驗`, false);
        while (data.exp >= SEASON_EXP_PER_LEVEL) {
          data.exp -= SEASON_EXP_PER_LEVEL;
          data.level++;
          toast(`🎉 賽季等級提升至 ${data.level}！`, false);
        }
        saveSeasonData(data);
        renderSeasonUI();
      }
    }
  });
  saveSeasonData(data);
}
function claimSeasonReward(level) {
  const data = loadSeasonData();
  if (data.claimed.includes(level)) return toast('已領取', true);
  if (data.level < level) return toast('等級不足', true);
  const rewards = { 2: { gold: 200 }, 3: { equip: 'common' }, 5: { gold: 500 }, 7: { equip: 'rare' }, 10: { gold: 1000 } };
  const reward = rewards[level];
  if (!reward) return toast('該等級無獎勵', true);
  if (reward.gold) { addGold(reward.gold); toast(`領取 ${reward.gold} 金幣！`, false); }
  else if (reward.equip) { const eq = genEq(); if (reward.equip === 'rare') eq.quality = '稀有'; G.equipment.push(eq); toast(`獲得 ${eq.name}+${eq.bonus}`, false); saveGame(); }
  data.claimed.push(level);
  saveSeasonData(data);
  renderSeasonUI();
}
function renderSeasonUI() {
  const data = loadSeasonData();
  const container = document.getElementById('seasonContent');
  if (!container) return;
  let html = `
    <div style="padding:16px;">
      <h3>🎖️ 賽季通行證</h3>
      <div class="setting-item"><div>等級 <strong>${data.level}</strong></div><div>經驗 ${data.exp}/${SEASON_EXP_PER_LEVEL}</div></div>
      <div style="margin:16px 0;"><h4>任務</h4>
        ${data.tasks.map(task => `<div class="setting-item"><div>${task.desc} (${task.current}/${task.target})</div><div>${task.claimed ? '✅ 已領' : '⏳'}</div></div>`).join('')}
      </div>
      <div><h4>獎勵</h4>
        ${[2,3,5,7,10].map(level => `<div class="setting-item"><div>Lv.${level} ${level===2?'200金':level===3?'裝備箱':level===5?'500金':level===7?'稀有裝備箱':'1000金'}</div><button ${data.level>=level && !data.claimed.includes(level) ? '' : 'disabled'} onclick="claimSeasonReward(${level})">${data.claimed.includes(level) ? '✅已領' : '領取'}</button></div>`).join('')}
      </div>
    </div>
  `;
  container.innerHTML = html;
}

// ============================================================
//  📋 回報功能
// ============================================================
function openReport() {
  const now = new Date();
  const timeStr = now.toLocaleString('zh-TW', { hour12: false });
  const ua = navigator.userAgent;
  const gn = G.guild?.name || '無', gl = G.guild?.level || 0;
  const gc = G.guild?.members?.find(m => m.uid === 'player')?.contribution || 0;
  const w = G.equipment.find(e => e.type === 'w' && e.equipped);
  const a = G.equipment.find(e => e.type === 'a' && e.equipped);
  const wi = w ? `${w.name}+${w.bonus} (${w.element})` : '無';
  const ai = a ? `${a.name}+${a.bonus} (${a.element})` : '無';
  const mi = G.curMonster ? `${G.curMonster.emoji}${G.curMonster.name} Lv.${G.curMonster.lv} HP:${G.curMonster.hp}/${G.curMonster.maxHp}` : '無';
  const achCount = Object.values(G.achievements).filter(v=>v).length;
  const report = `========================================
🎮 幻獸鬥士 Bug 回報
========================================
📅 時間：${timeStr}
🔍 版本：v8.0

━━━ 玩家狀態 ━━━
👤 等級：${G.lv}
❤️ HP：${G.hp}/${G.maxHp}
⚔️ 攻擊：${G.atk}
💰 金幣：${G.gold}
🔄 轉生：${G.rebirthLevel} 次
🔥 元素：${playerElem()}
🏛️ 公會：${gn} (Lv.${gl}) 貢獻:${gc}
🏆 成就：${achCount}/${ACHIEVEMENTS.length}

━━━ 裝備 ━━━
🗡️ 武器：${wi}
🛡️ 防具：${ai}
🎒 總裝備數：${G.equipment.length} 件

━━━ 戰鬥 ━━━
👾 當前怪物：${mi}
💀 總擊殺數：${G.totalKills}
💥 最大傷害：${G.maxDamage}

━━━ 系統資訊 ━━━
🌐 瀏覽器：${ua}
📱 平台：${navigator.platform}
☁️ 登入狀態：${currentUser ? '已登入 (' + currentUser.displayName + ')' : '未登入'}

━━━ 請描述您遇到的問題 ━━━
（請在這裡輸入詳細描述...）

========================================`;
  const ov = document.createElement('div'); ov.className = 'report-overlay';
  const cd = document.createElement('div'); cd.className = 'report-card';
  const title = document.createElement('h3'); title.textContent = '📋 Bug 回報'; title.style.marginBottom = '8px';
  const ta = document.createElement('textarea'); ta.id = 'reportTextarea'; ta.value = report;
  const bd = document.createElement('div'); bd.className = 'report-buttons';
  const copy = document.createElement('button'); copy.className = 'copy-btn'; copy.textContent = '📋 複製';
  copy.onclick = () => {
    ta.select(); ta.setSelectionRange(0, 99999);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(ta.value).then(() => toast('✅ 已複製！', false)).catch(() => { document.execCommand('copy'); toast('✅ 已複製！', false); });
    } else { document.execCommand('copy'); toast('✅ 已複製！', false); }
  };
  const send = document.createElement('button'); send.className = 'discord-btn'; send.textContent = '📤 Discord';
  send.onclick = () => {
    const content = ta.value; send.textContent = '⏳ 發送中...'; send.disabled = true;
    fetch(WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: content }) })
    .then(res => { send.textContent = '📤 Discord'; send.disabled = false; if (res.ok) { toast('✅ 已發送到 Discord！', false); } else { toast('❌ 發送失敗 (HTTP ' + res.status + ')', true); } })
    .catch(() => { send.textContent = '📤 Discord'; send.disabled = false; toast('❌ 發送失敗，請檢查網路', true); });
  };
  const close = document.createElement('button'); close.className = 'close-btn'; close.textContent = '✖ 關閉'; close.onclick = () => document.body.removeChild(ov);
  ov.onclick = e => { if (e.target === ov) document.body.removeChild(ov); };
  bd.appendChild(copy); bd.appendChild(send); bd.appendChild(close);
  cd.appendChild(title); cd.appendChild(ta); cd.appendChild(bd);
  ov.appendChild(cd); document.body.appendChild(ov);
  setTimeout(() => { ta.select(); ta.setSelectionRange(0, 99999); }, 100);
}

// ============================================================
//  ☁️ Firebase
// ============================================================
window.googleLogin = async () => {
  try {
    const r = await auth.signInWithPopup(provider);
    currentUser = r.user;
    await loadCloud();
    renderSettings();
    toast(`歡迎 ${currentUser.displayName}`, false);
  } catch (e) { toast('登入失敗: ' + e.message, true); }
};
window.googleLogout = async () => {
  await auth.signOut();
  currentUser = null;
  renderSettings();
  loadGame();
  toast('已登出', false);
};
auth.onAuthStateChanged(u => { currentUser = u; renderSettings(); });

function saveGame() {
  const state = {
    lv: G.lv, exp: G.exp, baseAtk: G.baseAtk, baseHp: G.baseHp,
    hp: G.hp, maxHp: G.maxHp, atk: G.atk, restUsed: G.restUsed,
    difficulty: G.difficulty, equipment: G.equipment,
    deathStreak: G.deathStreak, lastDmg: G.lastDmg,
    totalKills: G.totalKills, maxDamage: G.maxDamage, maxLevel: G.maxLevel,
    gold: G.gold, rebirthLevel: G.rebirthLevel,
    guild: G.guild, achievements: G.achievements, stats: G.stats,
    lastUpdated: new Date().toISOString()
  };
  localStorage.setItem('gameSave', JSON.stringify(state));
  if (currentUser) {
    db.collection('players').doc(currentUser.uid).set(state).catch(err => {
      toast('雲端存檔失敗: ' + err.message, true);
      console.error('Firebase save error:', err);
    });
  }
}
function loadGame() {
  const raw = localStorage.getItem('gameSave');
  if (raw) {
    try {
      const s = JSON.parse(raw);
      G.lv = s.lv ?? 1; G.exp = s.exp ?? 0; G.baseAtk = s.baseAtk ?? 10; G.baseHp = s.baseHp ?? 100;
      G.hp = s.hp ?? 100; G.maxHp = s.maxHp ?? 100; G.atk = s.atk ?? 10; G.restUsed = s.restUsed ?? false;
      G.difficulty = s.difficulty ?? 'normal'; G.equipment = s.equipment ?? [];
      G.deathStreak = s.deathStreak ?? 0; G.lastDmg = s.lastDmg ?? 0;
      G.totalKills = s.totalKills ?? 0; G.maxDamage = s.maxDamage ?? 0; G.maxLevel = s.maxLevel ?? 1;
      G.gold = s.gold ?? 0; G.rebirthLevel = s.rebirthLevel ?? 0;
      if (s.guild) G.guild = s.guild;
      if (s.achievements) G.achievements = s.achievements;
      if (s.stats) G.stats = s.stats;
    } catch (e) { console.error('Load game error:', e); }
  }
  applyEq();
  refreshMonster();
  updateUI();
  renderAchievements();
}
async function loadCloud() {
  if (!currentUser) return;
  try {
    const doc = await db.collection('players').doc(currentUser.uid).get();
    if (doc.exists) {
      const s = doc.data();
      G.lv = s.lv ?? 1; G.exp = s.exp ?? 0; G.baseAtk = s.baseAtk ?? 10; G.baseHp = s.baseHp ?? 100;
      G.hp = s.hp ?? 100; G.maxHp = s.maxHp ?? 100; G.atk = s.atk ?? 10; G.restUsed = s.restUsed ?? false;
      G.difficulty = s.difficulty ?? 'normal'; G.equipment = s.equipment ?? [];
      G.deathStreak = s.deathStreak ?? 0; G.lastDmg = s.lastDmg ?? 0;
      G.totalKills = s.totalKills ?? 0; G.maxDamage = s.maxDamage ?? 0; G.maxLevel = s.maxLevel ?? 1;
      G.gold = s.gold ?? 0; G.rebirthLevel = s.rebirthLevel ?? 0;
      if (s.guild) G.guild = s.guild;
      if (s.achievements) G.achievements = s.achievements;
      if (s.stats) G.stats = s.stats;
      applyEq();
      refreshMonster();
      updateUI();
      renderAchievements();
      toast('☁️ 同步完成', false);
    }
  } catch (e) {
    toast('雲端同步失敗: ' + e.message, true);
    console.error('Cloud load error:', e);
  }
}

// ============================================================
//  📄 頁面切換
// ============================================================
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
  if (autoTimer) { clearInterval(autoTimer);
    autoTimer = null; }
  if (id === 'settingsPage') renderSettings();
  if (id === 'shopPage') { renderShop();
    updateGold();
    checkDailyUI();
    loadSignin();
    document.getElementById('claimDailyBtn').onclick = () => { claimDaily();
      checkDailyUI(); };
    document.getElementById('signinBtn').onclick = () => { doSignin();
      loadSignin(); }; }
  if (id === 'guildPage') renderGuildUI();
  if (id === 'pvpPage') renderPvPUI();
  if (id === 'seasonPage') renderSeasonUI();
  if (id === 'achievementPage') renderAchievements();
  if (id === 'gamePage') { if (musicOn && !musicTimer) playMusic(); }
}
function loadSignin() {
  const last = localStorage.getItem('lastSignin'),
    today = new Date().toDateString();
  signinStreak = (last === today) ? parseInt(localStorage.getItem('signinStreak') || '0') : 0;
  document.getElementById('signinStreak').textContent = signinStreak;
}

// ============================================================
//  🚀 初始化
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('musicToggleBtn')?.addEventListener('click', toggleMusic);
  document.getElementById('reportBtn')?.addEventListener('click', openReport);
  document.getElementById('attackBtn').onclick = attack;
  document.getElementById('skillBtn').onclick = showSkill;
  document.getElementById('restBtn').onclick = rest;
  document.getElementById('inventoryBtn').onclick = showBag;
  document.getElementById('saveBtn').onclick = saveGame;
  document.getElementById('rebirthBtn').onclick = doRebirth;
  document.getElementById('autoBattleBtn').onclick = toggleAuto;
  document.getElementById('toGameBtn').onclick = () => showPage('gamePage');
  document.getElementById('toSettingsBtn').onclick = () => showPage('settingsPage');
  document.getElementById('shopBtn').onclick = () => showPage('shopPage');
  document.getElementById('guildBtn').onclick = () => showPage('guildPage');
  document.getElementById('pvpBtn').onclick = () => showPage('pvpPage');
  document.getElementById('seasonBtn').onclick = () => showPage('seasonPage');
  document.getElementById('achievementBtn').onclick = () => showPage('achievementPage');
  document.getElementById('helpBtn').onclick = () => showPage('helpPage');
  document.querySelectorAll('.back-btn').forEach(btn => {
    btn.onclick = () => showPage('mainPage');
  });
  document.getElementById('backFromGuild').onclick = () => showPage('mainPage');
  document.getElementById('backFromPvp').onclick = () => showPage('mainPage');
  document.getElementById('backFromSeason').onclick = () => showPage('mainPage');

  initAchievements();
  loadGame();
  initGuild();
  loadSignin();
  calcOffline();
  renderAchievements();

  if (!localStorage.getItem('guideShown')) {
    document.getElementById('guideOverlay').style.display = 'flex';
    document.getElementById('closeGuideBtn').onclick = () => {
      document.getElementById('guideOverlay').style.display = 'none';
      localStorage.setItem('guideShown', 'true');
    };
  }
  setInterval(() => { if (document.getElementById('gamePage').classList.contains('active')) G.stats.playTime++; }, 1000);
  setTimeout(() => { if (musicOn && !musicTimer) { getCtx();
      playMusic(); } }, 500);
});
