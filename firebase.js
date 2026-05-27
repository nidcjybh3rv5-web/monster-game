const firebaseConfig = {
  apiKey: "AIzaSyDevirfNqjlg5hVkF6pgMMU9tfx7CDac4A",
  authDomain: "monster-game-f193f.firebaseapp.com",
  projectId: "monster-game-f193f",
  storageBucket: "monster-game-f193f.firebasestorage.app",
  messagingSenderId: "304101821779",
  appId: "1:304101821779:web:9b77e901083a7949f265a6"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth(), db = firebase.firestore(), provider = new firebase.auth.GoogleAuthProvider();
let currentUser = null;

window.signInWithGoogle = () => auth.signInWithPopup(provider).then(r => { currentUser = r.user; toast(`歡迎 ${currentUser.displayName}`); updateGoogleBtn(); syncCloud(); }).catch(e => toast('登入失敗', 1));
window.signOut = () => auth.signOut().then(() => { currentUser = null; updateGoogleBtn(); toast('已登出'); loadLocal(); });
function updateGoogleBtn() { let btn = document.getElementById('googleLoginBtn'); if (!btn) return; btn.innerText = currentUser ? `👤 ${currentUser.displayName}` : '登入 Google'; btn.disabled = !!currentUser; }
auth.onAuthStateChanged(u => { currentUser = u; updateGoogleBtn(); if (u) syncCloud(); else loadLocal(); });

async function syncCloud() {
  if (!currentUser) return;
  try {
    let doc = await db.collection('players').doc(currentUser.uid).get();
    if (doc.exists) {
      let d = doc.data();
      if (window.loadFromCloud) window.loadFromCloud(d);
      toast('☁️ 同步完成');
    } else loadLocal();
  } catch (e) { toast('雲端錯誤', 1); loadLocal(); }
}
window.saveToCloud = (data) => { if (currentUser) db.collection('players').doc(currentUser.uid).set(data).catch(e => toast('雲端失敗', 1)); };
