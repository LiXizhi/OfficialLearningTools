// Turnkey ("开箱即用") Student Self-Guided Super-Individual Workbench & Teacher Big-Screen Workbench
// Aligned with Second Brain (c:/lxzsrc/LiXizhiDocs) Super-Individual philosophy & paracraft-cli specifications.

const html = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

export const LESSON1_CODEBLOCK_LUA = `-- Paracraft 代码方块 (CodeBlock) · 校门虚拟具身迎宾机器人 (g3-01)
-- 装配方式：拉杆 -> 代码方块 (219) <-> 电影方块 (含迎宾机器人演员)
-- 遵循 c:/lxzsrc/keepworkExtension/skills/paracraft-create/references/code-blocks.md 规范
setActorValue("sentientRadius", 0)
setActorValue("name", "gate_embodied_robot")

local mode = "normal" -- normal(正常清晰) | occluded(遮挡逆光) | noisy(环境嘈杂)

local function actByEnv(envMode)
    if envMode == "normal" then
        say("☀️【感知清晰 98%】认出本校同学校牌！同学早安，欢迎进入智慧校园！", 4)
        turnTo(0)
        walkForward(1, 0.8)
        wait(0.3)
        walkForward(-1, 0.8)
    elseif envMode == "occluded" then
        say("🕶️【视觉受阻 42%】镜头被遮挡看不清特征！我已停步亮黄灯，请摘下遮挡或请值班老师人工核验！", 5)
        turnTo(45)
    elseif envMode == "noisy" then
        say("📢【语音受扰】周围太吵把“下雪”听成“下学”啦！请走近麦克风重说一遍，或请老师帮忙确认！", 5)
        turnTo(-45)
    end
end

-- 启动时先执行一次正常迎宾
actByEnv(mode)

-- 点击具身机器人可切换控制变量实验条件
registerClickEvent(function()
    local idx = ask("🤖 我是校门虚拟具身迎宾机器人！请选择要测试的环境条件（控制变量实验）：", {
        "☀️ 1. 环境正常（画面清晰 + 声音清楚）",
        "🕶️ 2. 视觉干扰（雨伞/逆光遮挡摄像头一半）",
        "📢 3. 语音干扰（周围大声喧哗 + 同音字）"
    })
    if idx == 1 then
        mode = "normal"
    elseif idx == 2 then
        mode = "occluded"
    elseif idx == 3 then
        mode = "noisy"
    else
        return
    end
    actByEnv(mode)
end)`;

export const LESSON1_PARACRAFT_CLI_CREATE_SCENE_LUA = `-- Submit via paracraft-cli run_command -> run_code (createScene)
-- 参考 c:/lxzsrc/keepworkExtension/docs/paracraft-cli.md 与 codeblock-playground.lua
local s = createScene({name = "g3_01_embodied_gate_robot", dimensions = {16, 6, 12}})

-- 1. 铺设智慧校门地面与迎宾通道
s:group("gate_ground")
s:box({position = {0, 0, 0}, dimensions = {16, 1, 12}, blockId = 62})
s:box({position = {6, 0, 1}, dimensions = {4, 1, 10}, blockId = 10})

-- 2. 建造左右智慧校门立柱与顶部横梁、状态指示灯
s:group("gate_arch")
s:box({position = {4, 1, 5}, dimensions = {2, 4, 2}, blockId = 28})
s:box({position = {10, 1, 5}, dimensions = {2, 4, 2}, blockId = 28})
s:box({position = {4, 5, 5}, dimensions = {8, 1, 2}, blockId = 28})
-- 校门顶部AI识别状态灯
s:block({position = {7, 5, 4}, blockId = 189})

-- 3. 导出世界本地虚拟具身迎宾机器人微体素模型 (.x)
s:group("robot_voxel_source")
s:box({position = {14, 1, 10}, dimensions = {0.75, 1, 0.5}, size = 0.25, color = "#2b5876"})
s:box({position = {14, 2, 10}, dimensions = {0.75, 0.5, 0.5}, size = 0.25, color = "#3a7bd5"})
for _, x in ipairs({14.125, 14.5}) do
    s:block({position = {x, 2.25, 9.875}, size = 0.125, color = "#00f5d4"})
end
local robotModel = "blocktemplates/g3_01_gate_robot.x"
s:exportVoxelX(robotModel, "robot_voxel_source")
s:requireModels({robotModel})

-- 4. 装配独立角色站：拉杆({5,1,7}) -> 代码方块({6,1,7}) <-> 电影方块({7,1,7})
local codePos = s:position({6, 1, 7})
local moviePos = s:position({7, 1, 7})
local leverPos = s:position({5, 1, 7})

s:movie({
    position = {7, 1, 7},
    actor = {
        name = "gate_embodied_robot",
        filename = robotModel,
        position = {7.5, 1, 4.5},
        facing = 1.57,
        scale = 1.1
    }
})

s:block({position = {6, 1, 7}, blockId = 219}) -- 物理 CodeBlock (219)
s:editEntity(codePos, function(entity)
    entity:SetDisplayName("g3_01_gate_robot_ai")
    entity:SetNPLCode([=[
setActorValue("sentientRadius", 0)
say("🤖 我是校门AI迎宾具身机器人！点击我切换【正常/遮挡/嘈杂】实验！", 4)
registerClickEvent(function()
    local i = ask("选择环境条件（控制变量实验）：", {"☀️ 正常清晰(识别98%)", "🕶️ 遮挡镜头(降为42%请老师核验)", "📢 环境嘈杂(同音字提醒重说)"})
    if i == 1 then
        say("✅ 画面清晰！认出本校校牌，欢迎同学入校！", 4)
        walkForward(1, 0.6); wait(0.2); walkForward(-1, 0.6)
    elseif i == 2 then
        say("⚠️ 镜头被遮挡！我不盲目开门，请值班老师人工确认！", 4)
    elseif i == 3 then
        say("⚠️ 周围太吵听不清！请走近麦克风再说一次！", 4)
    end
end)
]=])
end)
s:block({position = {5, 1, 7}, blockId = 190}) -- 启动拉杆

return {
    station = {lever = leverPos, code = codePos, movie = moviePos},
    camera = {eye = s:position({8, 4, -1}), lookat = s:position({8, 2, 6})}
}`;

export const LESSON1_PARACRAFT_CLI_MCP_JSON = `{
  "tool": "paracraft_cli",
  "steps": [
    {
      "comment": "第1步：启动或复用本地 Paracraft 客户端（参考 docs/paracraft-cli.md）",
      "action": "launch",
      "params": { "waitSeconds": 15 }
    },
    {
      "comment": "第2步：查询当前世界状态与能力（worldDocuments / worldAnalysis）",
      "action": "world_status",
      "params": {}
    },
    {
      "comment": "第3步：执行 createScene 脚本一键生成 3D 智慧校门与虚拟具身迎宾机器人工作站",
      "action": "run_command",
      "params": {
        "run_code": {
          "source": "-- 将上方 createScene Lua 源码粘贴于此即可一键生成场景与具身机器人"
        }
      }
    },
    {
      "comment": "第4步：独立相机抓拍校门具身机器人正面预览图（400x300 JPEG，不污染玩家缩略图缓存）",
      "action": "camera_capture",
      "params": {
        "eye": [19208, 16, 19199],
        "lookat": [19208, 14, 19206]
      }
    }
  ]
}`;

