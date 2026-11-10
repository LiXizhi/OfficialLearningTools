import fs from 'node:fs';

const asset = name => fs.readFileSync(new URL(name, import.meta.url), 'utf8');
const choice = (value, label) => `<button type="button" data-choice="${value}" aria-pressed="false">${label}</button>`;
const choices = labels => labels.map((label, i) => choice(i, label)).join('');
const notes = '<p class="feedback" role="status"></p>';

const activities = {
    0: {
        theme: 'snow',
        caption: '校园与虚拟具身机器人 AI 探索实验室（环境感知 → AI大脑判断 → 具身动作反馈）',
        label: '五步教学互动实验 · 小学低年级（3年级第1课 · 结合 Paracraft 虚拟具身机器人）',
        intro: '本课核心任务：① 区分“AI具身机器人/智能应用”与“普通固定机器”；② 通过遮挡与嘈杂干扰实验发现“AI也会出错”；③ 在 AI 工作台与 Paracraft 中召唤你的虚拟具身迎宾机器人。',
        scene: '<output id="weather">当前设备：🤖 校门刷脸迎宾具身机器人 · ☀️ 环境正常（识别率 98%）</output>',
        controls: `<h2>第一步：认识设备与具身AI本领</h2>
        <p>点击切换 4 个校园与生活设备，先判断它用的是什么技术：</p>
        <label for="density">1. 选择要观察的设备（含 Paracraft 虚拟具身机器人）</label>
        <select id="density">
          <option value="0">🤖 智慧校门 · 刷脸迎宾具身机器人（Paracraft 3D）</option>
          <option value="1">🌿 科学植物角 · 平板拍照识花App</option>
          <option value="2">🏠 温馨客厅 · 智能语音音箱</option>
          <option value="3">💡 教室墙面 · 普通翘板电灯开关</option>
        </select>
        <label>2. 判断：它属于哪一类？用了什么本领？</label>
        <div data-group="prediction">${choices(['🤖 AI：图像识别（机器会看+具身迎宾）', '🤖 AI：语音交互（机器会听会说）', '⚙️ 普通机器（固定电路，无AI）'])}</div>
        <label>3. 控制变量实验：如果环境受到干扰会怎样？</label>
        <div data-group="condition">${choices(['☀️ 正常清晰', '🕶️ 遮挡一半/逆光', '📢 环境嘈杂/同音字'])}</div>
        <button class="run" id="run">🔬 运行识别测试并记录</button>
        <button id="reply">🪪 生成我的《AI观察卡与安全约定》</button>${notes}`,
        follow: '<h2>📋 课堂实验记录与我的《AI在哪里观察卡》</h2><p>每次点击“运行识别测试”或“生成观察卡”，都会在下方生成过程证据：</p><div id="observations" aria-label="实验记录"></div>',
    },
    19: {
        theme: 'gallery',
        caption: '校园科技文化展 · 生成式AI原理与“三步事实核查”工作台',
        label: '五步教学互动实验 · 小学高年级（5年级第4课）',
        intro: '本课核心任务：① 对比“模糊提示词”与“带资料约束提示词”；② 对照馆藏真实档案逐句揪出“AI幻觉”与“事实冲突”；③ 修改展签并规范签署《AI辅助创作声明》。',
        scene: '<output id="archive-bar">馆藏可靠档案：[1] 五年级科学社本周五展出《校园气象站记录仪》 ｜ [2] 共展出 3 份手绘气温图表 ｜ [3] 林老师指导，可体验读数（未提获奖记录）</output>',
        controls: `<h2>第一步：提示词对比与逐句事实体检</h2>
        <label>1. 提示词对比实验：观察不同提示词对“AI幻觉”的影响</label>
        <div data-group="promptmode">${choices(['提示词A：写得越轰动越好（无约束）', '提示词B：仅据档案[1]-[3]写（有约束）'])}</div>
        <label>2. 逐句核查AI草稿（点击句子，对照左侧馆藏档案[1]-[3]）</label>
        <div class="steps" data-group="claim">${choices(['第 1 句（时间与展品）', '第 2 句（图表数量）', '第 3 句（获奖与历史）'])}</div>
        <blockquote id="claim"></blockquote>
        <label>3. 你的核查结论（三步核查法）：</label>
        <div data-group="verdict">${choices(['✅ 有据可查（保留）', '❌ 事实冲突（须按原文更正）', '❓ 无据幻觉（原文未提，须删改）'])}</div>${notes}`,
        follow: `<h2>第二步：总编辑终审发布 & 签署《AI辅助创作声明》</h2>
        <label for="edit">对照馆藏档案[1]-[3]，把上方草稿中有冲突的数字（五份→3份）和无据幻觉（市级大奖/首次）删改掉，写出真实可信的展签：</label>
        <textarea id="edit" rows="2" maxlength="200">五年级科学社于本周五展出《校园气象站记录仪》，一共展出五份手绘气象图表，该作品曾荣获全市科技创新一等奖。</textarea>
        <button class="run" id="publish">📢 核验并发布正式展签（附AI使用声明）</button>
        <div id="placard" role="status"></div>`,
    },
    44: {
        theme: 'stage',
        caption: '校园AI问答助手 · RAG检索黑箱拆解与2×2四象限评测看板',
        label: '五步教学互动实验 · 初中阶段（8年级第5课）',
        intro: '本课核心任务：① 理解检索增强（RAG）问答系统的证据比对机制；② 用【有据答对、合理拒答、无据幻觉、有据漏答】四象限矩阵评测AI回答；③ 通过移除地点证据的控制变量实验，探究证据链对评测结论的决定作用。',
        scene: '<output id="notice"></output>',
        controls: `<h2>第一步：四道基准测试题逐题评测</h2>
        <p>先看上方【校园知识库】里有什么证据，再评判AI助手的回答属于哪一象限：</p>
        <div class="steps" data-group="case">${choices(['第 1 题（问地点·答礼堂）', '第 2 题（问票价·编10元）', '第 3 题（问票价·答未说明）', '第 4 题（问场馆·答不知道）'])}</div>
        <blockquote id="case"></blockquote>
        <label>选择你的四象限评测结论：</label>
        <div data-group="rating">${choices(['✅ 有据答对', '❌ 无据幻觉或答错', '🛡️ 合理拒答（守边界）', '⚠️ 有据漏答（检索失败）'])}</div>${notes}`,
        follow: `<h2>第二步：🔬 控制变量实验——改变知识库证据，再评一次！</h2>
        <p>保持助手刚才的4句回答一字不改，但从后台知识库里删掉【在大礼堂】这条地点信息。请点击下方按钮切换证据，重新评测第 1 题和第 4 题！</p>
        <button id="toggle" class="run" aria-pressed="false">🔬 控制变量：隐藏通知里的【地点】证据</button>
        <div id="scores" aria-live="polite"></div>`,
    },
};

