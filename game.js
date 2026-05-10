// ========== 玩家狀態 ==========
let hp = 100, maxHp = 100, exp = 0, level = 1, atk = 10;
let restUsed = false;

// ========== 當前怪物 ==========
let currentMonster = { name: "", emoji: "", hp: 0, maxHp: 0, atk: 0, exp: 0 };

// ========== 區域定義 (等級區間 + 怪物池) ==========
const zones = [
    { 
        name: "🌳 新手村", 
        range: [1, 30], 
        monsters: ["🟣史萊姆", "🟢哥布林", "🐺森林狼"] 
    },
    { 
        name: "🏜️ 黃昏沙漠", 
        range: [31, 90], 
        monsters: ["🦂巨蠍", "🧻木乃伊", "🐍沙蛇"] 
    },
    { 
        name: "⛰️ 蒼穹之巔", 
        range: [91, 100], 
        monsters: ["🐉青龍", "👼天使", "😈惡魔"] 
    }
];

// 輔助函數：隨機整數 [min,max]
function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 獲取當前區域
function getCurrentZone() {
    for (let z of zones) {
        if (level >= z.range[0] && level <= z.range[1]) return z;
    }
    return zones[0];
}

// 生成隨機怪物（血量/攻擊力隨等級線性成長並波動 ±20%）
function generateMonster() {
    const zone = getCurrentZone();
    const rawName = zone.monsters[Math.floor(Math.random() * zone.monsters.length)];
    const emoji = rawName[0];
    const name = rawName.slice(1);
    
    // 基礎值 = 等級相關
    let baseHp = 30 + level * 2.5;      // 30級約 105，100級約 280
    let baseAtk = 5 + Math.floor(level / 2.5); // 30級約 17，100級約 45
    let variance = (v) => Math.floor(v * (0.8 + Math.random() * 0.4)); // ±20%
    
    let finalHp = variance(baseHp);
    let finalAtk = variance(baseAtk);
    let expGain = Math.floor(12 + level * 0.8);
    
    return {
        name: name,
        emoji: emoji,
        hp: finalHp,
        maxHp: finalHp,
        atk: finalAtk,
        exp: expGain
    };
}

// 刷新怪物
function refreshMonster() {
    currentMonster = generateMonster();
    updateUI();
    addLog(`✨ 出現 ${currentMonster.name}  💀HP ${currentMonster.hp}  ⚔️攻 ${currentMonster.atk}`);
}

// 更新所有 UI
function updateUI() {
    hp = Math.min(maxHp, Math.max(0, hp));
    exp = Math.min(50, exp);
    const zone = getCurrentZone();
    
    document.getElementById("hpText").innerText = `${hp}/${maxHp}`;
    document.getElementById("expText").innerText = `${exp}/50`;
    document.getElementById("levelText").innerText = level;
    document.getElementById("atkText").innerText = atk;
    document.getElementById("zoneText").innerHTML = zone.name;
    document.getElementById("mapDisplay").innerHTML = zone.name;
    
    document.getElementById("monsterName").innerHTML = currentMonster.name;
    document.getElementById("monsterEmoji").innerText = currentMonster.emoji;
    document.getElementById("monsterHpText").innerText = `${currentMonster.hp}/${currentMonster.maxHp}`;
    document.getElementById("monsterAtkDisplay").innerHTML = `⚔️ 攻擊力 ${currentMonster.atk}`;
    
    let hpPercent = (hp / maxHp) * 100;
    let expPercent = (exp / 50) * 100;
    let monsterPercent = (currentMonster.hp / currentMonster.maxHp) * 100;
    document.getElementById("hpBar").style.width = hpPercent + "%";
    document.getElementById("expBar").style.width = expPercent + "%";
    document.getElementById("monsterBar").style.width = monsterPercent + "%";
    
    // 休息按鈕狀態
    let restBtn = document.getElementById("restBtn");
    restBtn.disabled = restUsed;
    restBtn.style.opacity = restUsed ? "0.5" : "1";
}

function addLog(msg) {
    document.getElementById("log").innerHTML = msg;
}