export const LESSON1_AI_AUTOBUILD_PROMPT = `请帮我在 Paracraft 3D 世界中搭建三年级第1课《AI在哪里》的“智慧校门与虚拟具身迎宾机器人”场景：
1. 调用 paracraft_cli 检查或启动 Paracraft 世界；
2. 建造一座智慧校门（含左右立柱、横梁与状态灯），并在校门前放置一个虚拟具身迎宾机器人（拉杆 -> 代码方块 CodeBlock <-> 电影方块 MovieClip）；
3. 在代码方块中写入交互逻辑：点击机器人可切换【☀️正常清晰】、【🕶️镜头遮挡】、【📢周围嘈杂】三种实验条件，正常时挥手迎宾，遮挡或嘈杂时停步并礼貌提示请老师人工复核；
4. 完成后调用 camera_capture 抓拍一张校门具身机器人的正面照片给我核验。`;

export function renderLesson1Student(sample, labHtml, quizHtml) {
  return `
<section class="turnkey-banner student-banner" aria-label="超级个体自助闯关进度条">
  <div class="banner-top">
    <div>
      <span class="pill dark">🦸 超级个体自助闯关模式（打开直接用 · 不用老师帮忙）</span>
      <span class="pill">🎯 目标：学会向 AI 说出意图 → 操控 3D 具身机器人 → 做出我的作品卡</span>
    </div>
    <div class="banner-tools">
      <button type="button" class="tts-btn" id="btn-tts-toggle" aria-pressed="false">🔊 读题小助手：点击朗读本页步骤</button>
    </div>
  </div>
  <div class="mission-track" id="mission-track" role="list" aria-label="四关进度">
    <a href="#stage-1" class="mission-step" data-stage="1" role="listitem"><strong>第 1 关</strong><span>🔬 实验室找AI与遮挡测试</span><em class="step-state">待闯关</em></a>
    <a href="#stage-2" class="mission-step" data-stage="2" role="listitem"><strong>第 2 关</strong><span>💬 一键呼叫 AI 工作台</span><em class="step-state">待闯关</em></a>
    <a href="#stage-3" class="mission-step" data-stage="3" role="listitem"><strong>第 3 关</strong><span>🤖 Paracraft 召唤具身机器人</span><em class="step-state">待闯关</em></a>
    <a href="#stage-4" class="mission-step" data-stage="4" role="listitem"><strong>第 4 关</strong><span>🏅 导出我的超级个体作品卡</span><em class="step-state">待闯关</em></a>
  </div>
  <p class="toast-bar" id="turnkey-toast" role="status" aria-live="polite">💡 欢迎你，未来的超级个体！按顺序点击第 1 关到第 4 关，所有提示词和代码都能【一键复制】或【一键打开】！</p>
</section>

<section class="turnkey-stage" id="stage-1" aria-label="第1关：在实验室辨认谁有AI大脑">
  <div class="stage-header">
    <span class="stage-badge">第 1 关 · 3 分钟自助探究</span>
    <h2>🔬 火眼金睛：谁装了 AI 大脑？给校门具身机器人做“干扰测试”</h2>
    <button type="button" class="tts-mini" data-tts="第一关：火眼金睛！请在下方的实验室里，先点击选择校门刷脸迎宾具身机器人，判断它用的是图像识别还是普通电路，再切换遮挡一半或环境嘈杂，点击运行识别测试，看看AI会不会出错！">🔊 听本关说明</button>
  </div>
  <div class="quick-guide-row">
    <span class="guide-chip"><strong>步骤 ①</strong> 在下方选【🤖 刷脸迎宾具身机器人】并点选你的判断</span>
    <span class="guide-chip"><strong>步骤 ②</strong> 切换【☀️ 正常清晰】与【🕶️ 遮挡一半】，各点一次【🔬 运行识别测试】</span>
    <button type="button" class="action-btn secondary" id="btn-auto-demo-stage1">⚡ 一键帮我自动演示“正常 vs 遮挡”对比实验</button>
  </div>
  ${labHtml}
</section>

<section class="turnkey-stage" id="stage-2" aria-label="第2关：AI工作台开箱即用">
  <div class="stage-header">
    <span class="stage-badge">第 2 关 · 8 分钟 AI 工作台开箱即用</span>
    <h2>💬 超级个体第 1 招：说出你的意图，一键呼叫 AI 工作台设计具身机器人</h2>
    <button type="button" class="tts-mini" data-tts="第二关：超级个体第一招！你不用自己辛苦打字。先点选下面的三个彩色积木，组合出你的机器人设计要求，然后点击一键复制提示词，或者点击一键打开AI工作台，也可以直接点击本页立即体验AI回复！">🔊 听本关说明</button>
  </div>
  <p class="stage-lead"><strong>🌟 为什么要这样做？</strong> 超级个体不是帮机器打工打字的人，而是<strong>清楚说出目标、条件和安全边界的“小导演”</strong>。点选下方积木，立即生成你的专属 AI 工作台指令：</p>

  <div class="prompt-builder" aria-label="点选式提示词积木">
    <div class="builder-row">
      <label>① 选择你要设计的虚拟具身机器人岗位（点击即换）：</label>
      <div class="chip-group" data-builder="role">
        <button type="button" aria-pressed="true" data-val="校门刷脸迎宾具身机器人">🤖 校门刷脸迎宾具身机器人</button>
        <button type="button" aria-pressed="false" data-val="图书馆寻书导览具身机器人">📚 图书馆寻书导览具身机器人</button>
        <button type="button" aria-pressed="false" data-val="医务室暖心引导具身机器人">🏥 医务室暖心引导具身机器人</button>
      </div>
    </div>
    <div class="builder-row">
      <label>② 选择它搭载的 AI 感知器官（机器靠什么看和听）：</label>
      <div class="chip-group" data-builder="sensor">
        <button type="button" aria-pressed="true" data-val="高清摄像头（图像识别：看校牌与手势）">📷 摄像头图像识别（看校牌与手势）</button>
        <button type="button" aria-pressed="false" data-val="阵列麦克风（语音识别：听同学提问）">🎤 麦克风语音识别（听同学提问）</button>
        <button type="button" aria-pressed="false" data-val="摄像头+麦克风双感知（既会看画面又会听声音）">📷+🎤 视觉+语音双模态感知</button>
      </div>
    </div>
    <div class="builder-row">
      <label>③ 选择遇到“镜头被遮挡 / 周围太吵”时的安全降级动作：</label>
      <div class="chip-group" data-builder="safety">
        <button type="button" aria-pressed="true" data-val="立即停下脚步亮起黄灯，礼貌请值班老师人工确认，绝不盲目放行">🛡️ 停步亮黄灯 + 请老师人工确认</button>
        <button type="button" aria-pressed="false" data-val="用温和语音提醒同学摘下遮挡物或走近重说一遍，二次失败转人工">🔔 语音提醒重测 + 二次失败转人工</button>
      </div>
    </div>
  </div>

  <div class="prompt-box-wrap">
    <label for="student-ai-prompt"><strong>📝 已为你自动拼好的 AI 工作台输入文字（可直接修改，或直接点下方按钮）：</strong></label>
    <textarea id="student-ai-prompt" rows="4" class="turnkey-textarea"></textarea>
    <div class="turnkey-actions">
      <button type="button" class="action-btn primary" id="btn-copy-ai-prompt">📋 一键复制 AI 工作台文字</button>
      <button type="button" class="action-btn accent" id="btn-open-aichat-prompt">🚀 一键打开 AI 工作台（自动复制文字）</button>
      <button type="button" class="action-btn secondary" id="btn-simulate-ai-reply">⚡ 不切窗口：在本页直接体验 AI 工作台回复</button>
    </div>
  </div>

  <div class="ai-sim-output" id="student-ai-reply-box" hidden aria-live="polite"></div>
</section>

<section class="turnkey-stage" id="stage-3" aria-label="第3关：Paracraft虚拟具身机器人开箱即用">
  <div class="stage-header">
    <span class="stage-badge">第 3 关 · 12 分钟 Paracraft 具身机器人实战</span>
    <h2>🎮 超级个体第 2 招：在 Paracraft 3D 世界召唤你的虚拟具身迎宾机器人</h2>
    <button type="button" class="tts-mini" data-tts="第三关：在Paracraft 3D世界里召唤你的虚拟具身迎宾机器人！你可以点击一键打开Paracraft，复制下面的快捷命令粘贴到聊天框运行；也可以展开折叠的CodeBlock代码方块脚本或paracraft-cli自动建造代码一键复制使用！">🔊 听本关说明</button>
  </div>
  <p class="stage-lead"><strong>💡 零门槛自选路线：</strong> 方式 A 只需复制 1 行快捷命令粘贴到 Paracraft 聊天框；方式 B 可展开下方的<strong>代码方块（CodeBlock）脚本</strong>或<strong><code>paracraft-cli</code> 自动建景代码</strong>一键搭建！</p>

  <div class="turnkey-actions">
    <button type="button" class="action-btn accent" id="btn-open-paracraft">🎮 一键打开 Paracraft 3D 世界</button>
    <button type="button" class="action-btn primary" id="btn-copy-autobuild-prompt" data-copy="${html(LESSON1_AI_AUTOBUILD_PROMPT)}">🤖 一键复制“让 AI 自动帮我建好 3D 校门机器人”指令</button>
    <button type="button" class="action-btn secondary" id="btn-mark-stage3-done">✅ 我已完成 Paracraft 体验（点亮第 3 关）</button>
  </div>

  <div class="cmd-cards" aria-label="Paracraft 快捷命令卡（粘贴到聊天框按回车即可）">
    <h3>⚡ 方式 A：零门槛快捷命令（在 Paracraft 按 Enter 打开聊天框，粘贴运行）</h3>
    <div class="cmd-row">
      <div><strong>① 切换晴朗早晨校园环境</strong><br><code>/worldenv -weather=sun</code></div>
      <button type="button" class="copy-chip" data-copy="/worldenv -weather=sun">📋 一键复制命令</button>
    </div>
    <div class="cmd-row">
      <div><strong>② 让具身迎宾机器人播报“正常识别（98%）”迎宾词</strong><br><code>/say 【校门AI具身机器人】摄像头画面清晰(98%)：同学早安，欢迎进入智慧校园！</code></div>
      <button type="button" class="copy-chip" data-copy="/say 【校门AI具身机器人】摄像头画面清晰(98%)：同学早安，欢迎进入智慧校园！">📋 一键复制命令</button>
    </div>
    <div class="cmd-row">
      <div><strong>③ 控制变量实验：开启大雪天气（模拟风雪遮挡镜头视线）</strong><br><code>/snow 8</code></div>
      <button type="button" class="copy-chip" data-copy="/snow 8">📋 一键复制命令</button>
    </div>
    <div class="cmd-row">
      <div><strong>④ 让具身机器人播报“视线受阻（42%）请老师人工核验”</strong><br><code>/say 【校门AI具身机器人】警告：风雪遮挡镜头特征(42%)，已暂停自动开门，请走老师人工核验通道！</code></div>
      <button type="button" class="copy-chip" data-copy="/say 【校门AI具身机器人】警告：风雪遮挡镜头特征(42%)，已暂停自动开门，请走老师人工核验通道！">📋 一键复制命令</button>
    </div>
  </div>

  <details class="code-fold">
    <summary>💻 方式 B（点击展开）：Paracraft 代码方块（CodeBlock）虚拟具身迎宾机器人完整 NPL 代码（附一键复制）</summary>
    <p class="code-note">使用方法：在 Paracraft 中放下一个<strong>电影方块</strong>（放入机器人角色）和一个紧邻的<strong>代码方块（方块ID 219）</strong>，点击下方按钮一键复制代码，粘贴进代码方块并打开拉杆即可点击机器人互动！</p>
    <div class="code-toolbar">
      <button type="button" class="action-btn primary copy-code-btn" data-copy-target="code-student-codeblock">📋 一键复制 CodeBlock 具身机器人代码</button>
    </div>
    <pre id="code-student-codeblock"><code>${html(LESSON1_CODEBLOCK_LUA)}</code></pre>
  </details>

  <details class="code-fold">
    <summary>🛠️ 方式 C（点击展开）：参考 paracraft-cli 规范的 3D 智慧校门与具身机器人自动建造代码（createScene Lua + MCP JSON）</summary>
    <p class="code-note">参考规范：<code>c:/lxzsrc/keepworkExtension/docs/paracraft-cli.md</code> 与 <code>code-blocks.md</code>。可在 AI 工作台连接本地 Keepwork MCP (<code>127.0.0.1:8089</code>) 后通过 <code>paracraft_cli</code> 的 <code>run_command.run_code</code> 一键生成包含校门立柱、状态灯、电影方块、具身机器人演员、代码方块与拉杆的完整可玩场景。</p>
    <div class="code-toolbar">
      <button type="button" class="action-btn primary copy-code-btn" data-copy-target="code-student-createscene">📋 一键复制 createScene 自动建景 Lua 代码</button>
      <button type="button" class="action-btn secondary copy-code-btn" data-copy-target="code-student-mcp-json">📋 一键复制 paracraft_cli MCP 调用 JSON</button>
    </div>
    <h4>1. <code>paracraft-cli</code> <code>run_code</code> (<code>createScene</code>) 完整 Lua 建造源码</h4>
    <pre id="code-student-createscene"><code>${html(LESSON1_PARACRAFT_CLI_CREATE_SCENE_LUA)}</code></pre>
    <h4>2. <code>paracraft_cli</code> 标准动作序列（<code>launch</code> → <code>world_status</code> → <code>run_command</code> → <code>camera_capture</code>）</h4>
    <pre id="code-student-mcp-json"><code>${html(LESSON1_PARACRAFT_CLI_MCP_JSON)}</code></pre>
  </details>
</section>

<section class="turnkey-stage" id="stage-4" aria-label="第4关：随堂自测与生成超级个体作品卡">
  <div class="stage-header">
    <span class="stage-badge">第 4 关 · 5 分钟成果沉淀（存入第二大脑）</span>
    <h2>🏅 超级个体第 3 招：检验判断力，一键生成我的《AI观察与具身机器人作品卡》</h2>
    <button type="button" class="tts-mini" data-tts="第四关：先点选下面三道小测试检验你的判断力，然后点击一键生成我的超级个体作品卡，把你今天的设计与实验结论保存下来！">🔊 听本关说明</button>
  </div>

  <h3>✅ 第一步：3 道快问快答（点击按钮立即看结果）</h3>
  ${quizHtml}

  <div class="portfolio-builder">
    <h3>🪪 第二步：一键生成我的《超级个体 · AI观察与具身机器人作品卡》</h3>
    <div class="grid-2">
      <label>我的创客代号（保护隐私，不填真实姓名）：
        <input type="text" id="student-alias" value="三年级超级个体小导演" maxlength="24" class="turnkey-input">
      </label>
      <label>我在控制变量实验中的核心发现：
        <select id="student-finding" class="turnkey-input">
          <option value="当画面清晰时AI识别率达98%，但镜头被遮挡或环境嘈杂时AI也会认错，必须有老师人工复核！">遮挡/嘈杂时AI也会出错，必须保留人工复核</option>
          <option value="AI具身机器人具备【传感器看/听 → 模型判断 → 具身动作】，而普通电灯开关只有固定电路。">AI具身机器人有感知与模型判断，普通开关只有固定电路</option>
        </select>
      </label>
    </div>
    <label class="pledge-check">
      <input type="checkbox" id="student-pledge" checked>
      <span>🛡️ <strong>我郑重承诺遵守《AI安全小约定》</strong>：使用 AI 工作台和具身机器人时，绝不输入真实姓名、家庭住址、电话号码、身份证号，绝不上传同学隐私照片！</span>
    </label>
    <div class="turnkey-actions">
      <button type="button" class="action-btn accent" id="btn-generate-portfolio">🏅 一键生成我的《超级个体作品卡》（通关！）</button>
      <button type="button" class="action-btn primary" id="btn-copy-portfolio">📋 一键复制作品卡（可粘贴到第二大脑或交作业）</button>
    </div>
    <pre id="student-portfolio-out" class="portfolio-out" aria-live="polite"></pre>
  </div>
</section>
`;
}