export function classroomActivity(courseIndex, sampleMeta) {
    const a = activities[courseIndex];
    if (!a) return '';
    const learnItems = (sampleMeta?.whatToLearn || []).map(item => `<li>${item}</li>`).join('');
    const litBadges = (sampleMeta?.literacy || []).map(tag => `<span class="badge lit">${tag}</span>`).join('');
    return `<style>${asset('activity.css')}</style>
        <section class="learn-card" aria-label="本课教学定位与目标">
          <div class="learn-meta">
            <span class="badge mod">${sampleMeta?.module || 'AI通识核心样课'}</span>
            ${litBadges}
          </div>
          <h2>🎯 一分钟看懂：这节课教什么？</h2>
          <ul class="learn-list">${learnItems}</ul>
          <div class="five-steps-bar" aria-label="五步教学法流程">
            <span>① 情境导入</span><span>② 概念理解</span><span>③ 工具体验</span><span>④ 项目实践</span><span>⑤ 伦理反思</span>
          </div>
        </section>
        <section class="activity ${a.theme}" data-theme="${a.theme}" aria-label="${a.label}">
        <div class="intro"><small>${a.label}</small><p>${a.intro}</p></div>
        <div class="workbench"><figure><canvas width="800" height="510" role="img" aria-label="${a.caption}插画"></canvas><figcaption><strong>${a.caption}</strong>${a.scene}</figcaption></figure>
        <div class="console">${a.controls}</div></div><div class="follow">${a.follow}</div></section>
        <script>(()=>{${asset('scene.js')}\n${asset('activity.js')}})();</script>`;
}

export function featuredActivities(catalog, samples = {}) {
    return '<section class="featured-samples"><h2>🌟 三节示范互动样课（对应小低、小高、初中三个学段，打开即可上课）</h2><p>严格对标《中小学人工智能通识教育指南》与“五步教学法（情境导入→概念理解→工具体验→项目实践→伦理反思）”，内置可视化交互实验台、控制变量实验与过程评价量表：</p>' + catalog.filter(x => x.sample).map(x => {
        const s = samples[x.idx] || {};
        return '<article class="sample-card"><div><small>' + x.g + ' 年级 · 第 ' + x.n + ' 课 · ' + (s.module || '核心互动样课') + '</small><h3>' + x.title + '</h3><p class="sample-desc">' + (s.intro || '') + '</p></div><div class="sample-actions"><a class="action" href="' + x.teacher + '">进入教师大屏课 →</a> <a href="' + x.student + '">进入学生上机课 →</a></div></article>';
    }).join('') + '</section>';
}
