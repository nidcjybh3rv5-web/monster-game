// Firebase 設定
const firebaseConfig = {
  apiKey: "AIzaSyDevirfNqjlg5hVkF6pgMMU9tfx7CDac4A",
  authDomain: "monster-game-f193f.firebaseapp.com",
  projectId: "monster-game-f193f",
  storageBucket: "monster-game-f193f.firebasestorage.app",
  messagingSenderId: "304101821779",
  appId: "1:304101821779:web:9b77e901083a7949f265a6"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const provider = new firebase.auth.GoogleAuthProvider();

let currentUser = null;

function updateLoginButton() {
  const btn = document.getElementById('googleLoginBtn');
  if (!btn) return;
  if (currentUser) {
    btn.innerText = `👤 ${currentUser.displayName}`;
    btn.disabled = true;
  } else {
    btn.innerText = '登入 Google';
    btn.disabled = false;
  }
}
window.signInWithGoogle = () => {
  auth.signInWithPopup(provider)
    .then(result => {
      currentUser = result.user;
      updateLoginButton();
      toast(`歡迎 ${currentUser.displayName}`);
      loadCloudSave();
    })
    .catch(err => toast('登入失敗: ' + err.message, true));
};
window.signOut = () => {
  auth.signOut().then(() => {
    currentUser = null;
    updateLoginButton();
    toast('已登出');
  });
};
auth.onAuthStateChanged(user => {
  currentUser = user;
  updateLoginButton();
  if (user) loadCloudSave();
});
// 雲端存檔
async function saveToCloud(gameData) {
  if (!currentUser) return;
  try {
    await db.collection('players').doc(currentUser.uid).set(gameData);
    toast('☁️ 雲端存檔成功');
  } catch(e) { toast('雲端存檔失敗', true); }
}
async function loadCloudSave() {
  if (!currentUser) return;
  try {
    const doc = await db.collection('players').doc(currentUser.uid).get();
    if (doc.exists) {
      const data = doc.data();
      // 將資料寫入全域 gameState（由 game.js 提供）
      if (window.loadGameFromCloud) window.loadGameFromCloud(data);
      toast('☁️ 載入雲端存檔');
    }
  } catch(e) { toast('載入雲端失敗', true); }
}
window.saveToCloud = saveToCloud;
