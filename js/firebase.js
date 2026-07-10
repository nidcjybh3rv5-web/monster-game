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
window.googleLogin=async()=>{
  try{ const r=await auth.signInWithPopup(provider); currentUser=r.user; await loadCloud(); renderSettings(); toast(t('toast_login_success',{name:currentUser.displayName}),false); }
  catch(e){ toast(t('toast_login_fail')+': '+e.message,true); }
};
window.googleLogout=async()=>{
  await auth.signOut(); currentUser=null; renderSettings(); loadGame(); toast(t('toast_logout'),false);
};
auth.onAuthStateChanged(u=>{ currentUser=u; renderSettings(); });