export function renderLesson1Teacher(sample, labHtml, quizHtml) {
  const teacherPrompt1 = `请你扮演我们学校校门口的“Paracraft 3D 虚拟具身迎宾机器人（小帕）”，用三年级小学生听得懂、活泼生动的语言回答：
1. 你身上的“眼睛（摄像头）”和“耳朵（麦克风）”是怎样感知环境的？
2. 你和教室墙上的“普通翘板电灯开关”有什么本质区别？
3. 请控制在 120 字以内，最后向全班同学提一个互动小问题。`;

  const teacherPrompt2 = `我们全班正在做“控制变量对比实验”：
实验条件 A（正常）：阳光充足，同学正对校门具身机器人镜头；
实验条件 B（改变1个条件）：同学撑着伞逆光走来，挡住了一半脸，而且旁边大货车很吵，同学说“今天下午下雪”。
请你分条对比：在条件 A 和条件 B 下，具身机器人的图像识别和语音识别分别会发生什么变化？为什么遇到条件 B 时必须“停步亮黄灯并请老师人工确认”？`;

  return `
<section class="turnkey-banner teacher-banner" aria-label="教师大屏开箱即用控场台">
  <div class="banner-top">
    <div>
      <span class="pill dark">🖥️ 教师大屏开箱即用模式（普通教室 1 台电脑 + 投影仪直接上课）</span>
      <span class="pill">⏱️ 40 分钟五步教学法 · 全流程控场台</span>
    </div>
    <div class="stage-filter" id="teacher-stage-filter" role="toolbar" aria-label="课堂环节切换">
      <button type="button" aria-pressed="true" data-filter="all">📋 全部展开</button>
      <button type="button" aria-pressed="false" data-filter="t-step1">① 导入与投票(5分)</button>
      <button type="button" aria-pressed="false" data-filter="t-step2">② 具身感知实验(10分)</button>
      <button type="button" aria-pressed="false" data-filter="t-step3">③ AI工作台演示(10分)</button>
      <button type="button" aria-pressed="false" data-filter="t-step4">④ Paracraft演示(10分)</button>
      <button type="button" aria-pressed="false" data-filter="t-step5">⑤ 检测与安全(5分)</button>
    </div>
  </div>
  <p class="toast-bar" id="turnkey-toast" role="status" aria-live="polite">🧑‍🏫 教师提示：点击上方环节按钮可聚焦当前教学阶段；课中所有 AI 工作台文字与 Paracraft 代码均支持【一键复制】、【一键打开】与【大屏免切屏直接演示】。</p>
</section>

<section class="turnkey-stage teacher-step" data-tstep="t-step1" aria-label="第1步：情境导入与全班举手投票">
  <div class="stage-header">
    <span class="stage-badge">第 1 步 · 情境导入（0—5 分钟）</span>
    <h2>🗳️ 全班大屏互动投票：这 4 件校园设备，谁装了“AI 大脑”？</h2>
  </div>
  <details class="script-fold" open>
    <summary>🎙️ 展开/收起：教师开场逐字话术（直接照读即可破冰）</summary>
    <p>“同学们，早上进校门时，如果有一台 <strong>3D 虚拟具身迎宾机器人</strong>看着你的校牌向你挥手问好；走进教室，班长按了一下墙上的<strong>电灯开关</strong>灯亮了。大家先别急着下结论——请先独立思考 10 秒钟：下面的 4 件设备里，哪些真的用到了人工智能（AI）？哪些只是普通固定电路机器？现在我们全班举手投票！”</p>
  </details>
  <div class="poll-grid" id="teacher-poll-grid" aria-label="全班举手投票计分器">
    <div class="poll-card" data-dev="0">
      <h3>🤖 1. 校门刷脸迎宾具身机器人</h3>
      <p>看画面认校牌 + 挥手迎宾</p>
      <div class="poll-btns">
        <button type="button" class="poll-inc" data-vote="ai">🙋 认为有 AI (<span class="cnt">0</span>)</button>
        <button type="button" class="poll-inc" data-vote="no">⚙️ 认为无 AI (<span class="cnt">0</span>)</button>
      </div>
      <small class="poll-ans" hidden>✅ <strong>有 AI（图像识别+具身控制）</strong>：摄像头采集图像 → 模型提取特征匹配 → 驱动手臂与闸机行动。</small>
    </div>
    <div class="poll-card" data-dev="1">
      <h3>🌿 2. 植物角平板拍照识花App</h3>
      <p>拍树叶照片 → 显示植物名称</p>
      <div class="poll-btns">
        <button type="button" class="poll-inc" data-vote="ai">🙋 认为有 AI (<span class="cnt">0</span>)</button>
        <button type="button" class="poll-inc" data-vote="no">⚙️ 认为无 AI (<span class="cnt">0</span>)</button>
      </div>
      <small class="poll-ans" hidden>✅ <strong>有 AI（图像分类识别）</strong>：识别叶片形状、叶脉与锯齿特征并计算匹配概率。</small>
    </div>
    <div class="poll-card" data-dev="2">
      <h3>🏠 3. 温馨客厅智能语音音箱</h3>
      <p>听语音提问 → 播报今日天气</p>
      <div class="poll-btns">
        <button type="button" class="poll-inc" data-vote="ai">🙋 认为有 AI (<span class="cnt">0</span>)</button>
        <button type="button" class="poll-inc" data-vote="no">⚙️ 认为无 AI (<span class="cnt">0</span>)</button>
      </div>
      <small class="poll-ans" hidden>✅ <strong>有 AI（语音识别+自然语言处理）</strong>：将声波转为文字、理解意图并合成语音回答。</small>
    </div>
    <div class="poll-card" data-dev="3">
      <h3>💡 4. 教室墙面普通翘板电灯开关</h3>
      <p>手指按下 → 电路接通灯亮</p>
      <div class="poll-btns">
        <button type="button" class="poll-inc" data-vote="ai">🙋 认为有 AI (<span class="cnt">0</span>)</button>
        <button type="button" class="poll-inc" data-vote="no">⚙️ 认为无 AI (<span class="cnt">0</span>)</button>
      </div>
      <small class="poll-ans" hidden>⚙️ <strong>无 AI（普通机械开关）</strong>：仅靠铜片物理接触通断电流，不会感知图像或声音，也不会分析判断。</small>
    </div>
  </div>
  <div class="turnkey-actions">
    <button type="button" class="action-btn accent" id="btn-reveal-poll">✨ 一键揭晓全班投票科学结论</button>
    <button type="button" class="action-btn secondary" id="btn-reset-poll">🔄 重置投票计数</button>
  </div>
</section>

<section class="turnkey-stage teacher-step" data-tstep="t-step2" aria-label="第2步：概念理解与交互实验台">
  <div class="stage-header">
    <span class="stage-badge">第 2 步 · 概念理解与控制变量实验（5—15 分钟）</span>
    <h2>🔬 大屏交互实验室：感知 → 模型判断 → 具身行动（含遮挡与噪音干扰对比）</h2>
  </div>
  <div class="quick-guide-row">
    <span><strong>教师大屏一键实验快捷键：</strong></span>
    <button type="button" class="action-btn secondary t-quick-scene" data-dev="0" data-cond="0">☀️ 演示1：具身机器人正常识别(98%)</button>
    <button type="button" class="action-btn secondary t-quick-scene" data-dev="0" data-cond="1">🕶️ 演示2：逆光遮挡一半(降至42%)</button>
    <button type="button" class="action-btn secondary t-quick-scene" data-dev="2" data-cond="2">📢 演示3：嘈杂同音字(“下雪”变“下学”)</button>
    <button type="button" class="action-btn secondary t-quick-scene" data-dev="3" data-cond="0">💡 演示4：普通电灯开关对比</button>
  </div>
  ${labHtml}
</section>

<section class="turnkey-stage teacher-step" data-tstep="t-step3" aria-label="第3步：AI工作台大屏一键演示">
  <div class="stage-header">
    <span class="stage-badge">第 3 步 · AI 工作台大屏演示（15—25 分钟）</span>
    <h2>💬 教师一键演示卡片：向 AI 工作台发指令（一键复制 / 一键打开 / 大屏直接展示）</h2>
  </div>
  <div class="grid-2">
    <div class="card-box prompt-card">
      <h3>📌 课堂演示 1：让 AI 扮演“校门虚拟具身迎宾机器人”自我介绍</h3>
      <pre class="prompt-pre" id="t-prompt-1">${html(teacherPrompt1)}</pre>
      <div class="turnkey-actions">
        <button type="button" class="action-btn primary copy-code-btn" data-copy-target="t-prompt-1">📋 一键复制文字</button>
        <button type="button" class="action-btn accent open-ai-with-target" data-copy-target="t-prompt-1">🚀 一键在 AI 工作台打开</button>
        <button type="button" class="action-btn secondary t-sim-btn" data-sim="1">⚡ 大屏直接展示 AI 回复</button>
      </div>
      <div class="ai-sim-output" id="t-sim-out-1" hidden></div>
    </div>

    <div class="card-box prompt-card">
      <h3>📌 课堂演示 2：控制变量提问——为什么遮挡与嘈杂时必须“人工复核”？</h3>
      <pre class="prompt-pre" id="t-prompt-2">${html(teacherPrompt2)}</pre>
      <div class="turnkey-actions">
        <button type="button" class="action-btn primary copy-code-btn" data-copy-target="t-prompt-2">📋 一键复制文字</button>
        <button type="button" class="action-btn accent open-ai-with-target" data-copy-target="t-prompt-2">🚀 一键在 AI 工作台打开</button>
        <button type="button" class="action-btn secondary t-sim-btn" data-sim="2">⚡ 大屏直接展示 AI 回复</button>
      </div>
      <div class="ai-sim-output" id="t-sim-out-2" hidden></div>
    </div>
  </div>
</section>

<section class="turnkey-stage teacher-step" data-tstep="t-step4" aria-label="第4步：Paracraft虚拟具身机器人与paracraft-cli演示">
  <div class="stage-header">
    <span class="stage-badge">第 4 步 · Paracraft 虚拟具身机器人大屏演示（25—35 分钟）</span>
    <h2>🎮 Paracraft 3D 校门具身机器人演示（快捷命令 + 折叠 <code>paracraft-cli</code> 建景代码）</h2>
  </div>
  <div class="turnkey-actions">
    <button type="button" class="action-btn accent" id="btn-t-open-paracraft">🎮 一键打开 Paracraft 3D 世界</button>
    <button type="button" class="action-btn primary" data-copy="${html(LESSON1_AI_AUTOBUILD_PROMPT)}">🤖 一键复制“让 AI 自动搭建校门具身机器人场景”提示词</button>
    <button type="button" class="copy-chip" data-copy="/worldenv -weather=sun">📋 复制晴天命令 <code>/worldenv -weather=sun</code></button>
    <button type="button" class="copy-chip" data-copy="/snow 8">📋 复制风雪干扰命令 <code>/snow 8</code></button>
  </div>

  <details class="code-fold">
    <summary>💻 点击展开：Paracraft 代码方块（CodeBlock）校门具身迎宾机器人 NPL 脚本（一键复制）</summary>
    <div class="code-toolbar">
      <button type="button" class="action-btn primary copy-code-btn" data-copy-target="code-teacher-codeblock">📋 一键复制 CodeBlock 脚本</button>
    </div>
    <pre id="code-teacher-codeblock"><code>${html(LESSON1_CODEBLOCK_LUA)}</code></pre>
  </details>

  <details class="code-fold">
    <summary>🛠️ 点击展开：参考 paracraft-cli 规范的一键自动建景代码（createScene Lua + MCP JSON）</summary>
    <div class="code-toolbar">
      <button type="button" class="action-btn primary copy-code-btn" data-copy-target="code-teacher-createscene">📋 一键复制 createScene Lua 源码</button>
      <button type="button" class="action-btn secondary copy-code-btn" data-copy-target="code-teacher-mcp-json">📋 一键复制 paracraft_cli MCP JSON</button>
    </div>
    <pre id="code-teacher-createscene"><code>${html(LESSON1_PARACRAFT_CLI_CREATE_SCENE_LUA)}</code></pre>
    <pre id="code-teacher-mcp-json"><code>${html(LESSON1_PARACRAFT_CLI_MCP_JSON)}</code></pre>
  </details>
</section>

<section class="turnkey-stage teacher-step" data-tstep="t-step5" aria-label="第5步：随堂概念检测与安全约定">
  <div class="stage-header">
    <span class="stage-badge">第 5 步 · 随堂检测与伦理反思（35—40 分钟）</span>
    <h2>✅ 全班随堂辨析（先请学生举手选，再点选按钮揭晓证据）</h2>
  </div>
  ${quizHtml}
</section>
`;
}

