const APP_VERSION = 'v3.0.5';
const storedVer = localStorage.getItem('app_version');
if (storedVer !== APP_VERSION) {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); backdrop-filter:blur(12px); display:flex; justify-content:center; align-items:center; z-index:10000; opacity:0; transition:opacity 0.3s;';
  const card = document.createElement('div');
  card.style.cssText = 'background:rgba(30,30,35,0.9); border-radius:32px; padding:24px; width:280px; text-align:center; color:white; border:1px solid rgba(255,255,255,0.2); transform:scale(0.9); transition:transform 0.2s;';
  card.innerHTML = `<svg width="48" height="48" viewBox="0 0 48 48" style="margin:0 auto 16px;"><circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="4"/><circle cx="24" cy="24" r="20" fill="none" stroke="#facc15" stroke-width="4" stroke-dasharray="126" stroke-dashoffset="40" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="1s" repeatCount="indefinite"/></circle></svg><h3 style="margin:0 0 8px;">檢查更新中</h3><p style="font-size:0.85rem; color:#aaa;">正在尋找新版本...</p>`;
  overlay.appendChild(card);
  document.body.appendChild(overlay);
  requestAnimationFrame(() => { overlay.style.opacity = '1'; card.style.transform = 'scale(1)'; });
  setTimeout(() => {
    card.innerHTML = `<div style="font-size:48px; margin-bottom:8px;">✨</div><h3 style="margin:0 0 8px;">發現新版本</h3><p style="font-size:0.85rem; color:#ddd;">遊戲已更新至 ${APP_VERSION}</p><button id="updateNowBtn" style="background:#facc15; color:#0f172a; border:none; padding:10px 20px; border-radius:40px; font-weight:bold; margin-top:16px; cursor:pointer; width:80%;">立即更新</button>`;
    document.getElementById('updateNowBtn').onclick = () => { localStorage.setItem('app_version', APP_VERSION); window.location.reload(); };
  }, 1500);
} else {
  window.addEventListener('DOMContentLoaded', () => {
    loadLocal();
    if (!localStorage.getItem('guideShown')) {
      let ov = document.getElementById('guideOverlay');
      ov.style.display = 'flex';
      document.getElementById('closeGuideBtn').onclick = () => { ov.style.display = 'none'; localStorage.setItem('guideShown', 'true'); };
    }
  });
}
