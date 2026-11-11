import { readFileSync } from 'node:fs';

const asset = name => readFileSync(new URL(name, import.meta.url));

// Inline the illustration and runtime so the packaged classroom entry and a downloaded page work alike.
export function weatherPage(teacher, archive) {
    const role = teacher ? '教师大屏' : '学生动手';
    const title = teacher ? '从零做气象挑战' : '做我的气象挑战卡';
    const image = 'data:image/webp;base64,' + asset(teacher ? 'station.webp' : 'notebook.webp').toString('base64');
    const caption = teacher ? '校园气象站' : '我的观测手账';
    const body = `<div class="fieldbook" data-role="${teacher ? 'teacher' : 'student'}">
      <div class="mast"><a href="../index.html#g5">← 课程目录</a><b><i aria-hidden="true">☀</i> 校园气象站</b><span>五年级 · ${role}</span></div>
      <div class="hero"><div class="hero-copy"><small>科学社开放日　/　${role}</small><h1>${title}</h1>
      <p>${teacher ? '打开一个空工作区。今天，请全班看你怎样把一个问题做成能玩的网页，再请一位同学来试。' : '展台前来了一位小观众。你想让他读懂温度计，还是发现天气的变化？和 AI 一起做张能玩的卡片给他。'}</p>
      <button class="primary" id="start"></button></div><figure><img id="station" src="${image}" alt="${teacher ? '木栏上挂着观测图，百叶箱旁有风杯和温度计' : '摊开的科学手账，上面有温度计、折线图和待制作的空白挑战卡'}"><figcaption>${caption} · AI 场景插画</figcaption></figure></div>
      <nav class="strip" aria-label="制作步骤"></nav>
      <div id="desk" tabindex="-1">
      <div class="workhead"><div><small id="phase"></small><h2 id="heading"></h2></div><button id="speak">朗读引导</button></div>
      <p id="lead"></p>
      <div class="panels"><div class="sheet"><h3 id="brief-title"></h3><p id="guide"></p>
      <div id="tools"></div>
      <label id="note-label" for="note"></label><textarea id="note" rows="2" maxlength="1200"></textarea>
      </div><div class="sheet prompt"><h3>${teacher ? '这一步，我这样和 AI 说' : '我给 AI 的委托'}</h3>
      <p id="mode-guide"></p><details class="mode-photo"><summary>看图找到 Ask / Plan / Craft</summary><img src="data:image/png;base64,${asset('modes.png').toString('base64')}" alt="AIChat 输入框旁的模式菜单，依次有 Craft、Plan、Goal、Ask"><p>点输入框旁当前的模式名，再选对应的一行。</p></details>
      <label class="sr" for="request">可编辑的 AI 委托</label><textarea id="request" rows="5" maxlength="8000"></textarea><button id="rebuild" class="quiet" hidden>按当前选项重新组合委托</button>
      <div class="actions"><button id="copy">复制这段文字</button></div>
      <details id="follow-card"><summary>收到回复后，继续这一轮</summary><label for="follow-text">我的追问或决定</label><textarea id="follow-text" rows="3"></textarea><div class="actions"><button id="follow-copy">复制这句</button></div></details>
      <button class="quiet" id="example">在本页用示例练习</button><div id="sample-output" hidden></div>
      </div></div>
      <div id="status" role="status" aria-live="polite"></div>
      <div class="stepfoot"><span id="progress"></span><button id="next" class="primary"></button></div></div>
      <section id="receipt" hidden><h2>我的制作记录</h2><pre id="record"></pre><button id="download">保存制作记录</button> <button id="record-copy">复制记录</button></section>
      <details class="extra"><summary>材料袋 · 展台档案与事实核查练习</summary><p>五年级科学社本周五展出《校园气象站记录仪》，展出 3 份手绘气温图表，参观者可以体验读数。档案没有记载获奖情况。课内练习数据与实测数据分开标注。</p>${archive}</details>
      <details class="extra"><summary>第一次打开 AIChat？看操作路线</summary><ol><li>在 AIChat 底部主对话输入框直接提问。想使用课上的委托时，点“复制这段文字”，粘贴并确认后发送。独立打开课件时，可在自己的 AIChat 对话中粘贴。</li><li>在输入框旁选择 Plan 来做计划。需要生成图片或制作文件时切换到 Craft。请确认顶部的工作空间是本次气象挑战的专用空间。</li><li>作品做完后，在文件面板点 index.html 预览。切回课件写下观察，再回同一个会话继续修改。只填写练习数据。</li></ol></details>
      <div class="endlinks"><a href="../g5-04-${teacher ? 'student' : 'teacher'}/index.html">${teacher ? '打开学生动手页' : '打开教师大屏页'} →</a><a id="standalone" target="_blank" rel="noopener">独立窗口打开课件 ↗</a></div>
      </div><style>${asset('weather.css')}</style>`;
    return { body, script: asset('workshop.js').toString() };
}
