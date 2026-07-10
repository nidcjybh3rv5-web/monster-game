
// ============================================================
//  🌐 多語言系統 (i18n)
// ============================================================
const LANGUAGES = {
  'zh-TW': {
    name:'繁體中文', play:'▶ 開始遊戲', settings:'⚙️ 設定', shop:'🛒 商店',
    guild:'🏛️ 公會', pvp:'⚔️ PvP', season:'🎖️ 賽季', achievement:'🏆 成就',
    help:'❓ 幫助', back:'← 返回', settings_title:'⚙️ 設定', shop_title:'🛒 商店',
    guild_title:'🏛️ 公會', pvp_title:'⚔️ PvP 競技場', season_title:'🎖️ 賽季通行證',
    achievement_title:'🏆 成就', help_title:'❓ 幫助', daily_reward:'⭐ 每日獎勵',
    claim:'🎁 領取', signin_streak:'📅 連續簽到: {days} 天', signin:'✅ 簽到',
    attack:'⚔️', skill:'✨', rest:'😴', inventory:'🎒', rebirth:'🔄轉生',
    report:'📋 回報', save:'💾', rebirth_level:'🔄轉生Lv.{level}',
    hp_label:'❤️ {hp}', exp_label:'⭐ {exp}', level_label:'⬆️ Lv {level}',
    atk_label:'⚔️ {atk}', zone_label:'🗺️ {zone}', elem_label:'🔥{elem}',
    monster_info:'💀 HP {hp} | Lv {lv} | 元素:{elem}',
    guide_welcome:'🎮 歡迎！', guide_line1:'⚔️攻擊 ✨技能 🎒裝備 😴休息',
    guide_line2:'🔥元素克制 +30%', guide_line3:'🔄Lv100轉生',
    guide_line4:'📋點擊「回報」產生Bug報告', start:'開始',
    help_line1:'⚔️攻擊 ✨技能 😴休息 🎒裝備',
    help_line2:'🔥元素克制｜🔄轉生｜🏛️公會',
    help_line3:'⚔️PvP｜🎖️賽季｜🏆成就',
    help_line4:'🤖自動戰鬥｜💤離線收益',
    help_line5:'🎵音樂｜📋回報｜☁️雲端存檔',
    language:'🌐 語言', volume:'🔊 音量', music:'🎵 音樂',
    difficulty:'⚔️ 難度', google:'🔐 Google', achievements:'🏆 成就',
    version:'📌 版本', check_update:'🔄 檢查更新', reset:'⚠️ 重置',
    reset_confirm:'確定重置？所有進度將消失！',
    no_guild:'尚未加入公會', create_guild:'創建 ({gold}金)', join_guild:'加入',
    guild_name_placeholder:'公會名稱', recommend:'🌟 推薦公會', ranking:'🏆 公會排名',
    no_recommend:'暫無推薦公會', donate:'捐{amount}金',
    guild_shop:'🎁 稀有裝備箱', guild_shop_cost:'{cost}貢獻',
    guild_boss:'👑 公會Boss', guild_boss_defeated:'✅ 已擊敗',
    guild_boss_challenge:'⚔️ 挑戰', leave_guild:'退出',
    leave_confirm:'確定要退出公會嗎？', member_count:'👥 {count}人',
    contribution:'💰 貢獻: {value}', guild_level:'🏛️ {name} Lv.{level}',
    guild_exp:'({exp}/{max})', guild_atk_bonus:'📈 攻擊+{bonus}%',
    guild_loading:'載入中...', insufficient_gold:'金幣不足',
    insufficient_contribution:'貢獻不足', pvp_find:'尋找對手',
    pvp_history:'最近戰鬥', pvp_win:'✅勝', pvp_lose:'❌敗', pvp_draw:'⚖️平',
    pvp_battle:'戰鬥中...', pvp_no_opponent:'沒有對手',
    season_level:'等級 {level}', season_exp:'經驗 {exp}/{max}',
    season_tasks:'📋 任務', season_rewards:'🎁 獎勵',
    season_claim:'領取', season_claimed:'✅已領',
    season_task_complete:'📋 任務完成：{task}，+{exp}賽季經驗',
    season_level_up:'🎉 賽季等級提升至 {level}！',
    season_reward_gold:'領取 {gold} 金幣！',
    season_reward_equip:'獲得 {equip}',
    report_copy:'📋 複製', report_discord:'📤 Discord', report_close:'✖ 關閉',
    report_copied:'✅ 已複製！', report_discord_sent:'✅ 已發送到 Discord！',
    report_discord_fail:'❌ 發送失敗',
    toast_heal:'✨恢復{hp}HP', toast_damage:'⚔️ {dmg}傷',
    toast_defeat:'🎉 +{exp}EXP +{gold}💰',
    toast_levelup:'🎉 升 Lv{level}',
    toast_rebirth_success:'✨轉生成功！Lv.{level}',
    toast_rebirth_fail:'需Lv100且<10次轉生',
    toast_guild_created:'公會「{name}」創建成功',
    toast_guild_joined:'加入「{name}」成功', toast_guild_left:'已退出公會',
    toast_guild_donate:'捐獻 {gold} 金，+{contribution}貢獻',
    toast_guild_boss_damage:'Boss -{dmg}HP ({hp}/{max})',
    toast_guild_boss_defeated:'🎉 公會Boss擊敗！+{gold}金',
    toast_guild_boss_reset:'🔄 Boss已重置',
    toast_cloud_sync:'☁️ 同步完成', toast_cloud_fail:'☁️ 雲端同步失敗',
    toast_save:'💾 存檔完成', toast_load:'📂 載入完成',
    toast_offline:'離線 {hours}小時 +{gold}金 +{exp}EXP',
    toast_revive:'💀 復活', toast_cannot_attack:'無法攻擊',
    toast_cannot_rest:'無法休息', toast_rested:'已休息過',
    toast_no_monster:'沒有怪物', toast_hp_full:'HP 已滿',
    toast_skill_no_monster:'沒有怪物',
    toast_pvp_battle:'⚔️ PvP 開始！',
    toast_pvp_result_win:'🏆 擊敗 {opponent}！+{gold}金',
    toast_pvp_result_lose:'💀 被 {opponent} 擊敗',
    toast_pvp_result_draw:'⚖️ 平局', toast_pvp_fail:'PvP失敗',
    toast_quest_complete:'📋 任務完成：{task}，獎勵 {reward} 金',
    toast_quest_claim:'領取 {gold} 金幣',
    toast_quest_none:'無可領取獎勵',
    toast_achievement_unlock:'🏆 解鎖成就：{icon} {name}！獎勵 {reward} 金幣',
    toast_daily_claimed:'今日已領', toast_daily_exp:'🎁20EXP',
    toast_daily_equip:'🎁{name}', toast_daily_hp:'🎁50HP',
    toast_signin:'簽到！連續{days}天 +{gold}金',
    toast_signin_7days:'🎉 連續7天！史詩裝備箱！',
    toast_signin_30days:'🎉 連續30天！稱號「傳奇」！',
    toast_upgrade:'{name} +{level}', toast_equip_auto:'✨自動裝',
    toast_decompose:'分解得 {gold}金', toast_no_decompose:'無可分解',
    toast_buy_equip:'獲得 {name}', toast_buy_exp:'🧪 +30EXP',
    toast_buy_revive:'💊 復活石', toast_buy_pet:'🐕 寵物！攻擊+5%',
    toast_not_enough_gold:'金幣不足', toast_already_claimed:'已領取',
    toast_level_not_enough:'等級不足', toast_no_reward:'該等級無獎勵',
    toast_season_levelup:'🎉 賽季等級提升至 {level}！',
    toast_invalid_name:'請輸入有效名稱', toast_already_in_guild:'已有公會',
    toast_guild_exists:'公會名稱已存在', toast_guild_not_found:'公會不存在',
    toast_guild_full:'公會已滿', toast_guild_already_member:'您已在該公會',
    toast_login_first:'請先登入', toast_login_success:'歡迎 {name}',
    toast_login_fail:'登入失敗', toast_logout:'已登出',
    toast_connect_error:'連線錯誤', toast_music_on:'🎵 音樂已開啟',
    toast_music_off:'🔇 音樂已關閉', close:'關閉', decompose:'分解'
  },
  'zh-CN': {
    name:'简体中文', play:'▶ 开始游戏', settings:'⚙️ 设定', shop:'🛒 商店',
    guild:'🏛️ 公会', pvp:'⚔️ PvP', season:'🎖️ 赛季', achievement:'🏆 成就',
    help:'❓ 帮助', back:'← 返回', settings_title:'⚙️ 设定', shop_title:'🛒 商店',
    guild_title:'🏛️ 公会', pvp_title:'⚔️ PvP 竞技场', season_title:'🎖️ 赛季通行证',
    achievement_title:'🏆 成就', help_title:'❓ 帮助', daily_reward:'⭐ 每日奖励',
    claim:'🎁 领取', signin_streak:'📅 连续签到: {days} 天', signin:'✅ 签到',
    attack:'⚔️', skill:'✨', rest:'😴', inventory:'🎒', rebirth:'🔄转生',
    report:'📋 回报', save:'💾', rebirth_level:'🔄转生Lv.{level}',
    hp_label:'❤️ {hp}', exp_label:'⭐ {exp}', level_label:'⬆️ Lv {level}',
    atk_label:'⚔️ {atk}', zone_label:'🗺️ {zone}', elem_label:'🔥{elem}',
    monster_info:'💀 HP {hp} | Lv {lv} | 元素:{elem}',
    guide_welcome:'🎮 欢迎！', guide_line1:'⚔️攻击 ✨技能 🎒装备 😴休息',
    guide_line2:'🔥元素克制 +30%', guide_line3:'🔄Lv100转生',
    guide_line4:'📋点击「回报」产生Bug报告', start:'开始',
    help_line1:'⚔️攻击 ✨技能 😴休息 🎒装备',
    help_line2:'🔥元素克制｜🔄转生｜🏛️公会',
    help_line3:'⚔️PvP｜🎖️赛季｜🏆成就',
    help_line4:'🤖自动战斗｜💤离线收益',
    help_line5:'🎵音乐｜📋回报｜☁️云端存盘',
    language:'🌐 语言', volume:'🔊 音量', music:'🎵 音乐',
    difficulty:'⚔️ 难度', google:'🔐 Google', achievements:'🏆 成就',
    version:'📌 版本', check_update:'🔄 检查更新', reset:'⚠️ 重置',
    reset_confirm:'确定重置？所有进度将消失！',
    no_guild:'尚未加入公会', create_guild:'创建 ({gold}金)', join_guild:'加入',
    guild_name_placeholder:'公会名称', recommend:'🌟 推荐公会', ranking:'🏆 公会排名',
    no_recommend:'暂无推荐公会', donate:'捐{amount}金',
    guild_shop:'🎁 稀有装备箱', guild_shop_cost:'{cost}贡献',
    guild_boss:'👑 公会Boss', guild_boss_defeated:'✅ 已击败',
    guild_boss_challenge:'⚔️ 挑战', leave_guild:'退出',
    leave_confirm:'确定要退出公会吗？', member_count:'👥 {count}人',
    contribution:'💰 贡献: {value}', guild_level:'🏛️ {name} Lv.{level}',
    guild_exp:'({exp}/{max})', guild_atk_bonus:'📈 攻击+{bonus}%',
    guild_loading:'加载中...', insufficient_gold:'金币不足',
    insufficient_contribution:'贡献不足', pvp_find:'寻找对手',
    pvp_history:'最近战斗', pvp_win:'✅胜', pvp_lose:'❌败', pvp_draw:'⚖️平',
    pvp_battle:'战斗中...', pvp_no_opponent:'没有对手',
    season_level:'等级 {level}', season_exp:'经验 {exp}/{max}',
    season_tasks:'📋 任务', season_rewards:'🎁 奖励',
    season_claim:'领取', season_claimed:'✅已领',
    season_task_complete:'📋 任务完成：{task}，+{exp}赛季经验',
    season_level_up:'🎉 赛季等级提升至 {level}！',
    season_reward_gold:'领取 {gold} 金币！',
    season_reward_equip:'获得 {equip}',
    report_copy:'📋 复制', report_discord:'📤 Discord', report_close:'✖ 关闭',
    report_copied:'✅ 已复制！', report_discord_sent:'✅ 已发送到 Discord！',
    report_discord_fail:'❌ 发送失败',
    toast_heal:'✨恢复{hp}HP', toast_damage:'⚔️ {dmg}伤',
    toast_defeat:'🎉 +{exp}EXP +{gold}💰',
    toast_levelup:'🎉 升 Lv{level}',
    toast_rebirth_success:'✨转生成功！Lv.{level}',
    toast_rebirth_fail:'需Lv100且<10次转生',
    toast_guild_created:'公会「{name}」创建成功',
    toast_guild_joined:'加入「{name}」成功', toast_guild_left:'已退出公会',
    toast_guild_donate:'捐献 {gold} 金，+{contribution}贡献',
    toast_guild_boss_damage:'Boss -{dmg}HP ({hp}/{max})',
    toast_guild_boss_defeated:'🎉 公会Boss击败！+{gold}金',
    toast_guild_boss_reset:'🔄 Boss已重置',
    toast_cloud_sync:'☁️ 同步完成', toast_cloud_fail:'☁️ 云端同步失败',
    toast_save:'💾 存盘完成', toast_load:'📂 载入完成',
    toast_offline:'离线 {hours}小时 +{gold}金 +{exp}EXP',
    toast_revive:'💀 复活', toast_cannot_attack:'无法攻击',
    toast_cannot_rest:'无法休息', toast_rested:'已休息过',
    toast_no_monster:'没有怪物', toast_hp_full:'HP 已满',
    toast_skill_no_monster:'没有怪物',
    toast_pvp_battle:'⚔️ PvP 开始！',
    toast_pvp_result_win:'🏆 击败 {opponent}！+{gold}金',
    toast_pvp_result_lose:'💀 被 {opponent} 击败',
    toast_pvp_result_draw:'⚖️ 平局', toast_pvp_fail:'PvP失败',
    toast_quest_complete:'📋 任务完成：{task}，奖励 {reward} 金',
    toast_quest_claim:'领取 {gold} 金币',
    toast_quest_none:'无可领取奖励',
    toast_achievement_unlock:'🏆 解锁成就：{icon} {name}！奖励 {reward} 金币',
    toast_daily_claimed:'今日已领', toast_daily_exp:'🎁20EXP',
    toast_daily_equip:'🎁{name}', toast_daily_hp:'🎁50HP',
    toast_signin:'签到！连续{days}天 +{gold}金',
    toast_signin_7days:'🎉 连续7天！史诗装备箱！',
    toast_signin_30days:'🎉 连续30天！称号「传奇」！',
    toast_upgrade:'{name} +{level}', toast_equip_auto:'✨自动装',
    toast_decompose:'分解得 {gold}金', toast_no_decompose:'无可分解',
    toast_buy_equip:'获得 {name}', toast_buy_exp:'🧪 +30EXP',
    toast_buy_revive:'💊 复活石', toast_buy_pet:'🐕 宠物！攻击+5%',
    toast_not_enough_gold:'金币不足', toast_already_claimed:'已领取',
    toast_level_not_enough:'等级不足', toast_no_reward:'该等级无奖励',
    toast_season_levelup:'🎉 赛季等级提升至 {level}！',
    toast_invalid_name:'请输入有效名称', toast_already_in_guild:'已有公会',
    toast_guild_exists:'公会名称已存在', toast_guild_not_found:'公会不存在',
    toast_guild_full:'公会已满', toast_guild_already_member:'您已在该公会',
    toast_login_first:'请先登入', toast_login_success:'欢迎 {name}',
    toast_login_fail:'登入失败', toast_logout:'已登出',
    toast_connect_error:'连线错误', toast_music_on:'🎵 音乐已开启',
    toast_music_off:'🔇 音乐已关闭', close:'关闭', decompose:'分解'
  },
  'en': {
    name:'English', play:'▶ Play', settings:'⚙️ Settings', shop:'🛒 Shop',
    guild:'🏛️ Guild', pvp:'⚔️ PvP', season:'🎖️ Season', achievement:'🏆 Achievement',
    help:'❓ Help', back:'← Back', settings_title:'⚙️ Settings', shop_title:'🛒 Shop',
    guild_title:'🏛️ Guild', pvp_title:'⚔️ PvP Arena', season_title:'🎖️ Season Pass',
    achievement_title:'🏆 Achievements', help_title:'❓ Help', daily_reward:'⭐ Daily Reward',
    claim:'🎁 Claim', signin_streak:'📅 Streak: {days} days', signin:'✅ Sign In',
    attack:'⚔️', skill:'✨', rest:'😴', inventory:'🎒', rebirth:'🔄 Rebirth',
    report:'📋 Report', save:'💾', rebirth_level:'🔄 Rebirth Lv.{level}',
    hp_label:'❤️ {hp}', exp_label:'⭐ {exp}', level_label:'⬆️ Lv {level}',
    atk_label:'⚔️ {atk}', zone_label:'🗺️ {zone}', elem_label:'🔥{elem}',
    monster_info:'💀 HP {hp} | Lv {lv} | Element:{elem}',
    guide_welcome:'🎮 Welcome!', guide_line1:'⚔️Attack ✨Skill 🎒Equipment 😴Rest',
    guide_line2:'🔥Element Advantage +30%', guide_line3:'🔄Lv100 Rebirth',
    guide_line4:'📋Click "Report" to generate Bug report', start:'Start',
    help_line1:'⚔️Attack ✨Skill 😴Rest 🎒Equipment',
    help_line2:'🔥Element｜🔄Rebirth｜🏛️Guild',
    help_line3:'⚔️PvP｜🎖️Season｜🏆Achievement',
    help_line4:'🤖Auto Battle｜💤Offline Gain',
    help_line5:'🎵Music｜📋Report｜☁️Cloud Save',
    language:'🌐 Language', volume:'🔊 Volume', music:'🎵 Music',
    difficulty:'⚔️ Difficulty', google:'🔐 Google', achievements:'🏆 Achievements',
    version:'📌 Version', check_update:'🔄 Check Update', reset:'⚠️ Reset',
    reset_confirm:'Reset all progress?',
    no_guild:'Not in a guild', create_guild:'Create ({gold}g)', join_guild:'Join',
    guild_name_placeholder:'Guild Name', recommend:'🌟 Recommended Guilds', ranking:'🏆 Guild Ranking',
    no_recommend:'No recommended guilds', donate:'Donate {amount}g',
    guild_shop:'🎁 Rare Equipment Box', guild_shop_cost:'{cost} Contribution',
    guild_boss:'👑 Guild Boss', guild_boss_defeated:'✅ Defeated',
    guild_boss_challenge:'⚔️ Challenge', leave_guild:'Leave',
    leave_confirm:'Leave this guild?', member_count:'👥 {count}',
    contribution:'💰 Contribution: {value}', guild_level:'🏛️ {name} Lv.{level}',
    guild_exp:'({exp}/{max})', guild_atk_bonus:'📈 ATK+{bonus}%',
    guild_loading:'Loading...', insufficient_gold:'Not enough gold',
    insufficient_contribution:'Not enough contribution', pvp_find:'Find Opponent',
    pvp_history:'Recent Battles', pvp_win:'✅W', pvp_lose:'❌L', pvp_draw:'⚖️D',
    pvp_battle:'Battling...', pvp_no_opponent:'No opponent',
    season_level:'Level {level}', season_exp:'EXP {exp}/{max}',
    season_tasks:'📋 Tasks', season_rewards:'🎁 Rewards',
    season_claim:'Claim', season_claimed:'✅Claimed',
    season_task_complete:'📋 Task complete: {task}, +{exp} Season EXP',
    season_level_up:'🎉 Season level up to {level}!',
    season_reward_gold:'Claimed {gold} gold!',
    season_reward_equip:'Got {equip}',
    report_copy:'📋 Copy', report_discord:'📤 Discord', report_close:'✖ Close',
    report_copied:'✅ Copied!', report_discord_sent:'✅ Sent to Discord!',
    report_discord_fail:'❌ Send failed',
    toast_heal:'✨Restored {hp}HP', toast_damage:'⚔️ {dmg}dmg',
    toast_defeat:'🎉 +{exp}EXP +{gold}g',
    toast_levelup:'🎉 Lv{level}',
    toast_rebirth_success:'✨Rebirth successful! Lv.{level}',
    toast_rebirth_fail:'Need Lv100 & <10 rebirths',
    toast_guild_created:'Guild "{name}" created',
    toast_guild_joined:'Joined "{name}"', toast_guild_left:'Left guild',
    toast_guild_donate:'Donated {gold}g, +{contribution} contribution',
    toast_guild_boss_damage:'Boss -{dmg}HP ({hp}/{max})',
    toast_guild_boss_defeated:'🎉 Guild Boss defeated! +{gold}g',
    toast_guild_boss_reset:'🔄 Boss reset',
    toast_cloud_sync:'☁️ Synced', toast_cloud_fail:'☁️ Sync failed',
    toast_save:'💾 Saved', toast_load:'📂 Loaded',
    toast_offline:'Offline {hours}h +{gold}g +{exp}EXP',
    toast_revive:'💀 Revived', toast_cannot_attack:'Cannot attack',
    toast_cannot_rest:'Cannot rest', toast_rested:'Already rested',
    toast_no_monster:'No monster', toast_hp_full:'HP full',
    toast_skill_no_monster:'No monster',
    toast_pvp_battle:'⚔️ PvP Start!',
    toast_pvp_result_win:'🏆 Defeated {opponent}! +{gold}g',
    toast_pvp_result_lose:'💀 Defeated by {opponent}',
    toast_pvp_result_draw:'⚖️ Draw', toast_pvp_fail:'PvP failed',
    toast_quest_complete:'📋 Task complete: {task}, +{reward}g',
    toast_quest_claim:'Claimed {gold}g',
    toast_quest_none:'No rewards to claim',
    toast_achievement_unlock:'🏆 Achievement unlocked: {icon} {name}! +{reward}g',
    toast_daily_claimed:'Already claimed today',
    toast_daily_exp:'🎁20EXP',
    toast_daily_equip:'🎁{name}',
    toast_daily_hp:'🎁50HP',
    toast_signin:'Signed in! {days} days streak +{gold}g',
    toast_signin_7days:'🎉 7-day streak! Epic Equipment Box!',
    toast_signin_30days:'🎉 30-day streak! Title "Legend"!',
    toast_upgrade:'{name} +{level}', toast_equip_auto:'✨Auto-equip',
    toast_decompose:'Decomposed +{gold}g',
    toast_no_decompose:'Nothing to decompose',
    toast_buy_equip:'Got {name}', toast_buy_exp:'🧪 +30EXP',
    toast_buy_revive:'💊 Revive Stone', toast_buy_pet:'🐕 Pet! ATK+5%',
    toast_not_enough_gold:'Not enough gold',
    toast_already_claimed:'Already claimed',
    toast_level_not_enough:'Level not enough',
    toast_no_reward:'No reward at this level',
    toast_season_levelup:'🎉 Season level up to {level}!',
    toast_invalid_name:'Enter a valid name',
    toast_already_in_guild:'Already in a guild',
    toast_guild_exists:'Guild name already exists',
    toast_guild_not_found:'Guild not found',
    toast_guild_full:'Guild is full',
    toast_guild_already_member:'Already in this guild',
    toast_login_first:'Please login first',
    toast_login_success:'Welcome {name}',
    toast_login_fail:'Login failed',
    toast_logout:'Logged out',
    toast_connect_error:'Connection error',
    toast_music_on:'🎵 Music On',
    toast_music_off:'🔇 Music Off',
    close:'Close', decompose:'Decompose'
  }
};

