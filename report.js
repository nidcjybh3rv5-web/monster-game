const WEBHOOK_URL = "https://discord.com/api/webhooks/1503764494969475215/yj1L6PR8nVzbSEWomvEZYBas9Jx4_5KwQZJrvcrNUsBHcKx9nmI59bRGkOM7R_90yjb8";

async function reportBugToDiscord() {
  try {
    const gameState = {
      level: window.gameLevel || 1,
      hp: window.gameHp || 100,
      maxHp: window.gameMaxHp || 100,
      atk: window.gameAtk || 10,
      zone: window.gameZone || "Village",
      version: "Beta 1.3.0"
    };
    
    const userAgent = navigator.userAgent;
    const now = new Date().toLocaleString();
    
    const message = {
      content: `**BUG REPORT**\n` +
               `Version: ${gameState.version}\n` +
               `Level: ${gameState.level}\n` +
               `Zone: ${gameState.zone}\n` +
               `HP: ${gameState.hp}/${gameState.maxHp}\n` +
               `ATK: ${gameState.atk}\n` +
               `Browser: ${userAgent}\n` +
               `Time: ${now}\n\n` +
               `Please describe the problem:`
    };
    
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message)
    });
    
    if (response.ok) {
      alert("Report sent to developer. Thank you!");
    } else {
      alert("Failed to send. Please join Discord to report.");
    }
  } catch (error) {
    console.error(error);
    alert("Error sending report.");
  }
}

window.reportBugToDiscord = reportBugToDiscord;
