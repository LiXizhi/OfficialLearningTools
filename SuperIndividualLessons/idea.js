'use strict';
// 理念图解：第 1 课（超级个体 + 成长四阶段）与第 2 课（第二大脑 + 四模块循环）。
// 来源：_wiki/concepts/second-brain.md、ai-native-company.md、
//       notes/Xizhi's Diary/2026.10.28 碳基与硅基的融合、docs/2026/super-individual-stages.md。
(function () {
  const rootIndividual = document.getElementById('idea-individual');
  const rootBrain = document.getElementById('idea-brain');
  if (!rootIndividual && !rootBrain) return;
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  };
  const btn = (text, cls, fn) => {
    const b = el('button', cls, text);
    b.type = 'button';
    if (fn) b.addEventListener('click', fn);
    return b;
  };
  function block(kickerNum, kickerText, title, sub, content) {
    const sec = el('div', 'idea-block');
    const k = el('p', 'idea-kicker');
    k.append(el('b', '', kickerNum), document.createTextNode(kickerText));
    const h = el('h2');
    h.innerHTML = title;
    sec.append(k, h);
    if (sub) sec.append(el('p', 'idea-sub', sub));
    sec.append(content);
    return sec;
  }

  /* ---------- 1. 碳基 + 硅基 = 超级个体 ---------- */
  const fusion = el('div', 'idea-card');
  const fusionGrid = el('div', 'fusion');
  fusionGrid.id = 'fusion';
  const carbon = el('div', 'fusion-side fusion-carbon');
  carbon.append(el('p', 'fusion-tag', '碳基 · 本人'), el('h3', '', '一个真实的你'));
  const carbonList = el('ul');
  ['提出目标与价值判断', '在不同圈子里承担角色', '核验结果、做最终决定', '情感、审美与育人责任'].forEach(t => carbonList.append(el('li', '', t)));
  carbon.append(carbonList);
  const plus = el('div', 'fusion-plus', '+');
  plus.setAttribute('aria-hidden', 'true');
  const silicon = el('div', 'fusion-side fusion-silicon');
  silicon.append(el('p', 'fusion-tag', '硅基 · 第二大脑 + 分身'), el('h3', '', '数字化的你'));
  const siliconList = el('ul');
  ['持续积累的知识与记忆', '能调用记忆替你行动的分身', '一个分身可承担多个角色', '经历经核验后回流大脑'].forEach(t => siliconList.append(el('li', '', t)));
  silicon.append(siliconList);
  fusionGrid.append(carbon, plus, silicon);
  const result = el('div', 'fusion-result');
  result.append(el('strong', '', '= 超级个体'), el('span', '', '碳基的我与硅基的我共同构成一个超级个体。分身越多、积累越厚，一个人的能力边界越大。'));
  const avatars = el('div', 'fusion-avatars');
  [['工作', '项目分身'], ['家庭', '家庭分身'], ['学校', '助教分身'], ['圈子', '协作分身']].forEach(([role, name]) => {
    const a = el('span', 'fusion-avatar');
    a.append(el('i', '', 'AI'), el('span', '', role + ' · ' + name));
    avatars.append(a);
  });
  result.append(avatars);
  const fusionToggle = btn('看看我的分身们 →', 'primary idea-toggle', () => {
    const open = fusionGrid.classList.toggle('open');
    fusionToggle.textContent = open ? '收起分身 ←' : '看看我的分身们 →';
    fusionToggle.setAttribute('aria-expanded', String(open));
  });
  fusionToggle.setAttribute('aria-expanded', 'false');
  fusion.append(fusionGrid, result, fusionToggle,
    el('p', 'idea-note', '这些分身共享同一个个人超脑，带着共同记忆进入不同圈层；行动所得的经验经核验、整理后回流，供其他分身继续使用。这就是“对自己透明”。'));

  /* ---------- 2. 成长四阶段（配 AI 生成插图） ---------- */
  const stageCard = el('div', 'idea-card');
  const stages = el('div', 'stages');
  const stageData = [
    { num: '1', title: '从打字到口喷', pain: '还在亲手敲每个字', gain: '用嘴委托，AI 动手', img: 'stage-1-voice', caption: '你坐在椅子上说话，分身在打字、整理文档、画图表。', detail: '第一步是把“自己打字”变成“只会口喷”。你不再亲手操作软件，而是用自然语言提出目标，让分身去执行。软件退到调用层，人提出目标，Agent 调用工具。' },
    { num: '2', title: '燃烧 Token', pain: '注意力和判断力不够用', gain: '并行调度多个分身', img: 'stage-2-tokens', caption: '你像指挥家一样调度多个分身并行燃烧 Token。', detail: '从等待一个结果，到同时燃烧大量 Token、调度多个分身。这时你会感觉自己的注意力和判断力不够用——瓶颈从“执行”转移到“判断”。' },
    { num: '3', title: '建立第二大脑', pain: '经验留不住、反复交代', gain: 'RSI 解放注意力', img: 'stage-3-brain', caption: '知识节点连成大脑，分身把经验卡带回来，你只轻松审核。', detail: '开始建立第二大脑，通过 RSI（递归自我改进）解放自己的注意力，拥有很多分身。每次行动的经验回流，分身越用越懂你。' },
    { num: '4', title: 'AI 原生产品', pain: '能力停在个人层面', gain: '做出产品并盈利', img: 'stage-4-product', caption: '产品从应用窗口起飞，分身交付成果，客户付费。', detail: '做出 AI Native 的产品并盈利。超级个体形成能力，超级团队共同交付，超级公司连接团队、复用共同知识与经营资源——这正是第 4 课的主题。' }
  ];
  const stageDetail = el('div', 'stage-detail');
  const stageFigure = el('figure', 'stage-figure');
  const stageImg = el('img');
  stageImg.src = 'assets/' + stageData[0].img + '.webp';
  stageImg.alt = '阶段 1 配图：' + stageData[0].caption;
  const stageCap = el('figcaption');
  const stageCapTitle = el('strong', '', '阶段 1 · ' + stageData[0].title);
  const stageCapBody = el('span', '', stageData[0].caption);
  const stageCapNote = el('small', '', 'AI 生成教学插图 · 非产品截图');
  stageCap.append(stageCapTitle, stageCapBody, stageCapNote);
  stageFigure.append(stageImg, stageCap);
  const stageBtns = [];
  function selectStage(i) {
    const d = stageData[i];
    stageBtns.forEach((x, j) => x.setAttribute('aria-pressed', String(j === i)));
    stageDetail.replaceChildren();
    stageDetail.append(el('b', '', '阶段 ' + d.num + ' · ' + d.title + ' '), document.createTextNode(d.detail));
    stageImg.src = 'assets/' + d.img + '.webp';
    stageImg.alt = '阶段 ' + d.num + ' 配图：' + d.caption;
    stageCapTitle.textContent = '阶段 ' + d.num + ' · ' + d.title;
    stageCapBody.textContent = d.caption;
    stageFigure.classList.remove('swap');
    void stageFigure.offsetWidth;
    stageFigure.classList.add('swap');
  }
  stageData.forEach((d, i) => {
    const b = el('button', 'stage-card');
    b.type = 'button';
    b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
    b.append(el('span', 'stage-num', d.num), el('h3', '', d.title), el('span', 'stage-pain', '痛点 · ' + d.pain), el('span', 'stage-gain', '跃迁 · ' + d.gain));
    b.addEventListener('click', () => selectStage(i));
    stages.append(b);
    stageBtns.push(b);
  });
  stageDetail.append(el('b', '', '阶段 1 · 从打字到口喷 '), document.createTextNode(stageData[0].detail));
  stageCard.append(stages, stageFigure, stageDetail,
    el('p', 'idea-note', '来源：李西峙《成为超级个体》成长笔记（2026-11-09）。这是一条可以照着走的成长路径，第 3 课的演示与放映室就沿着它展开。'));

  /* ---------- 3. 第二大脑三层 ---------- */
  const brainCard = el('div', 'idea-card');
  const layers = el('div', 'brain-layers');
  const layerData = [
    {
      ico: '🗂', title: '原始信源', desc: '文档、代码、会议、业务系统——保留权威来源与访问方式。',
      detail: '第二大脑不复制每份文件，而是记住“去哪里找正在运行的真相”。企业文档常过期，要追溯当前生效的代码与资料。',
      chips: [['钉钉 / 飞书', '会议与消息'], ['Git 仓库', '正在运行的代码'], ['云盘 / 笔记', '原始材料']]
    },
    {
      ico: '🕸', title: '知识地图', desc: '按概念、实体、项目组织词条，交叉引用并指回来源。',
      detail: '核心知识地图控制在约 200 个以内的 Wiki 节点，便于高效导航。每条词条指向对应代码目录，而不是把文档抄一遍。这比纯向量 RAG 更便于维护、结构调整与持续修正。',
      chips: [['概念', '第二大脑 / RSI'], ['实体', '公司 / 项目'], ['项目', '指向代码仓']]
    },
    {
      ico: '🛠', title: '维护规则与 Skills', desc: '规定如何读、整理、核验、更新知识，以及如何调用工具做事。',
      detail: 'Skills 用 Markdown + 脚本保存“怎么做”。人提供来源和判断，AI 做阅读、提炼、交叉引用与记账；新事实折入已有主题，冲突并列标记。每次解决问题后写回经验，就是 RSI。',
      chips: [['AGENTS.md', '工作起点'], ['skills/', '做事的方法'], ['RSI', '递归自我改进']]
    }
  ];
  layerData.forEach((d, i) => {
    const b = el('button', 'brain-layer');
    b.type = 'button';
    b.setAttribute('aria-expanded', i === 1 ? 'true' : 'false');
    b.append(el('span', 'bl-ico', d.ico));
    const mid = el('div');
    mid.append(el('h3', '', d.title), el('p', '', d.desc));
    b.append(mid, el('span', 'bl-caret', '›'));
    const detail = el('div', 'brain-detail');
    const inner = el('div', 'brain-detail-inner');
    inner.append(el('p', '', d.detail));
    const chipRow = el('div');
    chipRow.style.display = 'flex';
    chipRow.style.flexWrap = 'wrap';
    chipRow.style.gap = '8px';
    d.chips.forEach(([k, v]) => {
      const c = el('span', 'brain-chip');
      c.append(el('b', '', k), document.createTextNode(' ' + v));
      chipRow.append(c);
    });
    inner.append(chipRow);
    detail.append(inner);
    b.append(detail);
    b.addEventListener('click', () => {
      const open = b.getAttribute('aria-expanded') === 'true';
      b.setAttribute('aria-expanded', String(!open));
    });
    layers.append(b);
  });
  const vs = el('div', 'brain-vs');
  const old = el('div', 'vs-old');
  old.append(el('h4', '', '没有第二大脑的 AI'));
  const oldList = el('ul');
  ['每次都要重新交代背景', '回答凭空、难以追溯', '经验留不下来，下次从零开始'].forEach(t => oldList.append(el('li', '', t)));
  old.append(oldList);
  const neu = el('div', 'vs-new');
  neu.append(el('h4', '', '连着第二大脑的 AI'));
  const neuList = el('ul');
  ['带着你的积累进入任务', '沿来源核验，减少凭空回答', '每次行动都让大脑更厚'].forEach(t => neuList.append(el('li', '', t)));
  neu.append(neuList);
  vs.append(old, neu);
  brainCard.append(layers, vs,
    el('p', 'idea-note', '“没连第二大脑的 AI，跟豆包没什么区别。” 第二大脑是个人与组织持续积累、可追溯、可被 AI 使用和维护的知识与经验体系。'));

  /* ---------- 4. 四模块工作循环 ---------- */
  const loopCard = el('div', 'idea-card');
  const loopWrap = el('div', 'loop-wrap');
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 400 400');
  svg.setAttribute('class', 'loop-svg');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', '超级个体四模块工作循环：工作台、第二大脑、工具、圈子');
  const defs = document.createElementNS(NS, 'defs');
  defs.innerHTML = '<marker id="loop-arrow" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#4c7a3f"/></marker>';
  svg.append(defs);
  const cx = 200, cy = 200, R = 132;
  const loopNodes = [
    { key: 'workbench', name: '工作台', sub: '提出目标', angle: -90, ico: '🎯', who: '人 + 分身', info: '工作的起点与终点。你提出想法、安排任务、查看结果，也在这里继续思考。' },
    { key: 'brain', name: '第二大脑', sub: '调用经验', angle: 0, ico: '🧠', who: '个人超脑', info: '提供背景、依据、概念关系与操作经验。分身带着共同记忆进入任务。' },
    { key: 'tools', name: '工具', sub: '形成成果', angle: 90, ico: '🛠', who: 'CLI / MCP / API', info: '知识通过工具转化为行动：生成文档、跑脚本、做网页、出图。结果再进入大脑。' },
    { key: 'circle', name: '圈子', sub: '协作反馈', angle: 180, ico: '👥', who: '真人 + 分身', info: '围绕共同目标承担角色、分工交付、反馈并继续合作。家庭、学校、公司、项目都是圈子。' }
  ];
  const pos = a => {
    const r = a * Math.PI / 180;
    return [cx + R * Math.cos(r), cy + R * Math.sin(r)];
  };
  for (let i = 0; i < 4; i++) {
    const a1 = loopNodes[i].angle + 16, a2 = loopNodes[(i + 1) % 4].angle - 16;
    const [x1, y1] = pos(a1), [x2, y2] = pos(a2);
    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', `M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#9db98a');
    path.setAttribute('stroke-width', '2.5');
    path.setAttribute('marker-end', 'url(#loop-arrow)');
    svg.append(path);
  }
  const center = document.createElementNS(NS, 'g');
  const cc = document.createElementNS(NS, 'circle');
  cc.setAttribute('cx', cx); cc.setAttribute('cy', cy); cc.setAttribute('r', 52);
  cc.setAttribute('fill', '#23382b');
  center.append(cc);
  const ct1 = document.createElementNS(NS, 'text');
  ct1.setAttribute('x', cx); ct1.setAttribute('y', cy - 4); ct1.setAttribute('text-anchor', 'middle');
  ct1.setAttribute('fill', '#d3f77c'); ct1.setAttribute('font-size', '15'); ct1.setAttribute('font-weight', '700');
  ct1.textContent = '经验回流';
  const ct2 = document.createElementNS(NS, 'text');
  ct2.setAttribute('x', cx); ct2.setAttribute('y', cy + 16); ct2.setAttribute('text-anchor', 'middle');
  ct2.setAttribute('fill', '#cfd9b8'); ct2.setAttribute('font-size', '11');
  ct2.textContent = 'RSI · 越用越厚';
  center.append(ct1, ct2);
  svg.append(center);
  const dot = document.createElementNS(NS, 'circle');
  dot.setAttribute('r', 6); dot.setAttribute('fill', '#d3f77c');
  dot.setAttribute('stroke', '#23382b'); dot.setAttribute('stroke-width', '2');
  svg.append(dot);
  const nodeEls = [];
  loopNodes.forEach((n, i) => {
    const [x, y] = pos(n.angle);
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'loop-node' + (i === 0 ? ' active' : ''));
    g.setAttribute('tabindex', '0');
    g.setAttribute('role', 'button');
    g.setAttribute('aria-label', n.name + '：' + n.sub);
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', 42);
    c.setAttribute('fill', '#fbfbf6'); c.setAttribute('stroke', '#4c7a3f'); c.setAttribute('stroke-width', '2');
    g.append(c);
    const ico = document.createElementNS(NS, 'text');
    ico.setAttribute('x', x); ico.setAttribute('y', y - 8); ico.setAttribute('text-anchor', 'middle');
    ico.setAttribute('font-size', '18'); ico.textContent = n.ico;
    g.append(ico);
    const t = document.createElementNS(NS, 'text');
    t.setAttribute('x', x); t.setAttribute('y', y + 12); t.setAttribute('text-anchor', 'middle');
    t.textContent = n.name;
    g.append(t);
    const s = document.createElementNS(NS, 'text');
    s.setAttribute('x', x); s.setAttribute('y', y + 27); s.setAttribute('text-anchor', 'middle');
    s.setAttribute('class', 'loop-sub'); s.textContent = n.sub;
    g.append(s);
    const activate = () => setLoop(i);
    g.addEventListener('click', activate);
    g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
    svg.append(g);
    nodeEls.push(g);
  });
  const loopInfo = el('div', 'loop-info');
  const liTitle = el('h3'), liBody = el('p'), liWho = el('p', 'loop-who');
  loopInfo.append(liTitle, liBody, liWho);
  function setLoop(i) {
    nodeEls.forEach((g, j) => g.classList.toggle('active', j === i));
    const n = loopNodes[i];
    liTitle.textContent = n.ico + ' ' + n.name + ' · ' + n.sub;
    liBody.textContent = n.info;
    liWho.textContent = '承担者：' + n.who;
  }
  setLoop(0);
  loopWrap.append(svg, loopInfo);
  loopCard.append(loopWrap, el('p', 'loop-hint', '点四个节点看各自职责。提出目标 → 调用经验 → 形成成果 → 协作反馈 → 经验回流，连起来就是一个超级个体的日常。'));
  let loopT = 0, loopRaf = 0;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  function loopFrame() {
    loopT = (loopT + 0.0035) % 1;
    const a = (-90 + loopT * 360) * Math.PI / 180;
    dot.setAttribute('cx', cx + R * Math.cos(a));
    dot.setAttribute('cy', cy + R * Math.sin(a));
    loopRaf = requestAnimationFrame(loopFrame);
  }
  function startLoop() { if (!reduce.matches && !loopRaf) loopRaf = requestAnimationFrame(loopFrame); }
  function stopLoop() { cancelAnimationFrame(loopRaf); loopRaf = 0; }
  if (reduce.matches) { const [x, y] = pos(-90); dot.setAttribute('cx', x); dot.setAttribute('cy', y); }
  else if ('IntersectionObserver' in window) {
    new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? startLoop() : stopLoop()), { threshold: 0.2 }).observe(svg);
  } else startLoop();

  /* ---------- 组装 ---------- */
  if (rootIndividual) {
    const cta = el('div', 'idea-cta');
    const ctaPrimary = el('a', 'cta-primary', '下一课：第二大脑 →');
    ctaPrimary.href = '#lesson-2';
    ctaPrimary.dataset.gotoLesson = '2';
    cta.append(ctaPrimary);
    rootIndividual.append(
      el('p', 'idea-lead', '第 1 课先搞懂一件事：什么是超级个体。它不是一个更厉害的聊天机器人，而是“碳基的你 + 硅基的你”的融合体。'),
      block('1', '什么是超级个体', '碳基的我 <em>+</em> 硅基的我', '一个人拥有数字记忆，拥有能调用记忆替自己行动的分身，再通过这些分身与其他人和组织发生关系。', fusion),
      block('2', '怎样一步步成为', '成长的<em>四个阶段</em>', '从自己打字，到拥有很多分身，再到做出 AI 原生产品。点每一阶段看它解决什么、配图什么样。', stageCard),
      cta
    );
  }
  if (rootBrain) {
    const cta = el('div', 'idea-cta');
    const ctaPrimary = el('a', 'cta-primary', '▶ 下一课：进真实 AIChat 跑一遍');
    ctaPrimary.href = '#lesson-3';
    ctaPrimary.dataset.gotoLesson = '3';
    cta.append(ctaPrimary);
    rootBrain.append(
      el('p', 'idea-lead', '第 2 课讲清超级个体的“硅基部分”：第二大脑长什么样、四个模块怎样循环工作。懂了这两张图，第 3 课的演示就一目了然。'),
      block('1', '什么是第二大脑', '不是网盘，是<em>会长大的经验</em>', '第二大脑是个人与组织持续积累、可追溯、可被 AI 使用和维护的知识与经验体系。它分三层。', brainCard),
      block('2', '超级个体怎么工作', '四个模块，<em>一个循环</em>', '工作台、第二大脑、工具、圈子。提出目标 → 调用经验 → 形成成果 → 协作反馈 → 经验回流。', loopCard),
      cta
    );
  }
})();