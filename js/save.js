const firebaseConfig = { apiKey: "AIzaSyDevirfNqjlg5hVkF6pgMMU9tfx7CDac4A", authDomain: "monster-game-f193f.firebaseapp.com", projectId: "monster-game-f193f", storageBucket: "monster-game-f193f.firebasestorage.app", messagingSenderId: "304101821779", appId: "1:304101821779:web:9b77e901083a7949f265a6" };
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth(), db = firebase.firestore(), provider = new firebase.auth.GoogleAuthProvider();
let currentUser = null;
window.signInWithGoogle = async () => { try { let r = await auth.signInWithPopup(provider); currentUser = r.user; let btn = document.getElementById('googleLoginBtn'); if (btn) { btn.innerText = `👤 ${currentUser.displayName}`; btn.disabled = true; } toast(`歡迎 ${currentUser.displayName}`); await loadCloudSave(); } catch (e) { toast('登入失敗', 1); } };
window.signOut = async () => { await auth.signOut(); currentUser = null; let btn = document.getElementById('googleLoginBtn'); if (btn) { btn.innerText = '登入 Google'; btn.disabled = false; } toast('已登出'); loadLocal(); };
auth.onAuthStateChanged(u => { currentUser = u; let btn = document.getElementById('googleLoginBtn'); if (btn) { if (u) { btn.innerText = `👤 ${u.displayName}`; btn.disabled = true; } else { btn.innerText = '登入 Google'; btn.disabled = false; } } });
function saveLocal() {
  const state = { lv: window.lv, exp: window.exp, baseAtk: window.baseAtk, baseHp: window.baseHp, hp: window.hp, maxHp: window.maxHp, atk: window.atk, restUsed: window.restUsed, difficulty: window.difficulty, equipment: window.equipment, deathStreak: window.deathStreak, lastDmg: window.lastDmg, totalKills: window.totalKills, maxDamage: window.maxDamage, maxLevel: window.maxLevel };
  localStorage.setItem('gameSave', JSON.stringify(state)); toast('💾 本地存檔');
  if (currentUser) db.collection('players').doc(currentUser.uid).set(state).catch(e => toast('雲端失敗', 1));
}
function loadLocal() {
  let raw = localStorage.getItem('gameSave');
  if (raw) {
    try {
      let s = JSON.parse(raw);
      window.lv = s.lv ?? 1; window.exp = s.exp ?? 0; window.baseAtk = s.baseAtk ?? 10; window.baseHp = s.baseHp ?? 100;
      window.hp = s.hp ?? 100; window.maxHp = s.maxHp ?? 100; window.atk = s.atk ?? 10; window.restUsed = s.restUsed ?? false;
      window.difficulty = s.difficulty ?? 'normal'; window.equipment = Array.isArray(s.equipment) ? s.equipment : [];
      window.deathStreak = s.deathStreak ?? 0; window.lastDmg = s.lastDmg ?? 0;
      window.totalKills = s.totalKills ?? 0; window.maxDamage = s.maxDamage ?? 0; window.maxLevel = s.maxLevel ?? 1;
      let ds = document.getElementById('diffSelect'); if (ds) ds.value = window.difficulty;
    } catch (e) { }
  }
  applyEquipBonus(); refreshMonster(); updateUI();
}
async function loadCloudSave() {
  if (!currentUser) return;
  try {
    let doc = await db.collection('players').doc(currentUser.uid).get();
    if (doc.exists) {
      let d = doc.data();
      window.lv = d.lv ?? 1; window.exp = d.exp ?? 0; window.baseAtk = d.baseAtk ?? 10; window.baseHp = d.baseHp ?? 100;
      window.hp = d.hp ?? 100; window.maxHp = d.maxHp ?? 100; window.atk = d.atk ?? 10; window.restUsed = d.restUsed ?? false;
      window.difficulty = d.difficulty ?? 'normal'; window.equipment = Array.isArray(d.equipment) ? d.equipment : [];
      window.deathStreak = d.deathStreak ?? 0; window.lastDmg = d.lastDmg ?? 0;
      window.totalKills = d.totalKills ?? 0; window.maxDamage = d.maxDamage ?? 0; window.maxLevel = d.maxLevel ?? 1;
      applyEquipBonus(); refreshMonster(); updateUI(); toast('☁️ 雲端同步');
    } else loadLocal();
  } catch (e) { toast('雲端失敗', 1); loadLocal(); }
}
