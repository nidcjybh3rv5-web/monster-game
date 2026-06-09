// spotify.js - 主畫面 Spotify 播放器控制

let spotifyIframe = null;

// 建立 Spotify 播放器嵌入元素
function createSpotifyPlayer(playlistId) {
  const container = document.getElementById('spotifyContainer');
  if (!container) return;
  
  // 如果已存在，先移除
  if (spotifyIframe) {
    spotifyIframe.remove();
  }
  
  spotifyIframe = document.createElement('iframe');
  spotifyIframe.src = `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator`;
  spotifyIframe.width = '100%';
  spotifyIframe.height = '152';
  spotifyIframe.frameBorder = '0';
  spotifyIframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
  spotifyIframe.loading = 'lazy';
  spotifyIframe.style.borderRadius = '12px';
  
  container.appendChild(spotifyIframe);
}

// 移除 Spotify 播放器（離開主畫面時可選）
function removeSpotifyPlayer() {
  if (spotifyIframe) {
    spotifyIframe.remove();
    spotifyIframe = null;
  }
}

// 更換播放清單
function changeSpotifyPlaylist(playlistId) {
  if (spotifyIframe) {
    spotifyIframe.src = `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator`;
  }
}

// 預設播放清單 ID（可換成你想要的）
const DEFAULT_SPOTIFY_PLAYLIST = '37i9dQZF1DXcBWIGoYBM5M'; // 預設是「專注」歌單
