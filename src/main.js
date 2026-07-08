// ============================================================
//  🎮 Application Core - Initialization & Navigation
// ============================================================

import { updateUI, log } from './utils.js';
import { loadGame, saveGame } from './save.js';
import { initBattle, refreshMonster } from './battle.js';
import { renderGuildUI } from './guild.js';
import { renderShop } from './inventory.js';
import { initFirebase, currentUser } from './firebase.js';

// ============================================================
//  📱 Page Navigation
// ============================================================

const pages = {
  main: 'mainPage',
  game: 'gamePage',
  settings: 'settingsPage',
  shop: 'shopPage',
  guild: 'guildPage',
  pvp: 'pvpPage',
  season: 'seasonPage',
  achievement: 'achievementPage',
  help: 'helpPage'
};

function switchPage(pageName) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const targetPage = document.getElementById(pages[pageName]);
  if (targetPage) {
    targetPage.classList.add('active');
  }
  
  // Page-specific initialization
  if (pageName === 'game') {
    initBattle();
  } else if (pageName === 'guild') {
    renderGuildUI();
  } else if (pageName === 'shop') {
    renderShop();
  }
}

// ============================================================
//  🎯 Event Listeners - Navigation
// ============================================================

document.getElementById('toGameBtn')?.addEventListener('click', () => {
  switchPage('game');
  calcOffline();
});

document.getElementById('toSettingsBtn')?.addEventListener('click', () => switchPage('settings'));
document.getElementById('shopBtn')?.addEventListener('click', () => switchPage('shop'));
document.getElementById('guildBtn')?.addEventListener('click', () => switchPage('guild'));
document.getElementById('pvpBtn')?.addEventListener('click', () => switchPage('pvp'));
document.getElementById('seasonBtn')?.addEventListener('click', () => switchPage('season'));
document.getElementById('achievementBtn')?.addEventListener('click', () => switchPage('achievement'));
document.getElementById('helpBtn')?.addEventListener('click', () => switchPage('help'));

// Back buttons
document.getElementById('backFromGame')?.addEventListener('click', () => switchPage('main'));
document.getElementById('backFromSettings')?.addEventListener('click', () => switchPage('main'));
document.getElementById('backFromShop')?.addEventListener('click', () => switchPage('main'));
document.getElementById('backFromGuild')?.addEventListener('click', () => switchPage('main'));
document.getElementById('backFromPvp')?.addEventListener('click', () => switchPage('main'));
document.getElementById('backFromSeason')?.addEventListener('click', () => switchPage('main'));
document.getElementById('backFromAchievement')?.addEventListener('click', () => switchPage('main'));
document.getElementById('backFromHelp')?.addEventListener('click', () => switchPage('main'));

// ============================================================
//  🔄 Game Loop Initialization
// ============================================================

async function initApp() {
  console.log('🎮 Monster Game+ initializing...');
  
  // Initialize Firebase
  await initFirebase();
  
  // Load game save
  loadGame();
  
  // Check for first-time user
  const isFirstTime = !localStorage.getItem('hasPlayed');
  if (isFirstTime) {
    localStorage.setItem('hasPlayed', 'true');
    showGuideOverlay();
  }
  
  // Initialize offline rewards
  calcOffline();
  
  // Check daily rewards
  if (canDaily()) {
    checkDailyUI();
  }
  
  // Render initial UI
  updateUI();
  
  console.log('✅ Application ready');
}

// ============================================================
//  🌐 Language System
// ============================================================

function applyLanguage() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = t(key);
    } else {
      el.textContent = t(key);
    }
  });
  updateAllUI();
}

function updateAllUI() {
  if (typeof updateUI === 'function') updateUI();
  if (typeof renderGuildUI === 'function') renderGuildUI();
  if (typeof renderAchievements === 'function') renderAchievements();
  if (typeof renderPvPUI === 'function') renderPvPUI();
  if (typeof renderSeasonUI === 'function') renderSeasonUI();
  if (typeof renderShop === 'function') renderShop();
  if (typeof renderSettings === 'function') renderSettings();
}

// ============================================================
//  💤 Offline Rewards
// ============================================================

function calcOffline() {
  const last = localStorage.getItem('lastOnline');
  if (last) {
    const diff = (Date.now() - parseInt(last)) / 1000 / 60 / 60;
    if (diff > 1) {
      const g = Math.floor(10 * Math.min(diff, 24));
      const e = Math.floor(5 * Math.min(diff, 24));
      addGold(g);
      G.exp += e;
      while (G.exp >= 50) levelUp();
      toast(t('toast_offline', { hours: Math.floor(diff), gold: g, exp: e }), false);
    }
  }
  localStorage.setItem('lastOnline', Date.now());
}

// ============================================================
//  🎬 Initialize on DOM Ready
// ============================================================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// ============================================================
//  📤 Exports
// ============================================================

export { switchPage, initApp };
