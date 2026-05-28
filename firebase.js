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

window.signInWithGoogle = () => {
  auth.signInWithPopup(provider)
    .then(r => {
      currentUser = r.user;
      window.toast(`歡迎 ${currentUser.displayName}`);
      window.updateGoogleBtn?.();
      window.syncCloud?.();
    })
    .catch(e => window.toast('登入失敗', true));
};

window.signOut = () => {
  auth.signOut().then(() => {
    currentUser = null;
    window.updateGoogleBtn?.();
    window.toast('已登出');
    window.loadLocal?.();
  });
};

window.updateGoogleBtn = () => {
  const btn = document.getElementById('googleLoginBtn');
  if (!btn) return;
  btn.innerText = currentUser ? `👤 ${currentUser.displayName}` : '登入 Google';
  btn.disabled = !!currentUser;
};

auth.onAuthStateChanged(u => {
  currentUser = u;
  window.updateGoogleBtn?.();
  if (u) window.syncCloud?.();
  else window.loadLocal?.();
});

window.syncCloud = async () => {
  if (!currentUser) return;
  try {
    const doc = await db.collection('players').doc(currentUser.uid).get();
    if (doc.exists) {
      const data = doc.data();
      if (window.loadFromCloud) window.loadFromCloud(data);
      window.toast('☁️ 同步完成');
    } else {
      window.loadLocal?.();
    }
  } catch (e) {
    window.toast('雲端錯誤', true);
    window.loadLocal?.();
  }
};

window.saveToCloud = (data) => {
  if (currentUser) {
    db.collection('players').doc(currentUser.uid).set(data).catch(e => window.toast('雲端失敗', true));
  }
};
