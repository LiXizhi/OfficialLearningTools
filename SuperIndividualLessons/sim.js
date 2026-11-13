'use strict';
// 真实 AIChat 演示引擎：把“超级个体怎么工作”做成可步进、可 autoplay 的工作台回放。
// 场景数据复用 roles.js 的 dayRoles，与放映室保持一致；界面复刻 AIChat 浅色工作台。
(function () {
  const mount = document.getElementById('sim');
  if (!mount || typeof dayRoles === 'undefined') return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
  const btn = (text, cls, fn) => { const b = el('button', cls, text); b.type = 'button'; if (fn) b.addEventListener('click', fn); return b; };

  /* ---------- 每个角色的第二大脑图谱与文件 ---------- */
  const brainMap = {
    student: { nodes: ['豆苗实验', '观察记录', '控制条件', '光照假设', '复测卡'], files: [['原始信源', '周一观察本.md'], ['原始信源', '实验照片说明.md'], ['知识地图', '豆苗实验.md'], ['Skills', '证据核验.rule']] },
    teacher: { nodes: ['分数诊断', '离堂题', '整体概念', '推理缺口', '题卡'], files: [['原始信源', '离堂题汇总.md'], ['原始信源', '匿名口述样例.md'], ['知识地图', '分数诊断.md'], ['Skills', '学情核验.rule']] },
    leader: { nodes: ['课后服务', '报名意向', '实际签到', '接送冲突', '决策单'], files: [['原始信源', '报名表.md'], ['原始信源', '现场签到.md'], ['知识地图', '课后服务试点.md'], ['Skills', '校务核验.rule']] },
    founder: { nodes: ['经营简报', '试用', '签约', '回款', '口径'], files: [['原始信源', '业务周报.md'], ['原始信源', '财务对账.md'], ['知识地图', '经营核验.md'], ['Skills', '口径核验.rule']] }
  };

  /* ---------- 把角色案例编成工作台节拍 ---------- */
  function buildScenario(id) {
    const r = dayRoles[id], bm = brainMap[id];
    const beats = [];
    const add = (type, payload, narr, stage) => beats.push(Object.assign({ type, narr, stage }, payload));
    add('greet', { text: '我是你的分身，连着你的第二大脑。把目标告诉我，我带着你的积累去做，做完把经验写回来。' },
      '工作台是起点。分身不是空白的聊天机器人——它一开口就带着你的第二大脑。', '阶段 1 · 口喷委托');
    add('user', { text: r.vague }, '先随口说一句。这是大多数人的起点：一个模糊的目标。', '阶段 1 · 口喷委托');
    add('ai', { text: '交给谁用？怎样算完成？给我使用者、目标和可检查的成果，我才能做对。' },
      '分身不急着动手，先问清验收标准。模糊委托 → 清晰委托，是超级个体的第一课。', '阶段 1 · 口喷委托');
    add('user', { text: r.brief }, '把委托补完整：给谁用、要什么、怎样算完成。', '阶段 1 · 口喷委托');
    add('brain-read', { nodes: [0, 1, 2], files: [0, 1, 2], tool: '读取第二大脑', detail: '检索 <code>' + bm.files[2][1] + '</code> 与 2 份原始信源，沿来源取背景。' },
      '分身先读第二大脑：知识地图给概念关系，原始信源给依据。这一步让它“懂你的上下文”。', '阶段 3 · 调用经验');
    add('agents', { agents: r.agents, pair: r.pair },
      '一个目标拆给两个分身并行：一个整理事实，一个独立核验。注意力从“执行”转向“判断”。', '阶段 2 · 并行调度');
    add('choice', { options: r.options, correct: r.correct, why: r.why },
      '两份材料出现分歧，停下来由你判断。这是超级个体最关键的动作：人做最终裁决。', '阶段 2 · 判断力');
    add('brain-write', { node: 4, file: 3, rule: r.rule, tool: '写回第二大脑 · RSI', detail: '把这次容易犯的错写成一条可执行规则 <code>' + bm.files[3][1] + '</code>。' },
      '判断完不是结束：把经验写回大脑（RSI 递归自我改进）。下次任何分身都不会再犯同样的错。', '阶段 3 · 经验回流');
    add('rerun', { before: r.before, after: r.after, source: r.sources[2].split('｜')[0] },
      '开一个全新对话复跑。同样的问题，分身带着新规则给出修订版，并标注来源。', '阶段 3 · 越用越厚');
    add('handoff', { text: r.handoff, value: r.value },
      '成果交给圈子里的下一位（真人或分身）。经验留在你的大脑，能力进入协作网络。', '阶段 4 · 交付协作');
    return { id, role: r, bm, beats };
  }

  /* ---------- 静态外壳 ---------- */
  const device = el('div', 'sim-device');
  const titlebar = el('div', 'sim-titlebar');
  const dots = el('div', 'sim-dots'); dots.append(el('i'), el('i'), el('i'));
  titlebar.append(dots, el('strong', '', 'KeepWork 第二大脑 · 工作台'), el('span', 'sim-url', 'aichat.keepwork.com'));
  const shell = el('div', 'sim-shell');
  // 图标栏
  const rail = el('div', 'sim-rail');
  [['💬', true], ['🗂', false], ['🖼', false], ['▶', false], ['🧠', false], ['🎓', false], ['🛠', false]].forEach(([ico, active]) => {
    const b = btn(ico, active ? 'active' : ''); b.setAttribute('aria-label', '导航'); b.tabIndex = -1; rail.append(b);
  });
  rail.append(el('div', 'sim-rail-spacer'));
  const railAvatar = el('img', 'sim-rail-avatar'); railAvatar.src = 'assets/student-scene.webp'; railAvatar.alt = ''; rail.append(railAvatar);
  // 会话侧栏
  const side = el('div', 'sim-side');
  const sideHead = el('div', 'sim-side-head');
  const shImg = el('img'); shImg.src = 'assets/student-scene.webp'; shImg.alt = '';
  const shTxt = el('div'); shTxt.append(el('strong', '', '我的分身'), el('small', '', '第二大脑 · LiXizhiDocs'));
  sideHead.append(shImg, shTxt);
  const newChat = el('div', 'sim-newchat', '＋ 新对话');
  const sessions = el('div', 'sim-sessions');
  const sideFoot = el('div', 'sim-side-foot', '☁ 云端会话 · 已同步');
  side.append(sideHead, newChat, sessions, sideFoot);
  // 主区
  const main = el('div', 'sim-main');
  const topbar = el('div', 'sim-topbar');
  const tbImg = el('img'); tbImg.src = 'assets/student-scene.webp'; tbImg.alt = '';
  const persona = el('div', 'sim-persona');
  const pName = el('strong', '', '我的分身');
  const pSub = el('small'); pSub.append(el('span', 'sim-brain-chip', '🧠 第二大脑'), document.createTextNode(' LiXizhiDocs'));
  persona.append(pName, pSub);
  const topActions = el('div', 'sim-top-actions'); topActions.append(el('span', '', '钉钉'), el('span', '', '飞书'));
  topbar.append(tbImg, persona, topActions);
  const chat = el('div', 'sim-chat'); chat.id = 'sim-chat';
  const composer = el('div', 'sim-composer');
  const composerBox = el('div', 'sim-composer-box');
  const composerInput = el('div', 'sim-composer-input placeholder', '输入消息…');
  const composerBar = el('div', 'sim-composer-bar');
  const model = el('span', 'sim-model', 'gpt-6-astra');
  const sendBtn = btn('➤', 'sim-send'); sendBtn.disabled = true; sendBtn.setAttribute('aria-label', '发送');
  composerBar.append(model, sendBtn);
  composerBox.append(composerInput, composerBar);
  composer.append(composerBox);
  main.append(topbar, chat, composer);
  // 第二大脑面板
  const brain = el('div', 'sim-brain');
  const brainHead = el('div', 'sim-brain-head'); brainHead.append(el('strong', '', '🧠 第二大脑'), el('span', 'sim-brain-tag', 'LiXizhiDocs'));
  const brainClose = btn('✕', 'sim-brain-close'); brainClose.setAttribute('aria-label', '关闭大脑面板');
  brainClose.addEventListener('click', () => { shell.classList.remove('sim-brain-open'); brainToggle.setAttribute('aria-pressed', 'false'); });
  brainHead.append(brainClose);
  const brainGraph = el('div', 'sim-brain-graph');
  const brainFiles = el('div', 'sim-brain-files');
  brain.append(brainHead, brainGraph, brainFiles);
  shell.append(rail, side, main, brain);
  // 讲解条
  const narration = el('div', 'sim-narration');
  const narrNum = el('div', 'sim-narr-num', '1');
  const narrTxt = el('div'); const narrTitle = el('strong'); const narrBody = el('p');
  narrTxt.append(narrTitle, narrBody);
  narration.append(narrNum, narrTxt);
  device.append(titlebar, shell, narration);

  /* ---------- 控制区 ---------- */
  const controls = el('div', 'sim-controls');
  const scenarios = el('div', 'sim-scenarios');
  const transport = el('div', 'sim-transport');
  const playBtn = btn('▶ 播放', 'sim-play');
  const prevBtn = btn('‹ 上一步'); prevBtn.setAttribute('aria-label', '上一步');
  const nextBtn = btn('下一步 ›'); nextBtn.setAttribute('aria-label', '下一步');
  const restartBtn = btn('↺ 重播'); restartBtn.setAttribute('aria-label', '重播');
  const speedSel = el('select'); speedSel.setAttribute('aria-label', '播放速度');
  [['慢', 2600], ['正常', 1700], ['快', 950]].forEach(([t, v], i) => { const o = new Option(t, v); if (i === 1) o.selected = true; speedSel.add(o); });
  const narrToggle = btn('讲解 开', ''); narrToggle.setAttribute('aria-pressed', 'true');
  const brainToggle = btn('大脑面板', ''); brainToggle.setAttribute('aria-pressed', 'true');
  transport.append(playBtn, prevBtn, nextBtn, restartBtn, speedSel, narrToggle, brainToggle);
  const progress = el('div', 'sim-progress');
  controls.append(scenarios, transport, progress);

  const head = el('div', 'sim-head');
  const headTxt = el('div');
  const headH2 = el('h2');
  headH2.innerHTML = '在真实 AIChat 里，<em>跑一遍</em>';
  headTxt.append(headH2, el('p', '', '这不是视频，是可以步进的工作台回放。选一个身份，看分身如何读你的第二大脑、并行做事、由你判断、再把经验写回。'));
  head.append(headTxt);
  mount.append(head, controls, device);

  /* ---------- 状态 ---------- */
  let scenario = buildScenario('student');
  let cursor = -1, playing = false, timer = 0, runToken = 0, choiceDone = false;
  let speed = 1700, narrOn = true;

  function scenarioButtons() {
    scenarios.replaceChildren();
    Object.entries(dayRoles).forEach(([id, r]) => {
      const b = btn('', 'sim-scenario');
      const img = el('img'); img.src = 'assets/' + id + '-scene.webp'; img.alt = '';
      b.append(img, document.createTextNode(r.label));
      b.dataset.scenario = id;
      b.setAttribute('aria-pressed', String(id === scenario.id));
      b.addEventListener('click', () => selectScenario(id));
      scenarios.append(b);
    });
  }
  function progressButtons() {
    progress.replaceChildren();
    scenario.beats.forEach((b, i) => {
      const p = btn('', '');
      p.setAttribute('aria-label', '第 ' + (i + 1) + ' 步');
      const label = el('span', '', (i + 1) + ' ' + shortName(b.type));
      p.append(label);
      p.addEventListener('click', () => { stop(); jumpTo(i); });
      progress.append(p);
    });
  }
  function shortName(t) {
    return { greet: '开场', user: '委托', ai: '追问', 'brain-read': '读脑', agents: '分身', choice: '判断', 'brain-write': '写回', rerun: '复跑', handoff: '交接' }[t] || t;
  }
  function syncProgress() {
    [...progress.children].forEach((p, i) => {
      p.classList.toggle('done', i < cursor);
      p.classList.toggle('current', i === cursor);
    });
  }

  /* ---------- 第二大脑渲染 ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  function renderBrain(litNodes, litFiles, newFile, newNode) {
    const bm = scenario.bm;
    brainGraph.replaceChildren();
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 230 150');
    svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', '第二大脑知识图谱');
    const cx = 115, cy = 75;
    const positions = [[cx, cy], [45, 35], [185, 35], [40, 115], [190, 115], [115, 18]];
    // edges
    for (let i = 1; i <= bm.nodes.length; i++) {
      const [x, y] = positions[i] || [cx, cy];
      const line = document.createElementNS(NS, 'line');
      line.setAttribute('x1', cx); line.setAttribute('y1', cy); line.setAttribute('x2', x); line.setAttribute('y2', y);
      line.setAttribute('stroke', '#dde0ea'); line.setAttribute('stroke-width', '1.5');
      svg.append(line);
    }
    const allNodes = ['个人超脑'].concat(bm.nodes);
    allNodes.forEach((name, i) => {
      const [x, y] = i === 0 ? [cx, cy] : (positions[i] || [cx, cy]);
      const g = document.createElementNS(NS, 'g');
      const isCenter = i === 0;
      const lit = isCenter || litNodes.includes(i - 1) || (newNode === i - 1);
      g.setAttribute('class', 'sim-bg-node' + (lit ? ' lit' : ''));
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', isCenter ? 20 : 15);
      c.setAttribute('fill', lit ? '#6366f1' : '#eef0f6');
      c.setAttribute('stroke', newNode === i - 1 ? '#2f9e57' : '#c3c8d8');
      c.setAttribute('stroke-width', newNode === i - 1 ? '2.5' : '1.5');
      g.append(c);
      const t = document.createElementNS(NS, 'text');
      t.setAttribute('x', x); t.setAttribute('y', y + (isCenter ? 3 : 26)); t.setAttribute('text-anchor', 'middle');
      if (isCenter) { t.setAttribute('fill', '#fff'); t.setAttribute('font-size', '8'); }
      else { t.setAttribute('fill', lit ? '#4f46e5' : '#6a7280'); t.setAttribute('font-weight', lit ? '700' : '600'); }
      t.textContent = name;
      g.append(t);
      svg.append(g);
    });
    brainGraph.append(svg);
    brainFiles.replaceChildren();
    bm.files.forEach(([layer, name], i) => {
      const f = el('div', 'sim-brain-file');
      if (litFiles.includes(i)) f.classList.add('lit');
      if (newFile === i) f.classList.add('new');
      const s = el('strong'); s.append(document.createTextNode((newFile === i ? '✚ ' : '▤ ') + name));
      f.append(s, el('small', '', layer + (newFile === i ? ' · 本次新写入' : '')));
      brainFiles.append(f);
    });
  }

  /* ---------- 聊天渲染 ---------- */
  function aiAvatar() { const a = el('div', 'sim-avatar ai', '◈'); return a; }
  function userAvatar() { const a = el('img', 'sim-avatar'); a.src = 'assets/' + scenario.id + '-scene.webp'; a.alt = ''; return a; }
  function msgShell(who) {
    const m = el('div', 'sim-msg ' + who);
    m.append(who === 'user' ? userAvatar() : aiAvatar());
    const b = el('div', 'sim-bubble');
    m.append(b);
    return { m, b };
  }
  function toolCard(name, detail, running) {
    const t = el('div', 'sim-tool');
    const h = el('div', 'sim-tool-head');
    h.append(el('span', 'sim-tool-ico', '🧠'), el('strong', '', name));
    const st = el('span', 'sim-tool-status' + (running ? ' running' : ''));
    if (running) { st.append(el('span', 'sim-spinner'), document.createTextNode(' 调用中')); }
    else st.textContent = '✓ 完成';
    h.append(st);
    const body = el('div', 'sim-tool-body'); body.innerHTML = detail;
    t.append(h, body);
    return t;
  }
  function renderBeat(b, animate) {
    if (b.type === 'greet' || b.type === 'ai') {
      const { m, b: bub } = msgShell('ai');
      bub.textContent = b.text;
      chat.append(m);
    } else if (b.type === 'user') {
      const { m, b: bub } = msgShell('user');
      chat.append(m);
      if (animate && !reduce.matches) {
        composerInput.textContent = b.text; composerInput.classList.remove('placeholder');
        typeInto(bub, b.text);
      } else bub.textContent = b.text;
    } else if (b.type === 'brain-read') {
      const { m, b: bub } = msgShell('ai');
      bub.append(toolCard(b.tool, b.detail, false));
      const note = el('div'); note.innerHTML = '已取到背景与依据，开始做事。';
      bub.append(note);
      chat.append(m);
    } else if (b.type === 'agents') {
      const { m, b: bub } = msgShell('ai');
      bub.append(el('div', '', '我把任务拆给两个分身并行：'));
      const grid = el('div', 'sim-agents');
      b.agents.forEach((name, i) => {
        const card = el('div', 'sim-agent-card');
        const s = el('strong'); s.append(document.createTextNode('🤖 ' + name));
        card.append(s, el('p', '', b.pair[i]));
        grid.append(card);
      });
      bub.append(grid);
      chat.append(m);
    } else if (b.type === 'choice') {
      const wrap = el('div', 'sim-choice');
      wrap.append(el('h4', '', '⚖ 轮到你判断'));
      const fb = el('p', 'sim-choice-fb');
      b.options.forEach((opt, i) => {
        const ob = btn(opt, '');
        ob.addEventListener('click', () => {
          [...wrap.querySelectorAll('button')].forEach(x => x.classList.remove('correct', 'wrong'));
          if (i === b.correct) {
            ob.classList.add('correct');
            fb.className = 'sim-choice-fb ok';
            fb.textContent = '✓ 判断有据。' + b.why;
            choiceDone = true;
            if (playing) scheduleNext();
          } else {
            ob.classList.add('wrong');
            fb.className = 'sim-choice-fb no';
            fb.textContent = '✗ 再核对一下两份材料。' + b.why;
            choiceDone = false;
          }
        });
        wrap.append(ob);
      });
      wrap.append(fb);
      chat.append(wrap);
    } else if (b.type === 'brain-write') {
      const { m, b: bub } = msgShell('ai');
      bub.append(toolCard(b.tool, b.detail, false));
      const rule = el('div'); rule.innerHTML = '<strong>新规则：</strong>' + b.rule;
      bub.append(rule);
      chat.append(m);
    } else if (b.type === 'rerun') {
      const { m, b: bub } = msgShell('ai');
      bub.append(el('div', '', '全新对话复跑 · 版本比较'));
      const old = el('div', 'sim-tool'); const oh = el('div', 'sim-tool-head');
      oh.append(el('span', 'sim-tool-ico', '🕘'), el('strong', '', '第一版'));
      const ob = el('div', 'sim-tool-body'); ob.textContent = b.before; ob.style.textDecoration = 'line-through'; ob.style.color = '#b0433f';
      old.append(oh, ob);
      const neu = el('div', 'sim-tool'); const nh = el('div', 'sim-tool-head');
      nh.append(el('span', 'sim-tool-ico', '✨'), el('strong', '', '修订版'));
      const nb = el('div', 'sim-tool-body'); nb.textContent = b.after; nb.style.color = '#2f7a45';
      neu.append(nh, nb);
      bub.append(old, neu);
      const src = el('span', 'sim-src', '🔗 引用 ' + b.source);
      bub.append(src);
      chat.append(m);
    } else if (b.type === 'handoff') {
      const { m, b: bub } = msgShell('ai');
      bub.append(el('div', '', '👥 交给圈子：' + b.text));
      const v = el('div'); v.innerHTML = '<strong>下一步：</strong>' + b.value;
      bub.append(v);
      chat.append(m);
    }
    chat.scrollTop = chat.scrollHeight;
  }
  function typeInto(bub, text) {
    const token = runToken;
    bub.textContent = '';
    const cursorEl = el('span', 'sim-cursor');
    bub.append(cursorEl);
    let i = 0;
    const step = () => {
      if (token !== runToken) return;
      i = Math.min(text.length, i + 2);
      bub.textContent = text.slice(0, i);
      if (i < text.length) { bub.append(cursorEl); setTimeout(step, 24); }
      else {
        cursorEl.remove();
        composerInput.textContent = '输入消息…'; composerInput.classList.add('placeholder');
        if (playing) scheduleNext();
      }
    };
    step();
  }

  /* ---------- 累计大脑状态 ---------- */
  function brainStateUpTo(index) {
    const litNodes = [], litFiles = [];
    let newFile = -1, newNode = -1;
    for (let i = 0; i <= index; i++) {
      const b = scenario.beats[i];
      if (b.type === 'brain-read') { litNodes.push(...b.nodes); litFiles.push(...b.files); }
      if (b.type === 'brain-write') { newFile = b.file; newNode = b.node; litFiles.push(b.file); litNodes.push(b.node); }
    }
    return { litNodes, litFiles, newFile, newNode };
  }
  function renderUpTo(index, animateLast) {
    chat.replaceChildren();
    composerInput.textContent = '输入消息…'; composerInput.classList.add('placeholder');
    for (let i = 0; i <= index; i++) renderBeat(scenario.beats[i], animateLast && i === index);
    const bs = brainStateUpTo(index);
    renderBrain(bs.litNodes, bs.litFiles, bs.newFile, bs.newNode);
    const b = scenario.beats[index];
    if (b) {
      narrNum.textContent = index + 1;
      narrTitle.textContent = shortName(b.type);
      const tag = el('span', 'sim-stage-tag', b.stage);
      narrTitle.append(tag);
      narrBody.textContent = b.narr;
    }
    syncProgress();
    prevBtn.disabled = index <= 0;
    nextBtn.disabled = index >= scenario.beats.length - 1;
  }

  /* ---------- 播放控制 ---------- */
  function scheduleNext() {
    clearTimeout(timer);
    const b = scenario.beats[cursor];
    if (b && b.type === 'choice' && !choiceDone) return; // 等待判断
    timer = setTimeout(() => { if (playing) advance(); }, speed);
  }
  function advance() {
    if (cursor >= scenario.beats.length - 1) { stop(); return; }
    const next = cursor + 1;
    const nb = scenario.beats[next];
    if (nb.type === 'choice') choiceDone = false;
    cursor = next;
    renderUpTo(cursor, true);
    if (nb.type === 'choice') { playing = true; playBtn.textContent = 'Ⅱ 暂停'; return; } // 暂停等判断
    if (nb.type === 'user' && !reduce.matches) return; // 打字结束后由 typeInto 推进
    scheduleNext();
  }
  function play() {
    if (cursor >= scenario.beats.length - 1) { jumpTo(0); }
    playing = true; playBtn.textContent = 'Ⅱ 暂停';
    if (cursor < 0) { cursor = 0; renderUpTo(0, true); }
    scheduleNext();
  }
  function stop() {
    playing = false; clearTimeout(timer); runToken++; playBtn.textContent = '▶ 播放';
  }
  function jumpTo(i) {
    runToken++; clearTimeout(timer);
    cursor = Math.max(0, Math.min(scenario.beats.length - 1, i));
    choiceDone = scenario.beats[cursor].type !== 'choice';
    renderUpTo(cursor, false);
  }
  function selectScenario(id) {
    stop();
    scenario = buildScenario(id);
    cursor = -1; choiceDone = false;
    scenarioButtons(); progressButtons();
    // 更新头像与侧栏会话
    railAvatar.src = shImg.src = tbImg.src = 'assets/' + id + '-scene.webp';
    pName.textContent = dayRoles[id].label + '的分身';
    sessions.replaceChildren();
    const active = el('div', 'sim-session active');
    active.append(el('span', 'ss-ico', '💬'));
    const at = el('div'); at.append(el('strong', '', dayRoles[id].task), el('small', '', '进行中 · 第二大脑已连接'));
    active.append(at);
    sessions.append(active);
    [['🗂', '豆苗实验 · 知识地图', '昨天'], ['🧠', 'RSI 规则整理', '周二'], ['👥', '圈子交接记录', '周一']].forEach(([ico, t, d]) => {
      const s = el('div', 'sim-session'); s.append(el('span', 'ss-ico', ico));
      const st = el('div'); st.append(el('strong', '', t), el('small', '', d)); s.append(st); sessions.append(s);
    });
    const brainOpen = window.innerWidth > 900;
    shell.classList.toggle('sim-brain-open', brainOpen);
    brainToggle.setAttribute('aria-pressed', String(brainOpen));
    jumpTo(0);
  }

  playBtn.addEventListener('click', () => playing ? stop() : play());
  prevBtn.addEventListener('click', () => { stop(); jumpTo(cursor - 1); });
  nextBtn.addEventListener('click', () => { stop(); jumpTo(cursor + 1); });
  restartBtn.addEventListener('click', () => { stop(); jumpTo(0); });
  speedSel.addEventListener('change', () => { speed = Number(speedSel.value); });
  narrToggle.addEventListener('click', () => {
    narrOn = !narrOn;
    narrToggle.setAttribute('aria-pressed', String(narrOn));
    narrToggle.textContent = narrOn ? '讲解 开' : '讲解 关';
    narration.classList.toggle('hidden', !narrOn);
  });
  brainToggle.addEventListener('click', () => {
    const open = shell.classList.toggle('sim-brain-open');
    brainToggle.setAttribute('aria-pressed', String(open));
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });

  scenarioButtons();
  selectScenario('student');
})();