export function renderStandardTurnkeyBlock({ p, g, n, title, task, normal, change, meta, codingHint }) {
  const aiPrompt = `我正在学习《超级学生AI通识课》${g}年级第${n}课《${title}》（培养超级个体：学会清楚说出意图、控制变量核验结果、遵守AI安全底线）。
【我的目标任务】${task}
【第一轮正常达标要求】${normal}
【第二轮控制变量对比实验】${change}
【安全与伦理边界】${meta.boundary}
请帮我：
1. 用清晰易懂的步骤，指导我完成第一轮基础作品；
2. 帮我设计第二轮“只改变一个条件”的对比实验观察表；
3. 如果本课涉及 Paracraft 3D 世界或虚拟具身机器人，请提供可直接复制的快捷命令或 CodeBlock 代码方块脚本。`;

  const paracraftFold = p === 'P' ? `
  <details class="code-fold">
    <summary>🛠️ 点击展开：Paracraft 快捷命令、代码方块（CodeBlock）与 paracraft-cli 参考代码（一键复制）</summary>
    <p class="code-note">提示：${html(codingHint || '在角色关联的代码方块中编写感知、条件判断与具身动作逻辑。')} 以下命令与代码可一键复制粘贴到 Paracraft 聊天框或代码方块中运行。</p>
    <div class="turnkey-actions">
      <button type="button" class="copy-chip" data-copy="/worldenv -weather=sun">📋 复制晴朗环境 <code>/worldenv -weather=sun</code></button>
      <button type="button" class="copy-chip" data-copy="/say 具身智能体已就绪，开始执行第1轮正常测试！">📋 复制播报命令 <code>/say ...</code></button>
      <button type="button" class="action-btn primary copy-code-btn" data-copy-target="std-codeblock-${g}-${n}">📋 一键复制 CodeBlock 模板代码</button>
    </div>
    <pre id="std-codeblock-${g}-${n}"><code>-- ${html(g + '年级第' + n + '课《' + title + '》Paracraft 虚拟具身机器人 / 场景交互模板')}
-- 参考 c:/lxzsrc/keepworkExtension/docs/paracraft-cli.md 与 code-blocks.md
setActorValue("sentientRadius", 0)
say("🤖 具身智能体已启动：准备执行【第一轮正常条件】测试！", 3)

registerClickEvent(function()
    local choice = ask("请选择实验轮次（控制变量对比）：", {
        "① 第一轮：正常条件测试（验证基础达标证据）",
        "② 第二轮：只改变一个条件（观察行为与结果变化）"
    })
    if choice == 1 then
        say("✅ 正在运行第一轮正常测试：特征清晰，按规则前往目标点！", 4)
        walkForward(2, 1.0)
    elseif choice == 2 then
        say("🔬 正在运行第二轮控制变量实验：条件改变，触发边界保护或分支处理！", 4)
        turnTo(90)
    end
end)</code></pre>
  </details>` : '';

  return `
<section class="card-box turnkey-standard-box" aria-label="开箱即用AI工作台与Paracraft工具箱">
  <h2>⚡ 开箱即用工具箱（培养超级个体：一键复制提示词 / 一键打开工作台）</h2>
  <p class="toast-bar" id="turnkey-toast" role="status" aria-live="polite">💡 点击下方按钮即可一键复制本课 AI 工作台提示词，或直接打开 AI 工作台与 Paracraft！</p>
  <label for="std-ai-prompt-${g}-${n}"><strong>💬 本课 AI 工作台可直接输入的文字（可按需修改后一键复制）：</strong></label>
  <textarea id="std-ai-prompt-${g}-${n}" rows="5" class="turnkey-textarea">${html(aiPrompt)}</textarea>
  <div class="turnkey-actions">
    <button type="button" class="action-btn primary copy-textarea-btn" data-target="std-ai-prompt-${g}-${n}">📋 一键复制 AI 工作台文字</button>
    <button type="button" class="action-btn accent open-ai-textarea-btn" data-target="std-ai-prompt-${g}-${n}">🚀 一键打开 AI 工作台（自动复制文字）</button>
    ${p === 'P' ? '<button type="button" class="action-btn secondary btn-open-paracraft-std">🎮 一键打开 Paracraft 3D 世界</button>' : ''}
  </div>
  ${paracraftFold}
</section>`;
}

