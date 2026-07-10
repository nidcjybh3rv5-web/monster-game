const ELEMS=['火','水','草','光','暗'], WEAK={'火':'草','水':'火','草':'水','光':'暗','暗':'光'};
function randElem(){ return ELEMS[rand(0,4)]; }
function elemBonus(a,d){ if(!a||a==='無')return 1; if(WEAK[a]===d)return 1.3; if(WEAK[d]===a)return 0.7; return 1; }

// ============================================================
//  🎒 裝備系統
// ============================================================
const QUAL=GAME_DATA.items;
function randQ(){ let r=Math.random(),a=0; for(let q of QUAL)if((a+=q.r)>r)return q; return QUAL[0]; }
function genEq(){ let t=rand(0,1)?'w':'a', q=randQ(), b=rand(q.min,q.max), e=Math.random()<.3?randElem():'無'; return {id:Date.now()+'-'+Math.random(), type:t, quality:q.n, color:q.c, bonus:b, name:`${q.n} ${t==='w'?'武':'防'}`, equipped:false, level:0, element:e}; }
function eqBonus(){ let a=0,h=0; G.equipment.forEach(e=>{ if(e.equipped)e.type==='w'?a+=e.bonus:h+=e.bonus; }); return {atk:a,hp:h}; }
function playerElem(){ const w=G.equipment.find(e=>e.type==='w'&&e.equipped); return w?.element||'無'; }
function guildBuff(){ return G.guild.name?1+G.guild.level*.02:1; }
function applyEq(){ const b=eqBonus(), rb=1+G.rebirthLevel*.05, gb=guildBuff(); G.atk=Math.floor((G.baseAtk+b.atk)*rb*gb); G.maxHp=Math.floor((G.baseHp+b.hp)*rb); if(G.hp>G.maxHp)G.hp=G.maxHp; updateUI(); }
function upEq(id){ const i=G.equipment.find(e=>e.id==id); if(!i)return; const c=50*((i.level||0)+1); if(G.gold>=c){ G.gold-=c; i.level++; i.bonus+=2; G.stats.totalUpgrade++; SFX.equip(); toast(t('toast_upgrade',{name:i.name,level:i.level}),false); updateGold(); saveGame(); applyEq(); closeBag(); updateSeasonProgress('upgrade'); }else toast(t('toast_not_enough_gold'),true); }
function toggleEq(id){ const i=G.equipment.find(e=>e.id==id); if(!i)return; if(i.equipped){ i.equipped=false; toast(t('toast_unequip',{name:i.name}),false); }else{ const s=G.equipment.find(e=>e.type===i.type&&e.equipped); if(s)s.equipped=false; i.equipped=true; toast(t('toast_equip',{name:i.name}),false); SFX.equip(); } applyEq(); saveGame(); closeBag(); }
function decomEq(t='普通'){ const o=['普通','優秀','稀有','史詩']; const idx=o.indexOf(t); let total=0; G.equipment=G.equipment.filter(e=>{ if(o.indexOf(e.quality)<idx&&!e.equipped){ total+=10; return false; } return true; }); if(total>0){ G.gold+=total; G.stats.totalGold+=total; SFX.gold(); toast(t('toast_decompose',{gold:total}),false); saveGame(); applyEq(); }else toast(t('toast_no_decompose'),true); closeBag(); }
function closeBag(){ const o=document.querySelector('.backpack-overlay'); if(o)o.remove(); }
function showBag(){
  closeBag();
  const ov=document.createElement('div'); ov.className='backpack-overlay';
  const cd=document.createElement('div'); cd.className='backpack-card';
  cd.innerHTML='<h3>🎒 '+t('inventory')+'</h3>';
  const dd=document.createElement('div'); dd.style.display='flex'; dd.style.justifyContent='space-between'; dd.style.marginBottom='12px';
  const sel=document.createElement('select'); sel.innerHTML='<option value="普通">普通及以下</option><option value="優秀">優秀及以下</option><option value="稀有">稀有及以下</option>'; sel.style.background='#0f172a'; sel.style.color='#fff'; sel.style.borderRadius='20px';
  const btn=document.createElement('button'); btn.textContent=t('decompose'); btn.style.background='#ef4444'; btn.style.border='none'; btn.style.padding='4px 12px'; btn.style.borderRadius='20px'; btn.onclick=()=>{ decomEq(sel.value); };
  dd.appendChild(sel); dd.appendChild(btn); cd.appendChild(dd);
  if(!G.equipment.length)cd.innerHTML+='<p>無裝備</p>';
  else G.equipment.forEach(e=>{
    const d=document.createElement('div'); d.className='backpack-item'; d.style.borderLeftColor=e.color;
    d.innerHTML=`<span style="color:${e.color}">${e.name}+${e.bonus} (${e.element}) +${e.level||0}</span><div><button class="eqBtn">${e.equipped?'卸下':'裝'}</button><button class="upBtn">強化</button></div>`;
    d.querySelector('.eqBtn').onclick=()=>{ toggleEq(e.id); };
    d.querySelector('.upBtn').onclick=()=>{ upEq(e.id); };
    cd.appendChild(d);
  });
  const cl=document.createElement('button'); cl.textContent=t('close'); cl.className='close-backpack'; cl.onclick=closeBag;
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