// 升級 (恢復 70% 血量)
function checkLevelUp() {
    let leveled = false;
    while (exp >= 50) {
        exp -= 50;
        level++;
        maxHp += 20;
        atk += 5;
        hp = Math.floor(maxHp * 0.7);
        leveled = true;
        addLog(`🎉 升級 Lv.${level}！攻擊力 ${atk}，生命恢復 70%`);
        playLevelUpSound();
        updateUI();
    }
    if (leveled) refreshMonster(); // 升級後怪物強度重新生成
    return leveled;
}

// 怪物反擊
function monsterCounter() {
    let dmg = rand(currentMonster.atk - 3, currentMonster.atk + 2);
    dmg = Math.max(1, dmg);
    hp -= dmg;
    playHurtSound();
    addLog(`😈 ${currentMonster.name} 反擊 ${dmg} 傷害！`);
    if (hp <= 0) {
        hp = maxHp;
        addLog(`💀 你戰敗了，已復活至滿血`);
    }
    updateUI();
}

// 擊敗怪物結算
function defeatMonster() {
    exp += currentMonster.exp;
    addLog(`🎉 擊敗 ${currentMonster.name} 獲得 ${currentMonster.exp} EXP！`);
    playDefeatSound();
    checkLevelUp();
    refreshMonster();
    updateUI();
}

// 攻擊
function attack() {
    initAudio();
    playAttackSound();
    if (hp <= 0) { addLog("你已昏迷，無法攻擊"); return; }
    let dmg = rand(atk - 3, atk + 5);
    dmg = Math.max(2, dmg);
    currentMonster.hp -= dmg;
    addLog(`⚔️ 造成 ${dmg} 傷害！`);
    if (currentMonster.hp <= 0) { defeatMonster(); return; }
    monsterCounter();
}

// 技能
function skill() {
    initAudio();
    playSkillSound();
    if (hp <= 0) { addLog("你已昏迷，無法施法"); return; }
    let dmg = rand(atk + 5, atk * 2 + 3);
    currentMonster.hp -= dmg;
    addLog(`🔥 技能造成 ${dmg} 傷害！`);
    if (currentMonster.hp <= 0) { defeatMonster(); return; }
    monsterCounter();
}

// 休息 (每場一次，會被偷襲)
function rest() {
    initAudio();
    if (restUsed) { addLog("⚠️ 本場戰鬥已經休息過了！"); return; }
    if (hp <= 0) { addLog("無法休息，你已昏迷"); return; }
    let heal = 30;
    hp = Math.min(maxHp, hp + heal);
    restUsed = true;
    playRestSound();
    addLog(`😴 恢復 ${heal} HP（此場不能再休息）`);
    let sneak = rand(currentMonster.atk - 2, currentMonster.atk + 1);
    sneak = Math.max(1, sneak);
    hp -= sneak;
    addLog(`⚠️ 休息時被偷襲，損失 ${sneak} HP`);
    if (hp <= 0) {
        hp = maxHp;
        addLog(`💀 被偷襲致死，已復活`);
    }
    updateUI();
}

// 存檔 (儲存等級、經驗、血量、攻擊等，區域自動根據等級恢復)
function saveGame() {
    let data = {
        hp, maxHp, exp, level, atk, restUsed
    };
    localStorage.setItem("monsterSave_v130", JSON.stringify(data));
    addLog("💾 遊戲已存檔！");
}

// 讀檔
function loadGame() {
    try {
        let data = localStorage.getItem("monsterSave_v130");
        if (data) {
            let s = JSON.parse(data);
            hp = s.hp ?? 100;
            maxHp = s.maxHp ?? 100;
            exp = s.exp ?? 0;
            level = s.level ?? 1;
            atk = s.atk ?? 10;
            restUsed = s.restUsed ?? false;
            addLog("📀 讀取存檔成功！");
        } else {
            addLog("🌟  Beta 1.3.0 歡迎！區域會隨等級自動切換，怪物強度隨機波動。");
        }
    } catch(e) {
        addLog("⚠️ 存檔損壞，使用預設值");
    }
    updateUI();
    refreshMonster();
}

// 初始化
loadGame();