let currentLang = localStorage.getItem('language') || 'zh-TW';

function t(key, params = {}) {
  const lang = LANGUAGES[currentLang] || LANGUAGES['zh-TW'];
  let text = lang[key] || key;
  for (const [k, v] of Object.entries(params)) {
    text = text.replace(`{${k}}`, v);
  }
  return text;
}

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
//  🧬 自癒引擎
// ============================================================
(function heal() {
  console.log('🧬 自癒引擎啟動...');
  const backup = {
    toast: function(m,e){ const d=document.createElement('div');d.className='toast';d.textContent=m;d.style.color=e?'#ff8888':'#facc15';document.body.appendChild(d);setTimeout(()=>d.remove(),2000); },
    rand: function(a,b){ return Math.floor(Math.random()*(b-a+1))+a; },
    sanitizeInput: function(s){ return s.replace(/[<>"']/g,''); },
    dmgFloat: function(x,y,t,c){ const e=document.createElement('div');e.className='dmg-float';e.textContent=t;e.style.left=x+'px';e.style.top=y+'px';e.style.color=c||'#ff6b6b';document.body.appendChild(e);setTimeout(()=>e.remove(),1000); },
    generateEquipment: function(){ const t=Math.random()<0.5?'w':'a'; const b=Math.floor(Math.random()*3)+1; const e=['火','水','草','光','暗'][Math.floor(Math.random()*5)]||'無'; return {id:Date.now()+'-'+Math.random(),type:t,quality:'普通',color:'#9ca3af',bonus:b,name:`普通 ${t==='w'?'武':'防'}`,equipped:false,level:0,element:e}; },
    genEq: function(){ return this.generateEquipment(); },
    applyEq: function(){ if(typeof G!=='undefined'&&G){ const b={atk:0,hp:0}; if(G.equipment)G.equipment.forEach(e=>{if(e.equipped){if(e.type==='w')b.atk+=e.bonus;else b.hp+=e.bonus;}}); const rb=1+(G.rebirthLevel||0)*0.05; const gb=(G.guild&&G.guild.name)?1+(G.guild.level||1)*0.02:1; G.atk=Math.floor((G.baseAtk+b.atk)*rb*gb); G.maxHp=Math.floor((G.baseHp+b.hp)*rb); if(G.hp>G.maxHp)G.hp=G.maxHp; if(typeof updateUI==='function')updateUI(); } },
    renderGuildUI: function(){ const i=document.getElementById('guildInfo'); const a=document.getElementById('guildActions'); if(i)i.innerHTML='<p>'+t('guild_loading')+'</p>'; if(a)a.innerHTML=''; },
    renderPvPUI: function(){ const c=document.getElementById('pvpContent'); if(c)c.innerHTML='<p>'+t('pvp_no_opponent')+'</p>'; },
    renderSeasonUI: function(){ const c=document.getElementById('seasonContent'); if(c)c.innerHTML='<p>'+t('season_tasks')+'</p>'; },
    renderAchievements: function(){ const c=document.getElementById('achievementList'); if(c)c.innerHTML='<p>'+t('achievements')+'</p>'; },
    openReport: function(){ this.toast(t('report_discord_fail'),false); }
  };
  const list=['toast','rand','dmgFloat','sanitizeInput','genEq','generateEquipment','applyEq','renderGuildUI','renderPvPUI','renderSeasonUI','renderAchievements','openReport'];
  let fixed=0; list.forEach(n=>{ if(typeof window[n]==='undefined'){ window[n]=backup[n]; console.log('✅ 自癒補充:'+n); fixed++; } });
  if(typeof window.G==='undefined'){ window.G={lv:1,exp:0,hp:100,maxHp:100,atk:10,baseAtk:10,baseHp:100,gold:0,restUsed:false,difficulty:'normal',rebirthLevel:0,curMonster:null,deathStreak:0,lastDmg:0,totalKills:0,maxDamage:0,maxLevel:1,equipment:[],guild:{name:null,level:1,exp:0,members:[{uid:'player',contribution:0}]},achievements:{},stats:{playTime:0,totalGold:0,totalEquip:0,totalUpgrade:0,skillUsage:0,bossKills:0},autoBattle:false}; fixed++; }
  console.log('🧬 自癒完成，修復 '+fixed+' 項');
})();

// ============================================================
//  🔥 Firebase 設定
// ============================================================
const GAME_DATA = { monsters: [], items: [], skills: [], bosses: [] };
async function loadExternalData(){
  const names = ['monsters','items','skills','bosses'];
  const values = await Promise.all(names.map(async name => {
    const response = await fetch(`data/${name}.json`);
    if (!response.ok) throw new Error(`Unable to load ${name}.json`);
    return response.json();
  }));
  names.forEach((name, index) => GAME_DATA[name].splice(0, GAME_DATA[name].length, ...values[index]));
}let actx=null, musicOn=true, musicTimer=null;
function getCtx(){ if(!actx)actx=new(window.AudioContext||window.webkitAudioContext)(); if(actx.state==='suspended')actx.resume(); return actx; }
function playTone(f,d,t='sine',v=0.15){ if(!musicOn)return; try{ const c=getCtx(), o=c.createOscillator(), g=c.createGain(); o.connect(g); g.connect(c.destination); o.frequency.value=f; o.type=t; g.gain.setValueAtTime(v,c.currentTime); g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+d); o.start(c.currentTime); o.stop(c.currentTime+d); }catch(e){} }
function playChord(n,d=0.4,v=0.08){ if(!musicOn)return; try{ const c=getCtx(); n.forEach(f=>{ const o=c.createOscillator(), g=c.createGain(); o.connect(g); g.connect(c.destination); o.frequency.value=f; o.type='sine'; g.gain.setValueAtTime(v,c.currentTime); g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+d); o.start(c.currentTime); o.stop(c.currentTime+d); }); }catch(e){} }
const SFX={attack:()=>{playTone(600,.08,'square',.12);setTimeout(()=>playTone(400,.06,'square',.08),60);},skill:()=>{playTone(880,.1,'square',.15);setTimeout(()=>playTone(1100,.12,'square',.1),80);},hurt:()=>{playTone(250,.2,'sawtooth',.12);setTimeout(()=>playTone(180,.25,'sawtooth',.1),100);},levelup:()=>{playChord([523,659,784],.15,.1);setTimeout(()=>playChord([784,988,1175],.2,.08),150);},defeat:()=>{playTone(392,.15,'sine',.12);setTimeout(()=>playTone(523,.25,'sine',.12),150);},boss:()=>{playTone(110,.4,'sawtooth',.2);setTimeout(()=>playTone(82,.6,'sawtooth',.2),300);},equip:()=>{playTone(600,.06,'sine',.1);setTimeout(()=>playTone(800,.08,'sine',.08),80);},gold:()=>{playTone(1000,.05,'sine',.08);setTimeout(()=>playTone(1200,.06,'sine',.06),60);}};
const MEL=[[523,659,784],[587,740,880],[523,659,784],[494,659,880],[523,659,784],[587,740,880],[523,659,784],[880,988,1175]], BASS=[130,146,130,123,130,146,130,110];
function playMusic(){ if(!musicOn){ stopMusic(); return; } if(musicTimer)return; let b=0; musicTimer=setInterval(()=>{ if(!musicOn){ stopMusic(); return; } try{ const c=getCtx(); const i=b%MEL.length; MEL[i].forEach((f,j)=>{ const o=c.createOscillator(), g=c.createGain(); o.connect(g); g.connect(c.destination); o.frequency.value=f; o.type='sine'; g.gain.setValueAtTime(j===0?.06:.04,c.currentTime); g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.6); o.start(c.currentTime); o.stop(c.currentTime+.6); }); const bo=c.createOscillator(), bg=c.createGain(); bo.connect(bg); bg.connect(c.destination); bo.frequency.value=BASS[i]; bo.type='triangle'; bg.gain.setValueAtTime(.08,c.currentTime); bg.gain.exponentialRampToValueAtTime(.001,c.currentTime+.4); bo.start(c.currentTime); bo.stop(c.currentTime+.4); if(b%2===0){ const buf=c.createBuffer(1,c.sampleRate*.02,c.sampleRate); const d=buf.getChannelData(0); for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length); const src=c.createBufferSource(), g=c.createGain(); src.buffer=buf; src.connect(g); g.connect(c.destination); g.gain.setValueAtTime(.04,c.currentTime); g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.04); src.start(c.currentTime); src.stop(c.currentTime+.04); } b++; }catch(e){} },600); }
function stopMusic(){ if(musicTimer){ clearInterval(musicTimer); musicTimer=null; } }
function toggleMusic(){ musicOn=!musicOn; const b=document.getElementById('musicToggleBtn'); if(b){ b.textContent=musicOn?'🔊':'🔇'; b.className='music-btn'+(musicOn?' on':''); } if(musicOn){ getCtx(); playMusic(); toast(t('toast_music_on'),false); } else { stopMusic(); toast(t('toast_music_off'),false); } }
document.addEventListener('click',()=>{ if(!actx){ getCtx(); if(musicOn)playMusic(); } },{once:true});
document.addEventListener('touchstart',()=>{ if(!actx){ getCtx(); if(musicOn)playMusic(); } },{once:true});

// ============================================================
//  📦 全域狀態
// ============================================================