export const TURNKEY_RUNTIME_JS = `
(() => {
  const AI_URL = 'https://keepwork.com/chat';
  const PC_URL = 'https://webparacraft.keepwork.com/keepwork/online.html';
  const toastEl = document.getElementById('turnkey-toast');

  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('flash');
    setTimeout(() => toastEl.classList.remove('flash'), 1800);
  }

  async function copyText(text, label = '内容') {
    const val = String(text || '').trim();
    if (!val) return false;
    try {
      await navigator.clipboard.writeText(val);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = val;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch {}
      ta.remove();
    }
    showToast('✅ 已一键复制' + label + '！可直接粘贴 (Ctrl+V) 使用。');
    return true;
  }

  function postHostBridge(command, args) {
    const payload = {
      channel: 'aichat.external-tool.v1',
      type: 'tool:host-command',
      requestId: 'lesson_' + Date.now(),
      command,
      args
    };
    let sent = false;
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(payload, '*');
        sent = true;
      }
      if (window.top && window.top !== window && window.top !== window.parent) {
        window.top.postMessage(payload, '*');
        sent = true;
      }
    } catch {}
    return sent;
  }

  async function openAIWorkbenchWithPrompt(promptText) {
    await copyText(promptText, 'AI 工作台提示词');
    postHostBridge('openUserTool', { tool: 'chat', prompt: promptText });
    try {
      window.open(AI_URL, '_blank', 'noopener');
    } catch {}
    showToast('🚀 已自动复制提示词并打开 AI 工作台！在输入框粘贴 (Ctrl+V) 即可发送。');
  }

  function openParacraftWorld() {
    postHostBridge('openUserTool', { tool: 'paracraft' });
    try {
      window.open(PC_URL, '_blank', 'noopener');
    } catch {}
    showToast('🎮 已为你打开 Paracraft 3D 创作世界！');
  }

  // Mission Stage Tracker for Lesson 1 Student Workbench
  const completedStages = new Set();
  function markStageDone(stageNum, reason) {
    completedStages.add(Number(stageNum));
    const stepEl = document.querySelector('.mission-step[data-stage="' + stageNum + '"]');
    if (stepEl) {
      stepEl.classList.add('done');
      const st = stepEl.querySelector('.step-state');
      if (st) st.textContent = '✅ 已完成';
    }
    if (reason) showToast(reason + '（当前闯关进度：' + completedStages.size + ' / 4 关）');
  }

  window.addEventListener('lesson1:lab-complete', () => {
    markStageDone(1, '🎉 第 1 关完成！你已在实验室完成 AI 识别与对比实验');
  });

  // Stage 1 quick auto-demo button for students
  const autoDemoBtn = document.getElementById('btn-auto-demo-stage1');
  if (autoDemoBtn) {
    autoDemoBtn.addEventListener('click', () => {
      const sel = document.getElementById('density');
      if (sel) { sel.value = '0'; sel.dispatchEvent(new Event('change')); }
      const predBtn = document.querySelector('[data-group="prediction"] button[data-choice="0"]');
      if (predBtn) predBtn.click();
      const condNormal = document.querySelector('[data-group="condition"] button[data-choice="0"]');
      const runBtn = document.getElementById('run');
      if (condNormal && runBtn) { condNormal.click(); runBtn.click(); }
      const condOccluded = document.querySelector('[data-group="condition"] button[data-choice="1"]');
      if (condOccluded && runBtn) { condOccluded.click(); runBtn.click(); }
      markStageDone(1, '⚡ 已自动完成“正常清晰 vs 镜头遮挡”两次对比实验！请查看实验记录栏');
    });
  }

  // Stage 2 Prompt Builder for Lesson 1 Student Workbench
  const studentPromptEl = document.getElementById('student-ai-prompt');
  const builderState = {
    role: '校门刷脸迎宾具身机器人',
    sensor: '高清摄像头（图像识别：看校牌与手势）',
    safety: '立即停下脚步亮起黄灯，礼貌请值班老师人工确认，绝不盲目放行'
  };

  function syncStudentPrompt() {
    if (!studentPromptEl) return;
    studentPromptEl.value =
      '你好 AI 助手！我是三年级超级个体小创客，请帮我设计一台 Paracraft 3D【' + builderState.role + '】：\\n' +
      '1. 它的感知器官是：' + builderState.sensor + '；\\n' +
      '2. 当环境清晰正常时，请写出它热情迎宾的台词和动作；\\n' +
      '3. 当遇到镜头被遮挡或周围嘈杂时，它的安全规则是：' + builderState.safety + '；\\n' +
      '4. 请同时给我一段可以直接粘贴到 Paracraft 聊天框运行的 /say 命令（注意遵守隐私安全底线，不要包含任何真实姓名、住址或电话）。';
  }

  for (const grp of document.querySelectorAll('.chip-group[data-builder]')) {
    grp.addEventListener('click', e => {
      const btn = e.target.closest('button[data-val]');
      if (!btn) return;
      const key = grp.dataset.builder;
      for (const b of grp.querySelectorAll('button')) b.setAttribute('aria-pressed', String(b === btn));
      builderState[key] = btn.dataset.val;
      syncStudentPrompt();
      showToast('✨ 已更新你的具身机器人设计参数：【' + btn.textContent.trim() + '】');
    });
  }
  syncStudentPrompt();

  const btnCopyAiPrompt = document.getElementById('btn-copy-ai-prompt');
  if (btnCopyAiPrompt && studentPromptEl) {
    btnCopyAiPrompt.addEventListener('click', async () => {
      await copyText(studentPromptEl.value, 'AI 工作台提示词');
      markStageDone(2, '🎉 第 2 关完成！已复制你定制的 AI 工作台提示词');
    });
  }

  const btnOpenAiPrompt = document.getElementById('btn-open-aichat-prompt');
  if (btnOpenAiPrompt && studentPromptEl) {
    btnOpenAiPrompt.addEventListener('click', async () => {
      await openAIWorkbenchWithPrompt(studentPromptEl.value);
      markStageDone(2, '🎉 第 2 关完成！已复制提示词并打开 AI 工作台');
    });
  }

  const btnSimAi = document.getElementById('btn-simulate-ai-reply');
  const simBox = document.getElementById('student-ai-reply-box');
  if (btnSimAi && simBox) {
    btnSimAi.addEventListener('click', () => {
      simBox.hidden = false;
      const cmdLine = '/say 【' + builderState.role + '】正在通过' + builderState.sensor.split('（')[0] + '为您服务！若看不清特征将请老师人工确认！';
      simBox.innerHTML =
        '<h4>🤖 AI 工作台已为你生成【' + builderState.role + '】方案：</h4>' +
        '<ul>' +
        '<li><strong>① 感知层（输入）：</strong>搭载 <em>' + builderState.sensor + '</em>，实时采集门前画面与声音特征。</li>' +
        '<li><strong>② 大脑决策（AI模型）：</strong>画面清晰（置信度 ≥ 95%）时判定为本校校牌，触发迎宾动作；当被雨伞遮挡或噪音干扰（置信度 &lt; 60%）时触发异常保护。</li>' +
        '<li><strong>③ 具身行动与安全降级（输出）：</strong>' + builderState.safety + '。</li>' +
        '<li><strong>④ 可直接粘贴进 Paracraft 的命令：</strong><code>' + cmdLine + '</code></li>' +
        '</ul>';
      markStageDone(2, '🎉 第 2 关完成！你已在本页验证 AI 工作台生成的具身机器人方案');
    });
  }

  // Stage 3 Paracraft buttons
  const btnOpenPc = document.getElementById('btn-open-paracraft');
  if (btnOpenPc) {
    btnOpenPc.addEventListener('click', () => {
      openParacraftWorld();
      markStageDone(3, '🎉 第 3 关点亮！已打开 Paracraft 3D 世界');
    });
  }
  const btnMarkS3 = document.getElementById('btn-mark-stage3-done');
  if (btnMarkS3) {
    btnMarkS3.addEventListener('click', () => {
      markStageDone(3, '🎉 第 3 关完成！你已掌握 Paracraft 虚拟具身机器人命令与代码');
    });
  }

  // Stage 4 Portfolio Generator
  const btnGenPortfolio = document.getElementById('btn-generate-portfolio');
  const portfolioOut = document.getElementById('student-portfolio-out');
  function buildPortfolioText() {
    const alias = (document.getElementById('student-alias')?.value || '三年级超级个体小导演').trim();
    const finding = document.getElementById('student-finding')?.value || '';
    const pledged = document.getElementById('student-pledge')?.checked;
    return [
      '==================================================',
      '🏅 《超级个体 · AI观察与具身机器人作品卡》（三年级第 1 课）',
      '==================================================',
      '👤 创客代号：' + alias + '（已遵守隐私最小化原则，不填写真实姓名/电话/住址）',
      '🤖 我设计的具身机器人：' + builderState.role,
      '👁️ 搭载的AI感知本领：' + builderState.sensor,
      '🛡️ 异常干扰与安全规则：' + builderState.safety,
      '🔬 控制变量实验结论：' + finding,
      '📜 AI安全小约定签署状态：' + (pledged ? '✅ 已签署（绝不上传隐私信息，坚持人工最终判断）' : '⚠️ 请先勾选安全约定'),
      '📝 AI使用透明声明：本作品方案由学生提出意图，借助 AIChat 与 Paracraft 虚拟具身机器人验证完成。',
      '=================================================='
    ].join('\\n');
  }
  if (btnGenPortfolio && portfolioOut) {
    btnGenPortfolio.addEventListener('click', () => {
      portfolioOut.textContent = buildPortfolioText();
      markStageDone(4, '🏆 恭喜通关！已生成你的《超级个体·AI观察与具身机器人作品卡》');
    });
    portfolioOut.textContent = buildPortfolioText();
  }
  const btnCopyPortfolio = document.getElementById('btn-copy-portfolio');
  if (btnCopyPortfolio && portfolioOut) {
    btnCopyPortfolio.addEventListener('click', async () => {
      if (!portfolioOut.textContent.trim()) portfolioOut.textContent = buildPortfolioText();
      await copyText(portfolioOut.textContent, '《超级个体作品卡》');
      markStageDone(4, '🏆 已复制你的《超级个体作品卡》！');
    });
  }

  // Generic Copy Buttons ([data-copy], .copy-code-btn, .copy-textarea-btn, .open-ai-with-target, .open-ai-textarea-btn)
  document.addEventListener('click', async e => {
    const copyDirect = e.target.closest('[data-copy]');
    if (copyDirect) {
      await copyText(copyDirect.dataset.copy, '命令/指令');
      if (copyDirect.closest('#stage-3')) markStageDone(3, '🎉 第 3 关点亮！已复制 Paracraft 命令');
      return;
    }
    const copyCodeBtn = e.target.closest('.copy-code-btn');
    if (copyCodeBtn) {
      const target = document.getElementById(copyCodeBtn.dataset.copyTarget);
      if (target) {
        await copyText(target.textContent, '代码/文字');
        if (copyCodeBtn.closest('#stage-3')) markStageDone(3, '🎉 第 3 关点亮！已复制 Paracraft 代码');
      }
      return;
    }
    const copyTaBtn = e.target.closest('.copy-textarea-btn');
    if (copyTaBtn) {
      const ta = document.getElementById(copyTaBtn.dataset.target);
      if (ta) await copyText(ta.value, 'AI 工作台提示词');
      return;
    }
    const openAiTarget = e.target.closest('.open-ai-with-target');
    if (openAiTarget) {
      const el = document.getElementById(openAiTarget.dataset.copyTarget);
      if (el) await openAIWorkbenchWithPrompt(el.textContent);
      return;
    }
    const openAiTa = e.target.closest('.open-ai-textarea-btn');
    if (openAiTa) {
      const ta = document.getElementById(openAiTa.dataset.target);
      if (ta) await openAIWorkbenchWithPrompt(ta.value);
      return;
    }
    if (e.target.closest('#btn-t-open-paracraft') || e.target.closest('.btn-open-paracraft-std')) {
      openParacraftWorld();
      return;
    }
    const ttsMini = e.target.closest('.tts-mini');
    if (ttsMini && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(ttsMini.dataset.tts || '');
      u.lang = 'zh-CN';
      u.rate = 1.0;
      window.speechSynthesis.speak(u);
      showToast('🔊 正在为你语音朗读本关操作指南…');
    }
  });

  // Top TTS toggle for student workbench
  const ttsToggle = document.getElementById('btn-tts-toggle');
  if (ttsToggle) {
    ttsToggle.addEventListener('click', () => {
      if (!('speechSynthesis' in window)) {
        showToast('💡 当前浏览器不支持内置语音合成，请直接按步骤卡片点击操作。');
        return;
      }
      const active = ttsToggle.getAttribute('aria-pressed') === 'true';
      if (active) {
        window.speechSynthesis.cancel();
        ttsToggle.setAttribute('aria-pressed', 'false');
        ttsToggle.textContent = '🔊 读题小助手：点击朗读本页步骤';
        showToast('⏹️ 已停止语音朗读。');
      } else {
        window.speechSynthesis.cancel();
        const textToRead = '欢迎来到超级学生AI通识课第一课！本页无需老师帮忙，你可以独立完成四关挑战：第一关，在实验室分辨谁有AI大脑并测试遮挡影响；第二关，点选彩色按钮组合你的意图，一键复制或打开AI工作台；第三关，一键打开Paracraft，复制命令或展开代码方块脚本召唤你的虚拟具身迎宾机器人；第四关，一键生成你的超级个体作品卡！';
        const u = new SpeechSynthesisUtterance(textToRead);
        u.lang = 'zh-CN';
        u.onend = () => {
          ttsToggle.setAttribute('aria-pressed', 'false');
          ttsToggle.textContent = '🔊 读题小助手：点击朗读本页步骤';
        };
        ttsToggle.setAttribute('aria-pressed', 'true');
        ttsToggle.textContent = '⏹️ 正在朗读（点击停止）';
        window.speechSynthesis.speak(u);
      }
    });
  }

  // Teacher Big-Screen Stage Filter, Poll & Quick Scene Buttons
  const stageFilter = document.getElementById('teacher-stage-filter');
  if (stageFilter) {
    stageFilter.addEventListener('click', e => {
      const btn = e.target.closest('button[data-filter]');
      if (!btn) return;
      const filter = btn.dataset.filter;
      for (const b of stageFilter.querySelectorAll('button')) b.setAttribute('aria-pressed', String(b === btn));
      for (const sec of document.querySelectorAll('.teacher-step')) {
        sec.hidden = filter !== 'all' && sec.dataset.tstep !== filter;
      }
    });
  }

  const pollGrid = document.getElementById('teacher-poll-grid');
  if (pollGrid) {
    pollGrid.addEventListener('click', e => {
      const inc = e.target.closest('.poll-inc');
      if (!inc) return;
      const cnt = inc.querySelector('.cnt');
      if (cnt) cnt.textContent = String(Number(cnt.textContent || 0) + 1);
    });
    const btnReveal = document.getElementById('btn-reveal-poll');
    if (btnReveal) {
      btnReveal.addEventListener('click', () => {
        for (const ans of pollGrid.querySelectorAll('.poll-ans')) ans.hidden = false;
        showToast('✨ 已揭晓全班投票科学结论！');
      });
    }
    const btnReset = document.getElementById('btn-reset-poll');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        for (const cnt of pollGrid.querySelectorAll('.cnt')) cnt.textContent = '0';
        for (const ans of pollGrid.querySelectorAll('.poll-ans')) ans.hidden = true;
        showToast('🔄 已重置投票计数。');
      });
    }
  }

  for (const qBtn of document.querySelectorAll('.t-quick-scene')) {
    qBtn.addEventListener('click', () => {
      const dev = Number(qBtn.dataset.dev || 0);
      const cond = Number(qBtn.dataset.cond || 0);
      const sel = document.getElementById('density');
      if (sel) { sel.value = String(dev); sel.dispatchEvent(new Event('change')); }
      const expectedPred = [0, 0, 1, 2][dev];
      const pBtn = document.querySelector('[data-group="prediction"] button[data-choice="' + expectedPred + '"]');
      if (pBtn) pBtn.click();
      const cBtn = document.querySelector('[data-group="condition"] button[data-choice="' + cond + '"]');
      if (cBtn) cBtn.click();
      const runBtn = document.getElementById('run');
      if (runBtn) runBtn.click();
    });
  }

  for (const simBtn of document.querySelectorAll('.t-sim-btn')) {
    simBtn.addEventListener('click', () => {
      const id = simBtn.dataset.sim;
      const out = document.getElementById('t-sim-out-' + id);
      if (!out) return;
      out.hidden = false;
      if (id === '1') {
        out.innerHTML = '<strong>🤖 小帕（校门 3D 虚拟具身迎宾机器人）：</strong><br>“同学们好！我头顶的摄像头就像眼睛，能拍下大家胸前的校牌画面；肚子里的 AI 模型会在一眨眼间比对图像特征；认出是咱们学校的同学后，我就会挥起机械臂说‘早安’并打开闸机！而教室墙上的电灯开关没有传感器也没有AI模型，谁按它都只会通电亮灯。考考大家：如果下雨天你的雨伞挡住了校牌，我还能认出你吗？”';
      } else {
        out.innerHTML = '<strong>🔬 控制变量对比结论（AI 助教生成）：</strong><br>1. <strong>条件 A（正常清晰）：</strong>摄像头采集到完整特征，图像识别置信度 98%，语音转写准确，具身机器人正常挥手放行；<br>2. <strong>条件 B（雨伞遮挡+大车喧哗）：</strong>视觉特征丢失一半（置信度跌至 42%），且噪音使语音把“下雪”误转写为“下学”；<br>3. <strong>安全边界：</strong>因为 AI 会受环境干扰出错，所以在校门安防等关键场景必须设置<strong>“识别率低时停步亮黄灯，转交值班老师人工核验”</strong>的底线！';
      }
    });
  }
})();
`;
