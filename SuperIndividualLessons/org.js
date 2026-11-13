'use strict';
// 第 4 课：超级组织。来源：_wiki/concepts/ai-native-company.md、second-brain.md、
// notes/Xizhi's Diary/2026.10.28 碳基与硅基的融合、docs/2026/xiaoetong-trust-sharing。
// 组织形态与商业判断标注为理念推演；CAIO 定价等为口述口径，非合同承诺。
(function () {
  const root = document.getElementById('org');
  if (!root) return;
  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
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

  /* ---------- 1. 超级个体 → 超级团队 → 超级公司 ---------- */
  const evoCard = el('div', 'idea-card');
  const evo = el('div', 'org-evolution');
  const evoData = [
    {
      ico: '🧍', title: '超级个体', sub: '形成能力',
      brief: '碳基真人 + 硅基分身，共享一个个人超脑。',
      detail: '一个人带着第二大脑与多个分身工作：分身进入不同圈子承担角色，经验经核验回流个人超脑。能力不再受“一个人一天 24 小时”限制。',
      note: '第 1–3 课讲的就是这一层。'
    },
    {
      ico: '👥', title: '超级团队', sub: '共同交付',
      brief: '真人与分身围绕项目组成圈子，共同交付。',
      detail: '一个项目或一项长期业务形成一个圈子。参与者既有人，也有人的分身；一个超级个体可以同时在多个圈子里贡献能力。圈子有直接负责人——可以是真人，也可以是真人的分身——统一协调分工、冲突与衔接。',
      note: '来源：2026.10.28 日记“从岗位组织，到圈子组织”。'
    },
    {
      ico: '🏢', title: '超级公司', sub: '连接经营',
      brief: '连接团队、复用共同知识与经营资源。',
      detail: '公司成为一群超级个体连接、协作和共享经验的全新组织形态：组织内部共享组织脑，分身把个人带进组织，也把协作经验带回个人。足够强大的分身还可以被外部组织雇佣——同一个私人大脑可以容纳多家公司的公共大脑。',
      note: '跨组织雇佣为组织形态推论，尚不等于雇佣市场已交付。'
    }
  ];
  const evoDetail = el('div', 'org-detail');
  const evoBtns = [];
  function selectEvo(i) {
    const d = evoData[i];
    evoBtns.forEach((x, j) => x.setAttribute('aria-pressed', String(j === i)));
    evoDetail.replaceChildren();
    evoDetail.append(el('b', '', d.ico + ' ' + d.title + ' · ' + d.sub + ' '), document.createTextNode(d.detail), el('small', '', d.note));
  }
  evoData.forEach((d, i) => {
    if (i > 0) evo.append(el('span', 'org-arrow', '→'));
    const b = el('button', 'org-stage');
    b.type = 'button';
    b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
    b.append(el('span', 'os-ico', d.ico), el('h3', '', d.title + ' · ' + d.sub), el('p', '', d.brief));
    b.addEventListener('click', () => selectEvo(i));
    evo.append(b);
    evoBtns.push(b);
  });
  selectEvo(0);
  evoCard.append(evo, evoDetail,
    el('p', 'idea-note', '演进链：超级个体形成能力 → 超级团队共同交付 → 超级公司连接团队并持续经营。点每一级看它的组织方式。'));

  /* ---------- 2. 岗位组织 vs 圈子组织 ---------- */
  const vsCard = el('div', 'idea-card');
  const vs = el('div', 'org-vs');
  const oldOrg = el('div', 'ov-old');
  oldOrg.append(el('h4', '', '过去：岗位组织'));
  const oldList = el('ul');
  ['一个人占一个位置，承担一组职责', '角色靠同一个肉身切换', '经验散落在个人脑子里，人走经验走', '跨部门协作靠层层汇报'].forEach(t => oldList.append(el('li', '', t)));
  oldOrg.append(oldList);
  const newOrg = el('div', 'ov-new');
  newOrg.append(el('h4', '', '未来：圈子组织'));
  const newList = el('ul');
  ['围绕项目 / 业务形成圈子，角色灵活变化', '不同分身进入不同圈子，同时贡献能力', '共同知识进组织脑，经验持续积累', '直接负责人（真人或分身）协调冲突与衔接'].forEach(t => newList.append(el('li', '', t)));
  newOrg.append(newList);
  vs.append(oldOrg, newOrg);
  vsCard.append(vs, el('p', 'idea-note', '家庭是圈子，学校是圈子，公司和项目也是圈子。一个人的分身可以同时参与许多圈子，而它们最终连接的是同一个个人超脑。'));

  /* ---------- 3. 信任网络 ---------- */
  const trustCard = el('div', 'idea-card');
  const trust = el('div', 'trust-grid');
  [
    ['🪪', '它是谁的分身', '每个分身背后连接一个超级个体的数字大脑，身份可追溯。'],
    ['🔑', '被授权做什么', '分身按角色和授权使用内容；共同记忆与圈子边界同时存在。'],
    ['📦', '完成过什么', '交付、验收、付费、复购与再次委托，用实际行动和钱投票。'],
    ['🧭', '遇到问题找谁', '圈子的直接负责人组织解决；履约记录让信任继续积累。']
  ].forEach(([ico, title, body]) => {
    const item = el('div', 'trust-item');
    const s = el('strong'); s.append(document.createTextNode(ico + ' ' + title));
    item.append(s, el('span', '', body));
    trust.append(item);
  });
  trustCard.append(trust,
    el('p', 'idea-note', '当分身与分身相遇，凭什么把任务交给它？信任落到具体事情上：认识、共同做过事、积累了经验，才形成可以继续合作的关系。'),
    el('p', 'idea-boundary', '两个相连的方向：帮每个人持续积累第二大脑；帮这些人的分身建立可信的社交网络。跨组织信任网络与分身雇佣市场为发展方向判断，非已交付能力。'));

  /* ---------- 4. CAIO ---------- */
  const caioCard = el('div', 'caio-card');
  const caioLeft = el('div', 'caio-left');
  caioLeft.append(
    el('span', 'cl-badge', 'NEW ROLE · 新岗位'),
    el('h3', '', 'CAIO'),
    el('p', '', 'Chief AI Officer · 首席人工智能官。不是又一个 SaaS，而是把“第二大脑 + 方法论”包装成企业里的一个新岗位，与 CEO 一起做 AI 化转型。'),
    el('p', 'cl-quote', '“CIO 管信息，CAIO 与 CEO 一起做企业 AI 化转型。”'),
    el('p', '', '交付形态：我方分身（第二大脑）+ 一名真人助理，驻场解决一两个真实问题，按月签约。')
  );
  const caioRight = el('div', 'caio-right');
  caioRight.append(el('h4', '', 'CAIO 的四件事交付'));
  const steps = el('div', 'caio-steps');
  [
    ['①', '建工作台', '让企业从“提目标”开始工作，而不是在菜单里点完全部操作。'],
    ['②', '建知识图谱', '整理企业第二大脑：原始信源 → 约 200 节点知识地图 → 维护规则。'],
    ['③', '搭 AI 工具集', 'CLI + Skill 封装高频操作，旧后台退为结果呈现 + 人审确认。'],
    ['④', '建圈子', '按超级公司方式重搭组织：真人 + 分身围绕业务承担角色。']
  ].forEach(([num, title, body]) => {
    const s = el('div', 'caio-step');
    s.append(el('b', '', num));
    const d = el('div');
    d.append(el('strong', '', title), el('span', '', body));
    s.append(d);
    steps.append(s);
  });
  caioRight.append(steps,
    el('p', 'caio-note', '口径说明：分身 token 费与助理月薪为创始人口述定价（月签），尚无合同模板与已交付案例背书；面向中小企业，“一单 1 万、可做量”是商业设想，非承诺。'));
  caioCard.append(caioLeft, caioRight);

  /* ---------- 5. FDE 三步交付 ---------- */
  const fdeCard = el('div', 'idea-card');
  const fde = el('div', 'fde-steps');
  [
    ['做成一个真实任务', 'FDE（前线部署工程师）陪使用者跑通第一个现场任务：真实材料、真实验收，不是演示样例。'],
    ['改变条件再做一次', '换一份新材料、换一个约束，验证方法能迁移；把发现的遗漏写成规则，让分身复跑。'],
    ['让客户独立更新与完成', '使用者自己更新资料、完成任务、指出出处。买的是“实际用起来、能持续维护”的工作方式。']
  ].forEach(([title, body]) => {
    const s = el('div', 'fde-step');
    s.append(el('h4', '', title), el('p', '', body));
    fde.append(s);
  });
  fdeCard.append(fde,
    el('p', 'idea-note', 'FDE 按项目交付，CAIO 持续协助组织采用与维护。服务以业务结果和员工采用为验收依据——你在第 3 课任务卡里填的“试点卡”，就是这套交付的起点。'));

  /* ---------- 组装 ---------- */
  root.append(
    el('p', 'idea-lead', '第 4 课把镜头拉远：当每个人都成为超级个体，团队、公司和商业关系会怎样重组？这一课讲理念推演与正在探索的岗位形态。'),
    block('1', '组织怎样演进', '个体 → 团队 → <em>公司</em>', '超级个体形成能力，超级团队共同交付，超级公司连接团队、复用共同知识与经营资源。', evoCard),
    block('2', '组织方式的变化', '从岗位，到<em>圈子</em>', '当一个人拥有多个分身，公司的组织方式也会改变。', vsCard),
    block('3', '协作的基础', '分身之间的<em>信任网络</em>', '人与分身共同进入社交网络后，信任成为合作的门槛，也是最大的机会。', trustCard),
    block('4', '一个新岗位', 'CAIO：把第二大脑<em>卖成岗位</em>', '不是卖软件，而是派“分身 + 真人助理”进企业，做四件事、解决真实问题。', caioCard),
    block('5', '怎样交付', 'FDE 的<em>三步验收</em>', '做成一个真实任务 → 改变条件再做一次 → 让客户独立更新与完成。', fdeCard),
    el('p', 'idea-boundary', '本课时间判断（2027–2029 个人数字化、2036 文明共同记忆）与跨组织市场为创始人愿景与推演；CAIO 定价为口述口径。学习时区分“理念方向”与“已交付能力”。')
  );
})();