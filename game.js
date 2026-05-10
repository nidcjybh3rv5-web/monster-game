// ========== 玩家數值 ==========
let hp = 100, maxHp = 100, exp = 0, level = 1, atk = 10;

// ========== 怪物數值 ==========
let monsterHp = 35, monsterMaxHp = 35, monsterAtk = 5, monsterExp = 15;
let monsterName = "🟣 史萊姆", monsterEmoji = "🟣";

// ========== 休息限制 ==========
let restUsed = false;

// ========== 怪物庫 ==========
const monsters = [
    { name: "🟣 史萊姆", emoji: "🟣", hp: 35, atk: 5, exp: 15 },
    { name: "🟢 哥布林", emoji: "🟢", hp: 50, atk: 8, exp: 20 },
    { name: "👻 幽靈", emoji: "👻", hp: 70, atk: 10, exp: 30 },
    { name: "🐉 小龍", emoji: "🐉", hp: 100, atk: 15, exp: 40 }
];

// ========== 隨機換怪物 ==========
function randomMonster() {
    let m = monsters[Math.floor(Math.random() * monsters.length)];
    monsterName = m.name;
    monsterEmoji = m.emoji;
    monsterHp = m.hp;
    monsterMaxHp = m.hp;
    monsterAtk = m.atk;
    monsterExp = m.exp;
    restUsed = false;
    updateRestBtn();
    updateUI();
}

// ========== 更新休息按鈕 ==========
function updateRestBtn() {
    let btn = document.getElementById("restBtn");
    if (restUsed) {
        btn.style.opacity = "0.5";
        btn.disabled = true;
    } else {
        btn.style.opacity = "1";
        btn.disabled = false;
    }
}

// ========== 更新畫面 ==========
function updateUI() {
    if (hp < 0) hp = 0;
    if (exp > 50) exp = 50;
    
    document.getElementById("hpText").innerText = `${hp} / ${maxHp}`;
    document.getElementById("expText").innerText = `${exp} / 50`;
    document.getElementById("levelText").innerText = level;
    document.getElementById("atkText").innerText = atk;
    document.getElementById("monsterName").innerHTML = monsterName;
    document.getElementById("monsterEmoji").innerText = monsterEmoji;
    document.getElementById("monsterHpText").innerText = `${monsterHp} / ${monsterMaxHp}`;
    
    document.getElementById("hpBar").style.width = (hp / maxHp * 100) + "%";
    document.getElementById("expBar").style.width = (exp / 50 * 100) + "%";
    document.getElementById("monsterBar").style.width = (monsterHp / monsterMaxHp * 100) + "%";
}

// ========== 顯示訊息 ==========
function log(msg) {
    document.getElementById("log").innerText = msg;
}

// ========== 升級（只補70%血，有音效）==========
function checkLevelUp() {
    if (exp >= 50) {
        exp -= 50;
        level++;
        maxHp += 20;
        atk += 5;
        hp = Math.floor(maxHp * 0.7);
        log(`🎉 升級 Lv.${level}！ 攻擊${atk} 血量恢復70%`);
        playLevelUpSound();  // 音效
        updateUI();
        return true;
    }
    return false;
}

// ========== 怪物反擊 ==========
function monsterAttack() {
    let dmg = Math.floor(Math.random() * monsterAtk) + 3;
    hp -= dmg;
    playHurtSound();        // 受傷音效
    log(`😈 ${monsterName} 反擊 ${dmg} 傷害！`);
    if (hp <= 0) {
        hp = maxHp;
        log(`💀 你戰敗了！已復活`);
    }
    updateUI();
}

// ========== 攻擊 ==========
function attack() {
    initAudio();            // 啟用聲音
    playAttackSound();      // 攻擊音效
    if (monsterHp <= 0) { randomMonster(); log("新怪物出現！"); updateUI(); return; }
    if (hp <= 0) { log("你已經昏迷"); return; }
    
    let dmg = Math.floor(Math.random() * atk) + 5;
    monsterHp -= dmg;
    log(`⚔️ 造成 ${dmg} 傷害！`);
    
    if (monsterHp <= 0) {
        exp += monsterExp;
        log(`🎉 擊敗 ${monsterName} 獲得 ${monsterExp} EXP！`);
        playDefeatSound();   // 擊敗音效
        checkLevelUp();
        randomMonster();
        updateUI();
        return;
    }
    monsterAttack();
    updateUI();
}

// ========== 技能 ==========
function skill() {
    initAudio();
    playSkillSound();       // 技能音效
    if (monsterHp <= 0) { randomMonster(); log("新怪物出現！"); updateUI(); return; }
    if (hp <= 0) { log("你已經昏迷"); return; }
    
    let dmg = Math.floor(Math.random() * atk * 1.8) + 8;
    monsterHp -= dmg;
    log(`🔥 技能造成 ${dmg} 傷害！`);
    
    if (monsterHp <= 0) {
        exp += monsterExp;
        log(`🎉 技能擊敗 ${monsterName} 獲得 ${monsterExp} EXP！`);
        playDefeatSound();
        checkLevelUp();
        randomMonster();
        updateUI();
        return;
    }
    monsterAttack();
    updateUI();
}

// ========== 休息（每場限一次，會被偷襲）==========
function rest() {
    initAudio();
    if (restUsed) { log(`⚠️ 這場已休息過！打敗怪物後才能再休息`); return; }
    if (hp <= 0) { log("無法休息"); return; }
    
    let heal = 30;
    hp += heal;
    if (hp > maxHp) hp = maxHp;
    restUsed = true;
    updateRestBtn();
    log(`😴 恢復 ${heal} HP (此場不能再休息)`);
    playRestSound();        // 休息音效
    
    let sneak = Math.floor(Math.random() * monsterAtk) + 2;
    hp -= sneak;
    log(`⚠️ 休息時被偷襲 -${sneak} HP`);
    if (hp <= 0) {
        hp = maxHp;
        log(`💀 被偷襲致死，已復活`);
    }
    updateUI();
}

// ========== 存檔 ==========
function saveGame() {
    let data = { hp, maxHp, exp, level, atk };
    localStorage.setItem("monsterSave", JSON.stringify(data));
    log(`💾 已存檔！`);
}

// ========== 讀檔 ==========
function loadGame() {
    try {
        let data = localStorage.getItem("monsterSave");
        if (data) {
            let s = JSON.parse(data);
            hp = s.hp || 100;
            maxHp = s.maxHp || 100;
            exp = s.exp || 0;
            level = s.level || 1;
            atk = s.atk || 10;
            log(`📀 讀取存檔 Lv.${level}`);
        } else {
            log(`🌟 Beta 1.2.10：技能無加成、升級補70%、休息限一次、音效已加入`);
        }
    } catch(e) { }
    updateUI();
}

// ========== 啟動遊戲 ==========
loadGame();
randomMonster();
updateUI();
